import type { Express } from "express";
import { storage } from "./storage.js";
import { insertProfileSchema, insertQuestionSchema, insertQuizSessionSchema, insertQuizAnswerSchema, insertWheelSpinSchema, insertPaymentTransactionSchema } from "../shared/schema.js";

export function registerRoutes(app: Express) {
  // Auth - For now, we'll use a simple session-based auth
  // In production, this would be replaced with proper JWT or session management
  
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      const existingProfile = await storage.getProfileByEmail(validatedData.email);
      
      if (existingProfile) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create profile (in real app, this would create auth user first)
      const profile = await storage.createProfile(validatedData);
      
      // Create wallet and points for new user
      await storage.createWallet({ userId: profile.id, balance: "0", totalFunded: "0" });
      await storage.createUserPoints({ userId: profile.id, points: 0, totalEarned: 0, totalSpent: 0 });
      
      res.json({ profile });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      const profile = await storage.getProfileByEmail(email);
      
      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ profile });
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

  app.get("/api/questions/all", async (req, res) => {
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
  app.post("/api/quiz/start", async (req, res) => {
    try {
      const validatedData = insertQuizSessionSchema.parse(req.body);
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
  app.get("/api/prizes", async (req, res) => {
    try {
      const prizes = await storage.getActivePrizes();
      res.json(prizes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/prizes/all", async (req, res) => {
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
      
      // This would normally call the 9PSB API
      // For now, create a placeholder payment transaction
      const reference = `SQ${Date.now()}${userId.substring(0, 8)}`;
      
      const transaction = await storage.createPaymentTransaction({
        userId,
        reference,
        amount: amount.toString(),
        status: "pending",
        virtualAccountNumber: `90${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
        virtualAccountName: userName,
        virtualAccountBank: "9PSB",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
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
      res.status(500).json({ error: error.message });
    }
  });
}
