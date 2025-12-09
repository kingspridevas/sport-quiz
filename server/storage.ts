import { db } from "./db.js";
import {  profiles,
  wallets,
  walletTransactions,
  questions,
  quizSessions,
  quizAnswers,
  userPoints,
  prizeConfig,
  wheelSpins,
  dailyWinnerLimits,
  paymentTransactions,
  type Profile,
  type Wallet,
  type WalletTransaction,
  type Question,
  type QuizSession,
  type QuizAnswer,
  type UserPoints,
  type PrizeConfig,
  type WheelSpin,
  type DailyWinnerLimit,
  type PaymentTransaction,
  type InsertProfile,
  type InsertWallet,
  type InsertWalletTransaction,
  type InsertQuestion,
  type InsertQuizSession,
  type InsertQuizAnswer,
  type InsertUserPoints,
  type InsertPrizeConfig,
  type InsertWheelSpin,
  type InsertDailyWinnerLimit,
  type InsertPaymentTransaction,
} from "../shared/schema.js";
import { eq, and, sql as drizzleSql, desc } from "drizzle-orm";

export interface IStorage {
  // Profiles
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  getAllProfiles(): Promise<Profile[]>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  
  // Wallets
  getWallet(userId: string): Promise<Wallet | undefined>;
  getAllWallets(): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: string, updates: Partial<InsertWallet>): Promise<Wallet | undefined>;
  
  // Wallet Transactions
  getWalletTransactions(walletId: string): Promise<WalletTransaction[]>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  
  // Questions
  getActiveQuestions(limit?: number): Promise<Question[]>;
  getAllQuestions(): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, updates: Partial<InsertQuestion>): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<void>;
  
  // Quiz Sessions
  getQuizSession(id: string): Promise<QuizSession | undefined>;
  getUserQuizSessions(userId: string): Promise<QuizSession[]>;
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  updateQuizSession(id: string, updates: Partial<InsertQuizSession>): Promise<QuizSession | undefined>;
  
  // Quiz Answers
  getSessionAnswers(sessionId: string): Promise<QuizAnswer[]>;
  createQuizAnswer(answer: InsertQuizAnswer): Promise<QuizAnswer>;
  
  // User Points
  getUserPoints(userId: string): Promise<UserPoints | undefined>;
  createUserPoints(points: InsertUserPoints): Promise<UserPoints>;
  updateUserPoints(userId: string, updates: Partial<InsertUserPoints>): Promise<UserPoints | undefined>;
  
  // Prize Config
  getActivePrizes(): Promise<PrizeConfig[]>;
  getAllPrizes(): Promise<PrizeConfig[]>;
  getPrize(id: string): Promise<PrizeConfig | undefined>;
  createPrize(prize: InsertPrizeConfig): Promise<PrizeConfig>;
  updatePrize(id: string, updates: Partial<InsertPrizeConfig>): Promise<PrizeConfig | undefined>;
  deletePrize(id: string): Promise<void>;
  
  // Wheel Spins
  getUserWheelSpins(userId: string): Promise<WheelSpin[]>;
  createWheelSpin(spin: InsertWheelSpin): Promise<WheelSpin>;
  updateWheelSpin(id: string, updates: Partial<InsertWheelSpin>): Promise<WheelSpin | undefined>;
  
  // Daily Winner Limits
  getDailyLimit(prizeId: string, date: Date): Promise<DailyWinnerLimit | undefined>;
  createDailyLimit(limit: InsertDailyWinnerLimit): Promise<DailyWinnerLimit>;
  updateDailyLimit(id: string, winnersCount: number): Promise<DailyWinnerLimit | undefined>;
  
  // Payment Transactions
  getPaymentTransaction(reference: string): Promise<PaymentTransaction | undefined>;
  getPaymentTransactionByAccount(accountNumber: string): Promise<PaymentTransaction | undefined>;
  getUserPaymentTransactions(userId: string): Promise<PaymentTransaction[]>;
  getAllPaymentTransactions(): Promise<PaymentTransaction[]>;
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  updatePaymentTransaction(id: string, updates: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction | undefined>;
  
  // Admin Stats
  getAllQuizSessions(): Promise<QuizSession[]>;
  getAdminStats(): Promise<{totalUsers: number, totalQuizzes: number, totalWalletBalance: number, totalPayments: number}>;
}

export class DbStorage implements IStorage {
  // Profiles
  async getProfile(id: string) {
    const result = await db.select().from(profiles).where(eq(profiles.id, id));
    return result[0];
  }

  async getProfileByEmail(email: string) {
    const result = await db.select().from(profiles).where(eq(profiles.email, email));
    return result[0];
  }

  async getAllProfiles() {
    return await db.select().from(profiles).orderBy(desc(profiles.id));
  }

  async createProfile(profile: InsertProfile) {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(id: string, updates: Partial<InsertProfile>) {
    const result = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return result[0];
  }

  // Wallets
  async getWallet(userId: string) {
    const result = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return result[0];
  }

  async getAllWallets() {
    return await db.select().from(wallets).orderBy(desc(wallets.id));
  }

  async createWallet(wallet: InsertWallet) {
    const result = await db.insert(wallets).values(wallet).returning();
    return result[0];
  }

  async updateWallet(id: string, updates: Partial<InsertWallet>) {
    const result = await db
      .update(wallets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(wallets.id, id))
      .returning();
    return result[0];
  }

  // Wallet Transactions
  async getWalletTransactions(walletId: string) {
    return db.select().from(walletTransactions).where(eq(walletTransactions.walletId, walletId)).orderBy(desc(walletTransactions.createdAt));
  }

  async createWalletTransaction(transaction: InsertWalletTransaction) {
    const result = await db.insert(walletTransactions).values(transaction).returning();
    return result[0];
  }

  // Questions
  async getActiveQuestions(limit = 10) {
    return db.select().from(questions).where(eq(questions.isActive, true)).limit(limit);
  }

  async getAllQuestions() {
    return db.select().from(questions);
  }

  async getQuestion(id: string) {
    const result = await db.select().from(questions).where(eq(questions.id, id));
    return result[0];
  }

  async createQuestion(question: InsertQuestion) {
    const result = await db.insert(questions).values(question).returning();
    return result[0];
  }

  async updateQuestion(id: string, updates: Partial<InsertQuestion>) {
    const result = await db
      .update(questions)
      .set(updates)
      .where(eq(questions.id, id))
      .returning();
    return result[0];
  }

  async deleteQuestion(id: string) {
    await db.delete(questions).where(eq(questions.id, id));
  }

  // Quiz Sessions
  async getQuizSession(id: string) {
    const result = await db.select().from(quizSessions).where(eq(quizSessions.id, id));
    return result[0];
  }

  async getUserQuizSessions(userId: string) {
    return db.select().from(quizSessions).where(eq(quizSessions.userId, userId)).orderBy(desc(quizSessions.startedAt));
  }

  async createQuizSession(session: InsertQuizSession) {
    const result = await db.insert(quizSessions).values(session).returning();
    return result[0];
  }

  async updateQuizSession(id: string, updates: Partial<InsertQuizSession>) {
    const result = await db
      .update(quizSessions)
      .set(updates)
      .where(eq(quizSessions.id, id))
      .returning();
    return result[0];
  }

  // Quiz Answers
  async getSessionAnswers(sessionId: string) {
    return db.select().from(quizAnswers).where(eq(quizAnswers.sessionId, sessionId));
  }

  async createQuizAnswer(answer: InsertQuizAnswer) {
    const result = await db.insert(quizAnswers).values(answer).returning();
    return result[0];
  }

  // User Points
  async getUserPoints(userId: string) {
    const result = await db.select().from(userPoints).where(eq(userPoints.userId, userId));
    return result[0];
  }

  async createUserPoints(points: InsertUserPoints) {
    const result = await db.insert(userPoints).values(points).returning();
    return result[0];
  }

  async updateUserPoints(userId: string, updates: Partial<InsertUserPoints>) {
    const result = await db
      .update(userPoints)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPoints.userId, userId))
      .returning();
    return result[0];
  }

  // Prize Config
  async getActivePrizes() {
    return db.select().from(prizeConfig).where(eq(prizeConfig.isActive, true));
  }

  async getAllPrizes() {
    return db.select().from(prizeConfig);
  }

  async getPrize(id: string) {
    const result = await db.select().from(prizeConfig).where(eq(prizeConfig.id, id));
    return result[0];
  }

  async createPrize(prize: InsertPrizeConfig) {
    const result = await db.insert(prizeConfig).values(prize).returning();
    return result[0];
  }

  async updatePrize(id: string, updates: Partial<InsertPrizeConfig>) {
    const result = await db
      .update(prizeConfig)
      .set(updates)
      .where(eq(prizeConfig.id, id))
      .returning();
    return result[0];
  }

  async deletePrize(id: string) {
    await db.delete(prizeConfig).where(eq(prizeConfig.id, id));
  }

  // Wheel Spins
  async getUserWheelSpins(userId: string) {
    return db.select().from(wheelSpins).where(eq(wheelSpins.userId, userId)).orderBy(desc(wheelSpins.spunAt));
  }

  async createWheelSpin(spin: InsertWheelSpin) {
    const result = await db.insert(wheelSpins).values(spin).returning();
    return result[0];
  }

  async updateWheelSpin(id: string, updates: Partial<InsertWheelSpin>) {
    const result = await db
      .update(wheelSpins)
      .set(updates)
      .where(eq(wheelSpins.id, id))
      .returning();
    return result[0];
  }

  // Daily Winner Limits
  async getDailyLimit(prizeId: string, date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    const result = await db
      .select()
      .from(dailyWinnerLimits)
      .where(
        and(
          eq(dailyWinnerLimits.prizeId, prizeId),
          drizzleSql`DATE(${dailyWinnerLimits.date}) = ${dateStr}`
        )
      );
    return result[0];
  }

  async createDailyLimit(limit: InsertDailyWinnerLimit) {
    const result = await db.insert(dailyWinnerLimits).values(limit).returning();
    return result[0];
  }

  async updateDailyLimit(id: string, winnersCount: number) {
    const result = await db
      .update(dailyWinnerLimits)
      .set({ winnersCount })
      .where(eq(dailyWinnerLimits.id, id))
      .returning();
    return result[0];
  }

  // Payment Transactions
  async getPaymentTransaction(reference: string) {
    const result = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.reference, reference));
    return result[0];
  }

  async getPaymentTransactionByAccount(accountNumber: string) {
    const result = await db
      .select()
      .from(paymentTransactions)
      .where(and(
        eq(paymentTransactions.virtualAccountNumber, accountNumber),
        eq(paymentTransactions.status, "pending")
      ));
    return result[0];
  }

  async getUserPaymentTransactions(userId: string) {
    return db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.createdAt));
  }

  async getAllPaymentTransactions() {
    return db
      .select()
      .from(paymentTransactions)
      .orderBy(desc(paymentTransactions.createdAt));
  }

  async getAllQuizSessions() {
    return db
      .select()
      .from(quizSessions)
      .orderBy(desc(quizSessions.createdAt));
  }

  async getAdminStats() {
    const usersResult = await db.select({ count: drizzleSql<number>`count(*)` }).from(profiles);
    const quizzesResult = await db.select({ count: drizzleSql<number>`count(*)` }).from(quizSessions);
    const walletsResult = await db.select({ total: drizzleSql<number>`coalesce(sum(balance), 0)` }).from(wallets);
    const paymentsResult = await db.select({ total: drizzleSql<number>`coalesce(sum(amount), 0)` }).from(paymentTransactions).where(eq(paymentTransactions.status, 'completed'));
    
    return {
      totalUsers: Number(usersResult[0]?.count ?? 0),
      totalQuizzes: Number(quizzesResult[0]?.count ?? 0),
      totalWalletBalance: Number(walletsResult[0]?.total ?? 0),
      totalPayments: Number(paymentsResult[0]?.total ?? 0)
    };
  }

  async createPaymentTransaction(transaction: InsertPaymentTransaction) {
    const result = await db.insert(paymentTransactions).values(transaction).returning();
    return result[0];
  }

  async updatePaymentTransaction(id: string, updates: Partial<InsertPaymentTransaction>) {
    const result = await db
      .update(paymentTransactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentTransactions.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
