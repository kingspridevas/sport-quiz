import type { Express } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage.js";
import { authSignupSchema, authLoginSchema, insertQuestionSchema, insertQuizSessionSchema, insertQuizAnswerSchema } from "../shared/schema.js";
import { createVirtualAccount } from "./psb-service.js";

export function registerRoutes(app: Express) {
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = authSignupSchema.parse(req.body);
      const existingProfile = await storage.getProfileByEmail(validatedData.email);
      
      if (existingProfile) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      const passwordHash = await bcrypt.hash(validatedData.password, 10);

      const profile = await storage.createProfile({
        email: validatedData.email,
        passwordHash,
        fullName: validatedData.fullName,
        sex: validatedData.sex || null,
        phoneNumber: validatedData.phoneNumber || null,
        location: validatedData.location || null,
        isAdmin: false,
      });
      
      await storage.createWallet({ userId: profile.id, balance: "0", totalFunded: "0" });
      await storage.createUserPoints({ userId: profile.id, points: 0, totalEarned: 0, totalSpent: 0 });
      
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
      const wallet = await storage.getWallet(req.params.userId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
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
      const session = await storage.updateQuizSession(req.params.id, updates);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // If session completed and points earned, update user points
      if (updates.status === 'completed' && updates.pointsEarned > 0) {
        const userPoints = await storage.getUserPoints(session.userId);
        if (userPoints) {
          await storage.updateUserPoints(userPoints.id, {
            points: userPoints.points + updates.pointsEarned,
            totalEarned: userPoints.totalEarned + updates.pointsEarned,
          });
        }
      }
      
      res.json(session);
    } catch (error: any) {
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

  // Wheel Spins
  app.post("/api/wheel/spin", async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Get active prizes
      const prizes = await storage.getActivePrizes();
      if (prizes.length === 0) {
        return res.status(400).json({ error: "No active prizes available" });
      }

      // Simple weighted random selection
      const totalWeight = prizes.reduce((sum, p) => sum + p.probabilityWeight, 0);
      let random = Math.random() * totalWeight;
      let selectedPrize = prizes[0];

      for (const prize of prizes) {
        random -= prize.probabilityWeight;
        if (random <= 0) {
          selectedPrize = prize;
          break;
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

      // Handle prize type
      if (selectedPrize.prizeType === 'cash' && selectedPrize.prizeValue) {
        const wallet = await storage.getWallet(userId);
        if (wallet) {
          const newBalance = parseFloat(wallet.balance) + parseFloat(selectedPrize.prizeValue.toString());
          await storage.updateWallet(wallet.id, { balance: newBalance.toString() });
          await storage.createWalletTransaction({
            walletId: wallet.id,
            type: "prize",
            amount: selectedPrize.prizeValue.toString(),
            description: `Prize: ${selectedPrize.prizeName}`,
            reference: spin.id
          });
          await storage.updateWheelSpin(spin.id, { status: "processed" });
        }
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
      
      const psbResponse = await createVirtualAccount({
        amount: parseFloat(amount),
        customerName: userName,
        reference,
        description: "Wallet Funding",
      });

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
          expiresAt: transaction.expiresAt
        }
      });
    } catch (error: any) {
      console.error("Virtual account creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const { 
        accountnumber,
        sessionid 
      } = req.body;

      console.log("9PSB Webhook received:", req.body);

      const transaction = await storage.getPaymentTransactionByAccount(accountnumber);
      
      if (!transaction) {
        console.error("Payment transaction not found for account:", accountnumber);
        return res.json({ code: "00", message: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        console.log("Transaction already processed:", transaction.reference);
        return res.json({ code: "00", message: "Already processed" });
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
          type: "funding",
          amount: transaction.amount,
          description: "Wallet funding via bank transfer",
          reference: transaction.reference,
        });
      }

      console.log("Payment processed successfully:", transaction.reference);
      res.json({ code: "00", message: "Success" });
    } catch (error: any) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ code: "99", message: error.message });
    }
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
}
