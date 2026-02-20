import type { Express } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage.js";
import { authSignupSchema, authLoginSchema, insertQuestionSchema, insertQuizSessionSchema, insertQuizAnswerSchema } from "../shared/schema.js";
import { createVirtualAccount, reallocateVirtualAccount, deactivateVirtualAccount, reactivateVirtualAccount } from "./psb-service.js";
import { getUncachableSendGridClient } from "./sendgrid.js";
import { initializeTransaction, verifyTransaction } from "./paystack.js";
import type { Winner } from "../shared/schema.js";

const ADMIN_NOTIFICATION_EMAIL = "wazosportswinners@gmail.com";

// Check and process referral qualification when user funds wallet
async function checkReferralQualification(userId: string, fundedAmount: number) {
  try {
    // Get the referral where this user is the referee
    const referral = await storage.getReferralByRefereeId(userId);
    if (!referral || referral.status !== 'pending') {
      return; // No pending referral for this user
    }

    // Get referral settings
    let settings = await storage.getReferralSettings();
    if (!settings) {
      // Create default settings if none exist
      settings = await storage.createReferralSettings({
        rewardAmount: "200",
        minimumFunding: "500",
        autoRewardEnabled: true,
        isActive: true,
      });
    }

    if (!settings.isActive) {
      return; // Referral program is disabled
    }

    const minimumFunding = parseFloat(settings.minimumFunding);
    
    // Check if user has funded at least the minimum amount
    const wallet = await storage.getWallet(userId);
    if (!wallet) return;
    
    const totalFunded = parseFloat(wallet.totalFunded);
    if (totalFunded < minimumFunding) {
      return; // Not enough funding yet
    }

    // Mark referral as qualified
    await storage.updateReferral(referral.id, {
      status: 'qualified',
      qualifiedAt: new Date(),
    });

    // If auto-reward is enabled, process the reward immediately
    if (settings.autoRewardEnabled) {
      await processReferralReward(referral.id, settings);
    }
  } catch (error) {
    console.error('Error checking referral qualification:', error);
  }
}

// Process referral reward - credit referrer's wallet
async function processReferralReward(referralId: string, settings?: any) {
  try {
    const referral = await storage.getReferral(referralId);
    if (!referral || referral.status === 'rewarded') {
      return; // Already rewarded or not found
    }

    if (!settings) {
      settings = await storage.getReferralSettings();
    }
    
    if (!settings) return;

    const rewardAmount = parseFloat(settings.rewardAmount);
    
    // Get referrer's wallet
    const referrerWallet = await storage.getWallet(referral.referrerId);
    if (!referrerWallet) return;

    // Credit referrer's wallet
    const currentBalance = parseFloat(referrerWallet.balance);
    await storage.updateWallet(referrerWallet.id, {
      balance: String(currentBalance + rewardAmount),
    });

    // Create wallet transaction for the reward
    const transaction = await storage.createWalletTransaction({
      walletId: referrerWallet.id,
      type: 'credit',
      amount: String(rewardAmount),
      description: `Referral reward - User completed qualification`,
      status: 'completed',
      source: 'referral',
    });

    // Update referral status to rewarded
    await storage.updateReferral(referralId, {
      status: 'rewarded',
      rewardedAt: new Date(),
      rewardAmount: String(rewardAmount),
      rewardTransactionId: transaction.id,
    });

    console.log(`Referral reward of ₦${rewardAmount} credited to user ${referral.referrerId}`);
  } catch (error) {
    console.error('Error processing referral reward:', error);
  }
}

async function sendWinnerNotificationEmail(winner: Winner) {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const emailContent = {
      to: ADMIN_NOTIFICATION_EMAIL,
      from: fromEmail,
      subject: `New Winner Alert: ${winner.prizeName}`,
      html: `
        <h2>New Prize Winner</h2>
        <p><strong>Prize:</strong> ${winner.prizeName}</p>
        <p><strong>Prize Type:</strong> ${winner.prizeType}</p>
        <p><strong>Prize Value:</strong> ${winner.prizeValue ? `₦${winner.prizeValue}` : 'N/A'}</p>
        <hr />
        <h3>Winner Details</h3>
        <p><strong>Name:</strong> ${winner.userFullName || 'Not provided'}</p>
        <p><strong>Email:</strong> ${winner.userEmail}</p>
        <p><strong>Phone:</strong> ${winner.userPhone || 'Not provided'}</p>
        <h4>Bank Details</h4>
        <p><strong>Bank:</strong> ${winner.userBankName || 'Not provided'}</p>
        <p><strong>Account Name:</strong> ${winner.userBankAccountName || 'Not provided'}</p>
        <p><strong>Account Number:</strong> ${winner.userBankAccountNumber || 'Not provided'}</p>
        <hr />
        <p><small>Won at: ${new Date().toLocaleString()}</small></p>
      `
    };
    
    await client.send(emailContent);
    await storage.updateWinner(winner.id, { emailSent: true, emailSentAt: new Date() });
    console.log(`Winner notification email sent to ${ADMIN_NOTIFICATION_EMAIL}`);
  } catch (error) {
    console.error("Error sending winner notification email:", error);
  }
}

export function registerRoutes(app: Express) {
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = authSignupSchema.parse(req.body);
      const existingProfile = await storage.getProfileByEmail(validatedData.email);
      
      if (existingProfile) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Check if referral code was provided and validate it
      let referrer: any = null;
      if (validatedData.referralCode) {
        referrer = await storage.getProfileByReferralCode(validatedData.referralCode);
        if (!referrer) {
          return res.status(400).json({ error: "Invalid referral code" });
        }
      }

      const passwordHash = await bcrypt.hash(validatedData.password, 10);

      // Generate unique referral code for new user (6 chars alphanumeric)
      const generateReferralCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };
      
      let userReferralCode = generateReferralCode();
      // Ensure uniqueness
      while (await storage.getProfileByReferralCode(userReferralCode)) {
        userReferralCode = generateReferralCode();
      }

      const profile = await storage.createProfile({
        email: validatedData.email,
        passwordHash,
        fullName: validatedData.fullName,
        sex: validatedData.sex || null,
        phoneNumber: validatedData.phoneNumber || null,
        location: validatedData.location || null,
        isAdmin: false,
        referralCode: userReferralCode,
        referredBy: referrer ? referrer.id : null,
      });
      
      await storage.createWallet({ userId: profile.id, balance: "0", totalFunded: "0" });
      await storage.createUserPoints({ userId: profile.id, points: 0, totalEarned: 0, totalSpent: 0 });
      
      // If user was referred, create referral record
      if (referrer) {
        await storage.createReferral({
          referrerId: referrer.id,
          refereeId: profile.id,
          referralCode: validatedData.referralCode!,
          status: 'pending',
        });
      }
      
      const { passwordHash: _, ...safeProfile } = profile;
      res.json({ profile: safeProfile });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = authLoginSchema.parse(req.body);
      const profile = await storage.getProfileByEmail(validatedData.email);
      
      if (!profile) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      if (!profile.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(validatedData.password, profile.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      const { passwordHash: _, ...safeProfile } = profile;
      res.json({ profile: safeProfile });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Combined dashboard data endpoint for faster loading
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Fetch all dashboard data in parallel
      const [points, sessions, spins, winners, referralStats] = await Promise.all([
        storage.getUserPoints(userId),
        storage.getUserQuizSessions(userId),
        storage.getUserWheelSpins(userId),
        storage.getAllWinners(),
        (async () => {
          const profile = await storage.getProfile(userId);
          if (!profile) return null;
          
          const referrals = await storage.getUserReferrals(userId);
          const referralsWithDetails = await Promise.all(
            referrals.map(async (ref: any) => {
              const referee = await storage.getProfile(ref.refereeId);
              const refereeWallet = await storage.getWallet(ref.refereeId);
              return {
                ...ref,
                refereeName: referee?.fullName || 'Unknown',
                refereeEmail: referee?.email || '',
                refereeFundedAmount: refereeWallet?.totalFunded || '0',
              };
            })
          );
          
          return {
            referralCode: profile.referralCode,
            referralLink: `https://wazosports.com/signup?ref=${profile.referralCode}`,
            stats: {
              totalReferrals: referrals.length,
              qualifiedReferrals: referrals.filter((r: any) => r.status === 'qualified' || r.status === 'rewarded').length,
              rewardedReferrals: referrals.filter((r: any) => r.status === 'rewarded').length,
              totalEarned: referrals.filter((r: any) => r.status === 'rewarded').reduce((sum: number, r: any) => sum + parseFloat(r.rewardAmount || '0'), 0),
            },
            referrals: referralsWithDetails,
          };
        })(),
      ]);

      res.json({
        points,
        sessions: sessions.slice(0, 5), // Only last 5 sessions
        spins: spins.slice(0, 5), // Only last 5 spins
        winners: winners.slice(0, 10), // Only last 10 winners
        referral: referralStats,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Profiles
  app.get("/api/profile/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/profile/:id", async (req, res) => {
    try {
      const updates = req.body;
      const profile = await storage.updateProfile(req.params.id, updates);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/profile/:id/password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      const profile = await storage.getProfile(req.params.id);
      if (!profile || !profile.passwordHash) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const isValid = await bcrypt.compare(currentPassword, profile.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateProfile(req.params.id, { passwordHash: newPasswordHash });

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Wallets
  app.get("/api/wallet/:userId", async (req, res) => {
    try {
      let wallet = await storage.getWallet(req.params.userId);
      if (!wallet) {
        // Auto-create wallet for existing users who don't have one
        const profile = await storage.getProfile(req.params.userId);
        if (!profile) {
          return res.status(404).json({ error: "User not found" });
        }
        // Create wallet for this user
        wallet = await storage.createWallet({
          userId: req.params.userId,
          balance: "0",
          totalFunded: "0",
        });
        // Also ensure user has points record
        const points = await storage.getUserPoints(req.params.userId);
        if (!points) {
          await storage.createUserPoints({
            userId: req.params.userId,
            pointsBalance: 0,
            totalEarned: 0,
            totalSpent: 0,
          });
        }
      }
      res.json(wallet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/wallet/:walletId/transactions", async (req, res) => {
    try {
      const transactions = await storage.getWalletTransactions(req.params.walletId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Questions
  app.get("/api/questions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const questions = await storage.getActiveQuestions(limit);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/questions/all", async (_req, res) => {
    try {
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const validatedData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(validatedData);
      res.json(question);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/questions/:id", async (req, res) => {
    try {
      const updates = req.body;
      const question = await storage.updateQuestion(req.params.id, updates);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/questions/:id", async (req, res) => {
    try {
      await storage.deleteQuestion(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Quiz Sessions
  const QUIZ_COST = 100;
  
  app.post("/api/quiz/start", async (req, res) => {
    try {
      const validatedData = insertQuizSessionSchema.parse(req.body);
      
      // Check and deduct wallet balance
      const wallet = await storage.getWallet(validatedData.userId);
      if (!wallet) {
        return res.status(400).json({ error: "Wallet not found" });
      }
      
      const currentBalance = parseFloat(wallet.balance);
      if (currentBalance < QUIZ_COST) {
        return res.status(400).json({ error: "Insufficient balance. Please fund your wallet." });
      }

      // Deduct quiz cost
      const newBalance = currentBalance - QUIZ_COST;
      await storage.updateWallet(wallet.id, { balance: newBalance.toString() });
      
      // Record transaction
      await storage.createWalletTransaction({
        walletId: wallet.id,
        type: "quiz_payment",
        amount: (-QUIZ_COST).toString(),
        description: "Quiz session payment",
      });

      const session = await storage.createQuizSession(validatedData);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/quiz/session/:id", async (req, res) => {
    try {
      const session = await storage.getQuizSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/quiz/user/:userId", async (req, res) => {
    try {
      const sessions = await storage.getUserQuizSessions(req.params.userId);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/quiz/answer", async (req, res) => {
    try {
      const validatedData = insertQuizAnswerSchema.parse(req.body);
      const answer = await storage.createQuizAnswer(validatedData);
      res.json(answer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/quiz/session/:id", async (req, res) => {
    try {
      const updates = req.body;
      
      // Convert completedAt string to Date if present
      if (updates.completedAt && typeof updates.completedAt === 'string') {
        updates.completedAt = new Date(updates.completedAt);
      }
      
      const session = await storage.updateQuizSession(req.params.id, updates);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // If session completed and points earned, update user points
      if (updates.status === 'completed' && updates.pointsEarned > 0) {
        const userPoints = await storage.getUserPoints(session.userId);
        if (userPoints) {
          await storage.updateUserPoints(session.userId, {
            points: userPoints.points + updates.pointsEarned,
            totalEarned: userPoints.totalEarned + updates.pointsEarned,
          });
        }
      }
      
      res.json(session);
    } catch (error: any) {
      console.error('Quiz session update error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // User Points
  app.get("/api/points/:userId", async (req, res) => {
    try {
      const points = await storage.getUserPoints(req.params.userId);
      if (!points) {
        return res.status(404).json({ error: "Points not found" });
      }
      res.json(points);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Prizes
  app.get("/api/prizes", async (_req, res) => {
    try {
      const prizes = await storage.getActivePrizes();
      res.json(prizes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/prizes/all", async (_req, res) => {
    try {
      const prizes = await storage.getAllPrizes();
      res.json(prizes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/prizes", async (req, res) => {
    try {
      const prize = await storage.createPrize(req.body);
      res.json(prize);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/prizes/:id", async (req, res) => {
    try {
      const updates = req.body;
      const prize = await storage.updatePrize(req.params.id, updates);
      if (!prize) {
        return res.status(404).json({ error: "Prize not found" });
      }
      res.json(prize);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/prizes/:id", async (req, res) => {
    try {
      await storage.deletePrize(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Wheel Spins
  app.post("/api/wheel/spin", async (req, res) => {
    try {
      const { userId } = req.body;
      const POINTS_REQUIRED = 5;
      
      // Check user points
      const userPoints = await storage.getUserPoints(userId);
      if (!userPoints || userPoints.points < POINTS_REQUIRED) {
        return res.status(400).json({ error: `Insufficient points. You need ${POINTS_REQUIRED} points to spin.` });
      }
      
      // Deduct points
      await storage.updateUserPoints(userId, {
        points: userPoints.points - POINTS_REQUIRED,
        totalSpent: userPoints.totalSpent + POINTS_REQUIRED
      });
      
      // Get active prizes
      const prizes = await storage.getActivePrizes();
      if (prizes.length === 0) {
        // Refund points if no prizes available
        await storage.updateUserPoints(userId, {
          points: userPoints.points,
          totalSpent: userPoints.totalSpent
        });
        return res.status(400).json({ error: "No active prizes available" });
      }

      // Check if this is the user's first spin - prevent winning on first spin
      const previousSpins = await storage.getUserWheelSpins(userId);
      const isFirstSpin = previousSpins.length === 0;
      
      let selectedPrize;
      
      if (isFirstSpin) {
        // First spin: only allow non-winning prizes (thank_you or retry)
        const nonWinningPrizes = prizes.filter(p => 
          p.prizeType === 'thank_you' || p.prizeType === 'retry'
        );
        
        if (nonWinningPrizes.length > 0) {
          // Weighted selection among non-winning prizes
          const totalWeight = nonWinningPrizes.reduce((sum, p) => sum + p.probabilityWeight, 0);
          let random = Math.random() * totalWeight;
          selectedPrize = nonWinningPrizes[0];
          
          for (const prize of nonWinningPrizes) {
            random -= prize.probabilityWeight;
            if (random <= 0) {
              selectedPrize = prize;
              break;
            }
          }
        } else {
          // Fallback to first prize if no non-winning prizes exist
          selectedPrize = prizes[0];
        }
      } else {
        // Normal weighted random selection for subsequent spins
        const totalWeight = prizes.reduce((sum, p) => sum + p.probabilityWeight, 0);
        let random = Math.random() * totalWeight;
        selectedPrize = prizes[0];

        for (const prize of prizes) {
          random -= prize.probabilityWeight;
          if (random <= 0) {
            selectedPrize = prize;
            break;
          }
        }
      }

      // Check daily limit
      const today = new Date();
      if (selectedPrize.dailyLimit) {
        const dailyLimit = await storage.getDailyLimit(selectedPrize.id, today);
        if (dailyLimit && dailyLimit.winnersCount >= selectedPrize.dailyLimit) {
          // Return "Thank You" prize if limit reached
          const thankYouPrize = prizes.find(p => p.prizeType === 'thank_you');
          if (thankYouPrize) {
            selectedPrize = thankYouPrize;
          }
        }
      }

      // Create wheel spin record
      const spin = await storage.createWheelSpin({
        userId,
        prizeId: selectedPrize.id,
        prizeName: selectedPrize.prizeName,
        prizeValue: selectedPrize.prizeValue || null,
        status: "pending"
      });

      // Update daily limit
      if (selectedPrize.dailyLimit && selectedPrize.prizeType !== 'thank_you') {
        const dailyLimit = await storage.getDailyLimit(selectedPrize.id, today);
        if (dailyLimit) {
          await storage.updateDailyLimit(dailyLimit.id, dailyLimit.winnersCount + 1);
        } else {
          await storage.createDailyLimit({
            prizeId: selectedPrize.id,
            date: today,
            winnersCount: 1
          });
        }
      }

      // Handle prize type - Record winners for cash and item prizes
      if (selectedPrize.prizeType === 'cash' || selectedPrize.prizeType === 'item') {
        // Get user profile for winner record
        const profile = await storage.getProfile(userId);
        if (profile) {
          // Create winner record
          const winner = await storage.createWinner({
            userId,
            spinId: spin.id,
            prizeType: selectedPrize.prizeType,
            prizeName: selectedPrize.prizeName,
            prizeValue: selectedPrize.prizeValue || null,
            userEmail: profile.email,
            userFullName: profile.fullName || null,
            userPhone: profile.phoneNumber || null,
            userBankName: profile.bankName || null,
            userBankAccountName: profile.bankAccountName || null,
            userBankAccountNumber: profile.bankAccountNumber || null,
            status: "pending",
            emailSent: false
          });
          
          // Send email notification to admin
          await sendWinnerNotificationEmail(winner);
          
          await storage.updateWheelSpin(spin.id, { status: "pending" });
        }
      }

      // Handle Free Spin (retry) prize - award 5 points
      if (selectedPrize.prizeType === 'retry') {
        const FREE_SPIN_POINTS = 5;
        const currentPoints = await storage.getUserPoints(userId);
        if (currentPoints) {
          await storage.updateUserPoints(userId, {
            points: currentPoints.points + FREE_SPIN_POINTS,
            totalEarned: currentPoints.totalEarned + FREE_SPIN_POINTS
          });
          await storage.updateWheelSpin(spin.id, { status: "processed" });
        }
      }
      
      // Handle thank_you prize - just mark as processed
      if (selectedPrize.prizeType === 'thank_you') {
        await storage.updateWheelSpin(spin.id, { status: "processed" });
      }

      res.json({ spin, prize: selectedPrize });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/wheel/spins/:userId", async (req, res) => {
    try {
      const spins = await storage.getUserWheelSpins(req.params.userId);
      res.json(spins);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Payment Transactions
  app.get("/api/payments/:userId", async (req, res) => {
    try {
      const transactions = await storage.getUserPaymentTransactions(req.params.userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payments/create-virtual-account", async (req, res) => {
    try {
      const { amount, userId, userName } = req.body;
      
      if (!amount || !userId || !userName) {
        return res.status(400).json({ error: "Missing required fields: amount, userId, userName" });
      }

      const reference = `SQ${Date.now()}${userId.substring(0, 8)}`;
      let psbResponse;
      let usedReallocation = false;
      
      try {
        // First, try to create a new virtual account
        psbResponse = await createVirtualAccount({
          amount: parseFloat(amount),
          customerName: userName,
          reference,
          description: "Wallet Funding",
        });
      } catch (createError: any) {
        console.log("Virtual account creation failed, attempting reallocation:", createError.message);
        
        // If creation fails, try to reallocate an existing account
        const reusableAccount = await storage.getReusableVirtualAccount();
        
        if (reusableAccount && reusableAccount.virtualAccountNumber) {
          try {
            psbResponse = await reallocateVirtualAccount({
              accountNumber: reusableAccount.virtualAccountNumber,
              newReference: reference,
              amount: parseFloat(amount),
              customerName: userName,
              description: "Wallet Funding",
            });
            usedReallocation = true;
            console.log("Successfully reallocated virtual account:", reusableAccount.virtualAccountNumber);
          } catch (reallocateError: any) {
            console.error("Reallocation also failed:", reallocateError.message);
            throw createError; // Throw the original error if reallocation also fails
          }
        } else {
          throw createError; // No reusable accounts available
        }
      }

      if (!psbResponse.customer?.account) {
        throw new Error("Failed to get virtual account details from 9PSB");
      }

      const expiresAt = psbResponse.customer.account.expiry?.date 
        ? new Date(psbResponse.customer.account.expiry.date)
        : new Date(Date.now() + 60 * 60 * 1000);

      const transaction = await storage.createPaymentTransaction({
        userId,
        reference,
        amount: amount.toString(),
        status: "pending",
        virtualAccountNumber: psbResponse.customer.account.number,
        virtualAccountName: psbResponse.customer.account.name,
        virtualAccountBank: psbResponse.customer.account.bank,
        expiresAt,
      });

      res.json({ 
        success: true,
        data: {
          accountNumber: transaction.virtualAccountNumber,
          accountName: transaction.virtualAccountName,
          bankName: transaction.virtualAccountBank,
          amount: transaction.amount,
          reference: transaction.reference,
          expiresAt: transaction.expiresAt,
          reallocated: usedReallocation
        }
      });
    } catch (error: any) {
      console.error("Virtual account creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payments/psb-webhook", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Basic ")) {
        console.error("9PSB Webhook: Missing or invalid Authorization header");
        return res.status(401).json({ success: false, status: "error", code: "401", message: "Unauthorized" });
      }

      const webhookUsername = process.env.PSB_WEBHOOK_USERNAME;
      const webhookPassword = process.env.PSB_WEBHOOK_PASSWORD;

      if (!webhookUsername || !webhookPassword) {
        console.error("9PSB Webhook: Credentials not configured on server");
        return res.status(500).json({ success: false, status: "error", code: "99", message: "Server configuration error" });
      }

      const base64Credentials = authHeader.split(" ")[1];
      const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
      const [username, password] = credentials.split(":");

      if (username !== webhookUsername || password !== webhookPassword) {
        console.error("9PSB Webhook: Invalid credentials");
        return res.status(401).json({ success: false, status: "error", code: "401", message: "Invalid credentials" });
      }

      const { 
        accountnumber,
        sessionid 
      } = req.body;

      console.log("9PSB Webhook received:", req.body);

      const transaction = await storage.getPaymentTransactionByAccount(accountnumber);
      
      if (!transaction) {
        console.error("Payment transaction not found for account:", accountnumber);
        return res.json({ success: true, status: "success", code: "00", message: "Acknowledged" });
      }

      if (transaction.status !== "pending") {
        console.log("Transaction already processed:", transaction.reference);
        return res.json({ success: true, status: "success", code: "00", message: "Acknowledged" });
      }

      await storage.updatePaymentTransaction(transaction.id, {
        status: "completed",
        sessionId: sessionid,
        completedAt: new Date(),
      });

      const wallet = await storage.getWallet(transaction.userId);
      if (wallet) {
        const newBalance = parseFloat(wallet.balance) + parseFloat(transaction.amount);
        const newTotalFunded = parseFloat(wallet.totalFunded) + parseFloat(transaction.amount);
        
        await storage.updateWallet(wallet.id, {
          balance: newBalance.toString(),
          totalFunded: newTotalFunded.toString(),
        });

        await storage.createWalletTransaction({
          walletId: wallet.id,
          type: "credit",
          amount: transaction.amount,
          description: "Wallet funding via bank transfer",
          reference: transaction.reference,
          source: "9psb",
          status: "completed"
        });

        await checkReferralQualification(transaction.userId, parseFloat(transaction.amount));
      }

      console.log("9PSB Payment processed successfully:", transaction.reference);
      res.json({ success: true, status: "success", code: "00", message: "Acknowledged" });
    } catch (error: any) {
      console.error("9PSB Webhook processing error:", error);
      res.json({ success: true, status: "success", code: "00", message: "Acknowledged" });
    }
  });

  app.post("/api/payments/webhook", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      console.error("9PSB Webhook (legacy): Missing or invalid Authorization header");
      return res.status(401).json({ success: false, status: "error", code: "401", message: "Unauthorized" });
    }

    const webhookUsername = process.env.PSB_WEBHOOK_USERNAME;
    const webhookPassword = process.env.PSB_WEBHOOK_PASSWORD;

    if (!webhookUsername || !webhookPassword) {
      console.error("9PSB Webhook (legacy): Credentials not configured");
      return res.status(500).json({ success: false, status: "error", code: "99", message: "Server configuration error" });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [username, password] = credentials.split(":");

    if (username !== webhookUsername || password !== webhookPassword) {
      return res.status(401).json({ success: false, status: "error", code: "401", message: "Invalid credentials" });
    }

    req.url = "/api/payments/psb-webhook";
    req.app.handle(req, res);
  });

  app.get("/api/payments/status/:reference", async (req, res) => {
    try {
      const transaction = await storage.getPaymentTransaction(req.params.reference);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const profiles = await storage.getAllProfiles();
      const safeProfiles = profiles.map(({ passwordHash, ...rest }) => rest);
      res.json(safeProfiles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/users/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash, ...safeProfile } = profile;
      
      const wallet = await storage.getWallet(req.params.id);
      const points = await storage.getUserPoints(req.params.id);
      const quizSessions = await storage.getUserQuizSessions(req.params.id);
      const wheelSpins = await storage.getUserWheelSpins(req.params.id);
      const paymentTransactions = await storage.getUserPaymentTransactions(req.params.id);
      
      // Add passed field to quiz sessions based on correctAnswers >= 3
      const quizSessionsWithPassed = quizSessions.map(session => ({
        ...session,
        passed: session.correctAnswers >= 3,
        createdAt: session.startedAt
      }));
      
      res.json({
        profile: safeProfile,
        wallet,
        points,
        quizSessions: quizSessionsWithPassed,
        wheelSpins,
        paymentTransactions
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const profile = await storage.updateProfile(req.params.id, updates);
      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash, ...safeProfile } = profile;
      res.json(safeProfile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/wallets", async (req, res) => {
    try {
      const wallets = await storage.getAllWallets();
      res.json(wallets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/wallets/:id", async (req, res) => {
    try {
      const updates = req.body;
      const wallet = await storage.updateWallet(req.params.id, updates);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      res.json(wallet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPaymentTransactions();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/wallet-transactions", async (req, res) => {
    try {
      const { source, startDate, endDate, search } = req.query;
      
      const filters: {
        source?: string;
        startDate?: Date;
        endDate?: Date;
        search?: string;
      } = {};
      
      if (source && typeof source === 'string') {
        filters.source = source;
      }
      
      if (startDate && typeof startDate === 'string') {
        filters.startDate = new Date(startDate);
      }
      
      if (endDate && typeof endDate === 'string') {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filters.endDate = end;
      }
      
      if (search && typeof search === 'string') {
        filters.search = search;
      }
      
      const transactions = await storage.getAllWalletTransactionsWithUsers(filters);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/virtual-accounts/deactivate", async (req, res) => {
    try {
      const { accountNumber, transactionId } = req.body;
      
      if (!accountNumber) {
        return res.status(400).json({ error: "Account number is required" });
      }

      const result = await deactivateVirtualAccount(accountNumber);
      
      if (transactionId) {
        await storage.updatePaymentTransaction(transactionId, { status: "deactivated" });
      }

      res.json({ success: true, message: "Virtual account deactivated successfully", data: result });
    } catch (error: any) {
      console.error("Deactivate virtual account error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/virtual-accounts/reactivate", async (req, res) => {
    try {
      const { accountNumber, transactionId } = req.body;
      
      if (!accountNumber) {
        return res.status(400).json({ error: "Account number is required" });
      }

      const result = await reactivateVirtualAccount(accountNumber);
      
      if (transactionId) {
        await storage.updatePaymentTransaction(transactionId, { status: "pending" });
      }

      res.json({ success: true, message: "Virtual account reactivated successfully", data: result });
    } catch (error: any) {
      console.error("Reactivate virtual account error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/quiz-sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllQuizSessions();
      // Add passed field based on correctAnswers >= 3
      const sessionsWithPassed = sessions.map(session => ({
        ...session,
        passed: session.correctAnswers >= 3,
        createdAt: session.startedAt
      }));
      res.json(sessionsWithPassed);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/quiz-sessions/:userId", async (req, res) => {
    try {
      const sessions = await storage.getUserQuizSessions(req.params.userId);
      // Add passed field based on correctAnswers >= 3
      const sessionsWithPassed = sessions.map(session => ({
        ...session,
        passed: session.correctAnswers >= 3,
        createdAt: session.startedAt
      }));
      res.json(sessionsWithPassed);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/points/:userId", async (req, res) => {
    try {
      const { points } = req.body;
      const userPoints = await storage.getUserPoints(req.params.userId);
      if (!userPoints) {
        return res.status(404).json({ error: "User points not found" });
      }
      const updated = await storage.updateUserPoints(req.params.userId, { points });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Public Winners Display (for users to see other winners)
  app.get("/api/winners/public", async (_req, res) => {
    try {
      const allWinners = await storage.getAllWinners();
      // Fetch profile photos for each winner and show full name
      const publicWinners = await Promise.all(allWinners.map(async (w) => {
        const profile = await storage.getProfile(w.userId);
        return {
          id: w.id,
          prizeName: w.prizeName,
          prizeType: w.prizeType,
          prizeValue: w.prizeValue,
          userFullName: w.userFullName || 'Winner',
          photoUrl: profile?.photoUrl || null,
          createdAt: w.createdAt
        };
      }));
      res.json(publicWinners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Winners Management
  app.get("/api/admin/winners", async (_req, res) => {
    try {
      const allWinners = await storage.getAllWinners();
      res.json(allWinners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/winners/:id", async (req, res) => {
    try {
      const winner = await storage.getWinner(req.params.id);
      if (!winner) {
        return res.status(404).json({ error: "Winner not found" });
      }
      res.json(winner);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/winners/:id", async (req, res) => {
    try {
      const updates = req.body;
      const winner = await storage.updateWinner(req.params.id, updates);
      if (!winner) {
        return res.status(404).json({ error: "Winner not found" });
      }
      res.json(winner);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/winners/:id/process", async (req, res) => {
    try {
      const winner = await storage.getWinner(req.params.id);
      if (!winner) {
        return res.status(404).json({ error: "Winner not found" });
      }
      
      const updated = await storage.updateWinner(req.params.id, {
        status: "processed",
        processedAt: new Date()
      });
      
      // Mark the corresponding wheel spin as processed
      await storage.updateWheelSpin(winner.spinId, { status: "processed" });
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/winners/:id/pay", async (req, res) => {
    try {
      const winner = await storage.getWinner(req.params.id);
      if (!winner) {
        return res.status(404).json({ error: "Winner not found" });
      }
      
      const updated = await storage.updateWinner(req.params.id, {
        status: "paid",
        processedAt: winner.processedAt || new Date()
      });
      
      // Mark the corresponding wheel spin as claimed
      await storage.updateWheelSpin(winner.spinId, { status: "claimed" });
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Paystack Payment Integration
  app.post("/api/paystack/initialize", async (req, res) => {
    try {
      const { userId, amount, email } = req.body;
      
      if (!userId || !amount || !email) {
        return res.status(400).json({ error: "userId, amount, and email are required" });
      }

      const amountNum = Number(amount);
      if (isNaN(amountNum) || amountNum < 100) {
        return res.status(400).json({ error: "Minimum amount is ₦100" });
      }

      // Get callback URL from request host
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const callbackUrl = `${protocol}://${host}/api/paystack/callback`;

      const result = await initializeTransaction(
        email,
        amountNum,
        callbackUrl,
        { userId, purpose: 'wallet_funding' }
      );

      res.json({
        status: 'success',
        authorization_url: result.data.authorization_url,
        reference: result.data.reference,
        access_code: result.data.access_code
      });
    } catch (error: any) {
      console.error('Paystack initialize error:', error);
      res.status(500).json({ error: error.message || 'Failed to initialize payment' });
    }
  });

  app.get("/api/paystack/callback", async (req, res) => {
    try {
      const { reference } = req.query;
      
      if (!reference || typeof reference !== 'string') {
        return res.redirect('/?payment=error&message=Invalid reference');
      }

      const result = await verifyTransaction(reference);

      if (result.data.status === 'success') {
        const metadata = result.data.metadata;
        const userId = metadata?.userId;
        const amountInKobo = result.data.amount;
        const amountInNaira = amountInKobo / 100;

        if (userId) {
          // Check for duplicate transaction (idempotency)
          const existingTransaction = await storage.getWalletTransactionByReference(reference);
          if (existingTransaction) {
            return res.redirect(`/?payment=success&amount=${amountInNaira}&message=Already processed`);
          }

          // Get current wallet and update balance
          const wallet = await storage.getWallet(userId);
          if (wallet) {
            const currentBalance = Number(wallet.balance) || 0;
            const currentTotalFunded = Number(wallet.totalFunded) || 0;
            
            await storage.updateWallet(wallet.id, {
              balance: String(currentBalance + amountInNaira),
              totalFunded: String(currentTotalFunded + amountInNaira)
            });

            // Create wallet transaction record
            await storage.createWalletTransaction({
              walletId: wallet.id,
              type: 'credit',
              amount: String(amountInNaira),
              description: `Paystack funding - Ref: ${reference}`,
              status: 'completed',
              reference: reference,
              source: 'paystack'
            });

            // Check if this funding qualifies a referral
            await checkReferralQualification(userId, amountInNaira);

            return res.redirect(`/?payment=success&amount=${amountInNaira}`);
          }
        }
        
        return res.redirect('/?payment=error&message=Could not find wallet');
      } else {
        return res.redirect(`/?payment=failed&message=${result.data.gateway_response || 'Payment failed'}`);
      }
    } catch (error: any) {
      console.error('Paystack callback error:', error);
      return res.redirect(`/?payment=error&message=${encodeURIComponent(error.message)}`);
    }
  });

  // Paystack webhook for reliable payment confirmation
  app.post("/api/paystack/webhook", async (req, res) => {
    try {
      const event = req.body;
      
      // Verify this is a charge.success event
      if (event.event === 'charge.success') {
        const data = event.data;
        const reference = data.reference;
        const metadata = data.metadata;
        const userId = metadata?.userId;
        const amountInKobo = data.amount;
        const amountInNaira = amountInKobo / 100;

        if (userId) {
          // Check if this transaction was already processed
          const existingTransaction = await storage.getWalletTransactionByReference(reference);
          if (existingTransaction) {
            return res.sendStatus(200);
          }

          const wallet = await storage.getWallet(userId);
          if (wallet) {
            const currentBalance = Number(wallet.balance) || 0;
            const currentTotalFunded = Number(wallet.totalFunded) || 0;
            
            await storage.updateWallet(wallet.id, {
              balance: String(currentBalance + amountInNaira),
              totalFunded: String(currentTotalFunded + amountInNaira)
            });

            await storage.createWalletTransaction({
              walletId: wallet.id,
              type: 'credit',
              amount: String(amountInNaira),
              description: `Paystack funding - Ref: ${reference}`,
              status: 'completed',
              reference: reference,
              source: 'paystack'
            });

            // Check if this funding qualifies a referral
            await checkReferralQualification(userId, amountInNaira);
          }
        }
      }

      res.sendStatus(200);
    } catch (error: any) {
      console.error('Paystack webhook error:', error);
      res.sendStatus(500);
    }
  });

  // ============== REFERRAL ROUTES ==============

  // Get user's referral stats and code
  app.get("/api/referral/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let profile = await storage.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate referral code on-demand for users who don't have one (legacy users)
      if (!profile.referralCode) {
        const generateReferralCode = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let code = '';
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return code;
        };
        
        let newCode = generateReferralCode();
        while (await storage.getProfileByReferralCode(newCode)) {
          newCode = generateReferralCode();
        }
        
        await storage.updateProfile(userId, { referralCode: newCode });
        profile = { ...profile, referralCode: newCode };
      }

      const stats = await storage.getReferralStats(userId);
      const referrals = await storage.getUserReferrals(userId);
      
      // Fetch referee details including their names and wallet funding
      const referralsWithDetails = await Promise.all(
        referrals.map(async (r) => {
          const refereeProfile = await storage.getProfile(r.refereeId);
          const refereeWallet = await storage.getWallet(r.refereeId);
          return {
            id: r.id,
            status: r.status,
            createdAt: r.createdAt,
            qualifiedAt: r.qualifiedAt,
            rewardedAt: r.rewardedAt,
            rewardAmount: r.rewardAmount,
            refereeName: refereeProfile?.fullName || refereeProfile?.email || 'Unknown',
            refereeEmail: refereeProfile?.email || '',
            refereeFundedAmount: refereeWallet?.totalFunded || '0',
          };
        })
      );
      
      res.json({
        referralCode: profile.referralCode,
        stats,
        referrals: referralsWithDetails,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get referral settings (admin)
  app.get("/api/admin/referral/settings", async (req, res) => {
    try {
      let settings = await storage.getReferralSettings();
      if (!settings) {
        settings = await storage.createReferralSettings({
          rewardAmount: "200",
          minimumFunding: "500",
          autoRewardEnabled: true,
          isActive: true,
        });
      }
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update referral settings (admin)
  app.patch("/api/admin/referral/settings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const settings = await storage.updateReferralSettings(id, updates);
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all referrals (admin)
  app.get("/api/admin/referrals", async (req, res) => {
    try {
      const { status } = req.query;
      let referrals;
      
      if (status === 'pending') {
        referrals = await storage.getPendingReferrals();
      } else if (status === 'qualified') {
        referrals = await storage.getQualifiedReferrals();
      } else {
        referrals = await storage.getAllReferrals();
      }
      
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Manually reward a referral (admin)
  app.post("/api/admin/referral/:id/reward", async (req, res) => {
    try {
      const { id } = req.params;
      const referral = await storage.getReferral(id);
      
      if (!referral) {
        return res.status(404).json({ error: "Referral not found" });
      }
      
      if (referral.status === 'rewarded') {
        return res.status(400).json({ error: "Referral already rewarded" });
      }
      
      if (referral.status !== 'qualified') {
        return res.status(400).json({ error: "Referral not qualified yet" });
      }
      
      await processReferralReward(id);
      
      const updatedReferral = await storage.getReferral(id);
      res.json({ message: "Reward processed successfully", referral: updatedReferral });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reject a referral (admin)
  app.post("/api/admin/referral/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const referral = await storage.getReferral(id);
      
      if (!referral) {
        return res.status(404).json({ error: "Referral not found" });
      }
      
      if (referral.status === 'rewarded') {
        return res.status(400).json({ error: "Cannot reject an already rewarded referral" });
      }
      
      await storage.updateReferral(id, { status: 'rejected' });
      
      res.json({ message: "Referral rejected" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Validate referral code
  app.get("/api/referral/validate/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const profile = await storage.getProfileByReferralCode(code);
      
      if (!profile) {
        return res.json({ valid: false });
      }
      
      res.json({ valid: true, referrerName: profile.fullName });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
