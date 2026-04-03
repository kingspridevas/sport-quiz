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
  winners,
  referrals,
  referralSettings,
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
  type Winner,
  type Referral,
  type ReferralSettings,
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
  type InsertWinner,
  type InsertReferral,
  type InsertReferralSettings,
} from "../shared/schema.js";
import { eq, and, sql as drizzleSql, desc, gte, lte, ilike, or } from "drizzle-orm";

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
  getWalletTransactionByReference(reference: string): Promise<WalletTransaction | undefined>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getAllWalletTransactionsWithUsers(filters?: {
    source?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    type?: string;
    status?: string;
  }): Promise<Array<WalletTransaction & { userEmail: string; userFullName: string | null }>>;
  
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
  getReusableVirtualAccount(): Promise<PaymentTransaction | undefined>;
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  updatePaymentTransaction(id: string, updates: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction | undefined>;
  
  // Admin Stats
  getAllQuizSessions(): Promise<QuizSession[]>;
  getAdminStats(): Promise<{totalUsers: number, totalQuizzes: number, totalWalletBalance: number, totalPayments: number}>;
  
  // Winners
  createWinner(winner: InsertWinner): Promise<Winner>;
  getAllWinners(): Promise<Winner[]>;
  getWinner(id: string): Promise<Winner | undefined>;
  updateWinner(id: string, updates: Partial<InsertWinner>): Promise<Winner | undefined>;
  
  // Referrals
  getProfileByReferralCode(code: string): Promise<Profile | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferral(id: string): Promise<Referral | undefined>;
  getReferralByRefereeId(refereeId: string): Promise<Referral | undefined>;
  getUserReferrals(referrerId: string): Promise<Referral[]>;
  getAllReferrals(): Promise<Array<Referral & { referrerEmail: string; referrerName: string | null; refereeEmail: string; refereeName: string | null }>>;
  getPendingReferrals(): Promise<Array<Referral & { referrerEmail: string; referrerName: string | null; refereeEmail: string; refereeName: string | null }>>;
  getQualifiedReferrals(): Promise<Array<Referral & { referrerEmail: string; referrerName: string | null; refereeEmail: string; refereeName: string | null }>>;
  updateReferral(id: string, updates: Partial<InsertReferral>): Promise<Referral | undefined>;
  
  // Referral Settings
  getReferralSettings(): Promise<ReferralSettings | undefined>;
  createReferralSettings(settings: InsertReferralSettings): Promise<ReferralSettings>;
  updateReferralSettings(id: string, updates: Partial<InsertReferralSettings>): Promise<ReferralSettings | undefined>;
  
  // Referral Stats
  getReferralStats(userId: string): Promise<{ totalReferrals: number; qualifiedReferrals: number; pendingReferrals: number; totalEarnings: number }>;
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

  async getWalletTransactionByReference(reference: string) {
    const result = await db.select().from(walletTransactions).where(eq(walletTransactions.reference, reference));
    return result[0];
  }

  async createWalletTransaction(transaction: InsertWalletTransaction) {
    const result = await db.insert(walletTransactions).values(transaction).returning();
    return result[0];
  }

  async getAllWalletTransactionsWithUsers(filters?: {
    source?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    type?: string;
    status?: string;
  }) {
    const conditions: any[] = [];
    
    if (filters?.source && filters.source !== 'all') {
      conditions.push(eq(walletTransactions.source, filters.source));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(walletTransactions.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(walletTransactions.createdAt, filters.endDate));
    }
    
    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(profiles.email, searchPattern),
          ilike(profiles.fullName, searchPattern)
        )
      );
    }

    if (filters?.type && filters.type !== 'all') {
      conditions.push(eq(walletTransactions.type, filters.type));
    }

    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(walletTransactions.status, filters.status));
    }

    const baseQuery = db
      .select({
        id: walletTransactions.id,
        walletId: walletTransactions.walletId,
        type: walletTransactions.type,
        amount: walletTransactions.amount,
        description: walletTransactions.description,
        reference: walletTransactions.reference,
        source: walletTransactions.source,
        status: walletTransactions.status,
        createdAt: walletTransactions.createdAt,
        userEmail: profiles.email,
        userFullName: profiles.fullName,
      })
      .from(walletTransactions)
      .innerJoin(wallets, eq(walletTransactions.walletId, wallets.id))
      .innerJoin(profiles, eq(wallets.userId, profiles.id));

    if (conditions.length > 0) {
      return baseQuery.where(and(...conditions)).orderBy(desc(walletTransactions.createdAt));
    }
    
    return baseQuery.orderBy(desc(walletTransactions.createdAt));
  }

  // Questions
  async getActiveQuestions(limit = 10) {
    return db.select().from(questions).where(eq(questions.isActive, true)).orderBy(drizzleSql`RANDOM()`).limit(limit);
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
    return db.select().from(prizeConfig).where(eq(prizeConfig.isActive, true)).orderBy(prizeConfig.id);
  }

  async getAllPrizes() {
    return db.select().from(prizeConfig).orderBy(prizeConfig.id);
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

  async getReusableVirtualAccount() {
    // Find expired or completed transactions with valid account numbers
    const now = new Date();
    const result = await db
      .select()
      .from(paymentTransactions)
      .where(
        and(
          drizzleSql`${paymentTransactions.virtualAccountNumber} IS NOT NULL`,
          drizzleSql`${paymentTransactions.virtualAccountNumber} != ''`,
          drizzleSql`(${paymentTransactions.status} IN ('expired', 'completed') OR ${paymentTransactions.expiresAt} < ${now})`
        )
      )
      .orderBy(desc(paymentTransactions.createdAt))
      .limit(1);
    return result[0];
  }

  async getAllQuizSessions() {
    return db
      .select()
      .from(quizSessions)
      .orderBy(desc(quizSessions.startedAt));
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

  // Winners
  async createWinner(winner: InsertWinner) {
    const result = await db.insert(winners).values(winner).returning();
    return result[0];
  }

  async getAllWinners() {
    return db.select().from(winners).orderBy(desc(winners.createdAt));
  }

  async getWinner(id: string) {
    const result = await db.select().from(winners).where(eq(winners.id, id));
    return result[0];
  }

  async updateWinner(id: string, updates: Partial<InsertWinner>) {
    const result = await db
      .update(winners)
      .set(updates)
      .where(eq(winners.id, id))
      .returning();
    return result[0];
  }

  // Referrals
  async getProfileByReferralCode(code: string) {
    const result = await db.select().from(profiles).where(eq(profiles.referralCode, code));
    return result[0];
  }

  async createReferral(referral: InsertReferral) {
    const result = await db.insert(referrals).values(referral).returning();
    return result[0];
  }

  async getReferral(id: string) {
    const result = await db.select().from(referrals).where(eq(referrals.id, id));
    return result[0];
  }

  async getReferralByRefereeId(refereeId: string) {
    const result = await db.select().from(referrals).where(eq(referrals.refereeId, refereeId));
    return result[0];
  }

  async getUserReferrals(referrerId: string) {
    return db.select().from(referrals).where(eq(referrals.referrerId, referrerId)).orderBy(desc(referrals.createdAt));
  }

  async getAllReferrals() {
    const referrerProfiles = db.select().from(profiles).as('referrer');
    const refereeProfiles = db.select().from(profiles).as('referee');
    
    return db
      .select({
        id: referrals.id,
        referrerId: referrals.referrerId,
        refereeId: referrals.refereeId,
        referralCode: referrals.referralCode,
        status: referrals.status,
        qualifiedAt: referrals.qualifiedAt,
        rewardedAt: referrals.rewardedAt,
        rewardAmount: referrals.rewardAmount,
        rewardTransactionId: referrals.rewardTransactionId,
        createdAt: referrals.createdAt,
        referrerEmail: referrerProfiles.email,
        referrerName: referrerProfiles.fullName,
        refereeEmail: refereeProfiles.email,
        refereeName: refereeProfiles.fullName,
      })
      .from(referrals)
      .innerJoin(referrerProfiles, eq(referrals.referrerId, referrerProfiles.id))
      .innerJoin(refereeProfiles, eq(referrals.refereeId, refereeProfiles.id))
      .orderBy(desc(referrals.createdAt));
  }

  async getPendingReferrals() {
    const referrerProfiles = db.select().from(profiles).as('referrer');
    const refereeProfiles = db.select().from(profiles).as('referee');
    
    return db
      .select({
        id: referrals.id,
        referrerId: referrals.referrerId,
        refereeId: referrals.refereeId,
        referralCode: referrals.referralCode,
        status: referrals.status,
        qualifiedAt: referrals.qualifiedAt,
        rewardedAt: referrals.rewardedAt,
        rewardAmount: referrals.rewardAmount,
        rewardTransactionId: referrals.rewardTransactionId,
        createdAt: referrals.createdAt,
        referrerEmail: referrerProfiles.email,
        referrerName: referrerProfiles.fullName,
        refereeEmail: refereeProfiles.email,
        refereeName: refereeProfiles.fullName,
      })
      .from(referrals)
      .innerJoin(referrerProfiles, eq(referrals.referrerId, referrerProfiles.id))
      .innerJoin(refereeProfiles, eq(referrals.refereeId, refereeProfiles.id))
      .where(eq(referrals.status, 'pending'))
      .orderBy(desc(referrals.createdAt));
  }

  async getQualifiedReferrals() {
    const referrerProfiles = db.select().from(profiles).as('referrer');
    const refereeProfiles = db.select().from(profiles).as('referee');
    
    return db
      .select({
        id: referrals.id,
        referrerId: referrals.referrerId,
        refereeId: referrals.refereeId,
        referralCode: referrals.referralCode,
        status: referrals.status,
        qualifiedAt: referrals.qualifiedAt,
        rewardedAt: referrals.rewardedAt,
        rewardAmount: referrals.rewardAmount,
        rewardTransactionId: referrals.rewardTransactionId,
        createdAt: referrals.createdAt,
        referrerEmail: referrerProfiles.email,
        referrerName: referrerProfiles.fullName,
        refereeEmail: refereeProfiles.email,
        refereeName: refereeProfiles.fullName,
      })
      .from(referrals)
      .innerJoin(referrerProfiles, eq(referrals.referrerId, referrerProfiles.id))
      .innerJoin(refereeProfiles, eq(referrals.refereeId, refereeProfiles.id))
      .where(eq(referrals.status, 'qualified'))
      .orderBy(desc(referrals.createdAt));
  }

  async updateReferral(id: string, updates: Partial<InsertReferral>) {
    const result = await db
      .update(referrals)
      .set(updates)
      .where(eq(referrals.id, id))
      .returning();
    return result[0];
  }

  // Referral Settings
  async getReferralSettings() {
    const result = await db.select().from(referralSettings).limit(1);
    return result[0];
  }

  async createReferralSettings(settings: InsertReferralSettings) {
    const result = await db.insert(referralSettings).values(settings).returning();
    return result[0];
  }

  async updateReferralSettings(id: string, updates: Partial<InsertReferralSettings>) {
    const result = await db
      .update(referralSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(referralSettings.id, id))
      .returning();
    return result[0];
  }

  // Referral Stats
  async getReferralStats(userId: string) {
    const userReferrals = await db.select().from(referrals).where(eq(referrals.referrerId, userId));
    
    const totalReferrals = userReferrals.length;
    const qualifiedReferrals = userReferrals.filter(r => r.status === 'qualified' || r.status === 'rewarded').length;
    const pendingReferrals = userReferrals.filter(r => r.status === 'pending').length;
    const totalEarnings = userReferrals
      .filter(r => r.status === 'rewarded' && r.rewardAmount)
      .reduce((sum, r) => sum + parseFloat(r.rewardAmount || '0'), 0);

    return { totalReferrals, qualifiedReferrals, pendingReferrals, totalEarnings };
  }
}

export const storage = new DbStorage();
