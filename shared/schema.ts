import { pgTable, text, uuid, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  fullName: text("full_name"),
  sex: text("sex"), // 'Male' or 'Female'
  phoneNumber: text("phone_number"),
  location: text("location"),
  photoUrl: text("photo_url"),
  preferredLanguage: text("preferred_language").default("english"), // 'english', 'yoruba', 'hausa', 'igbo'
  bankName: text("bank_name"),
  bankAccountName: text("bank_account_name"),
  bankAccountNumber: text("bank_account_number"),
  accountVerified: boolean("account_verified").default(false),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const authSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  sex: z.string().optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  balance: numeric("balance").default("0").notNull(),
  totalFunded: numeric("total_funded").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'funding', 'withdrawal', 'prize', 'refund'
  amount: numeric("amount").notNull(),
  description: text("description"),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
});
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  questionTextYoruba: text("question_text_yoruba"),
  questionTextHausa: text("question_text_hausa"),
  questionTextIgbo: text("question_text_igbo"),
  optionAYoruba: text("option_a_yoruba"),
  optionAHausa: text("option_a_hausa"),
  optionAIgbo: text("option_a_igbo"),
  optionBYoruba: text("option_b_yoruba"),
  optionBHausa: text("option_b_hausa"),
  optionBIgbo: text("option_b_igbo"),
  optionCYoruba: text("option_c_yoruba"),
  optionCHausa: text("option_c_hausa"),
  optionCIgbo: text("option_c_igbo"),
  correctAnswer: text("correct_answer").notNull(), // 'A', 'B', or 'C'
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export const quizSessions = pgTable("quiz_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  status: text("status").default("in_progress").notNull(), // 'in_progress', 'completed', 'abandoned'
  correctAnswers: integer("correct_answers").default(0).notNull(),
  totalQuestions: integer("total_questions").default(0).notNull(),
  pointsEarned: integer("points_earned").default(0).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  startedAt: true,
});
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type QuizSession = typeof quizSessions.$inferSelect;

export const quizAnswers = pgTable("quiz_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => quizSessions.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  selectedAnswer: text("selected_answer").notNull(), // 'A', 'B', or 'C'
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const insertQuizAnswerSchema = createInsertSchema(quizAnswers).omit({
  id: true,
  answeredAt: true,
});
export type InsertQuizAnswer = z.infer<typeof insertQuizAnswerSchema>;
export type QuizAnswer = typeof quizAnswers.$inferSelect;

export const userPoints = pgTable("user_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  points: integer("points").default(0).notNull(),
  totalEarned: integer("total_earned").default(0).notNull(),
  totalSpent: integer("total_spent").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserPointsSchema = createInsertSchema(userPoints).omit({
  id: true,
  updatedAt: true,
});
export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;
export type UserPoints = typeof userPoints.$inferSelect;

export const prizeConfig = pgTable("prize_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  prizeName: text("prize_name").notNull(),
  prizeType: text("prize_type").notNull(), // 'cash', 'item', 'retry', 'draw', 'thank_you'
  prizeValue: numeric("prize_value"),
  dailyLimit: integer("daily_limit"),
  probabilityWeight: integer("probability_weight").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPrizeConfigSchema = createInsertSchema(prizeConfig).omit({
  id: true,
  createdAt: true,
});
export type InsertPrizeConfig = z.infer<typeof insertPrizeConfigSchema>;
export type PrizeConfig = typeof prizeConfig.$inferSelect;

export const wheelSpins = pgTable("wheel_spins", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  prizeId: uuid("prize_id").notNull().references(() => prizeConfig.id),
  prizeName: text("prize_name").notNull(),
  prizeValue: numeric("prize_value"),
  status: text("status").default("pending").notNull(), // 'pending', 'claimed', 'processed'
  spunAt: timestamp("spun_at").defaultNow().notNull(),
});

export const insertWheelSpinSchema = createInsertSchema(wheelSpins).omit({
  id: true,
  spunAt: true,
});
export type InsertWheelSpin = z.infer<typeof insertWheelSpinSchema>;
export type WheelSpin = typeof wheelSpins.$inferSelect;

export const dailyWinnerLimits = pgTable("daily_winner_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  prizeId: uuid("prize_id").notNull().references(() => prizeConfig.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  winnersCount: integer("winners_count").default(0).notNull(),
});

export const insertDailyWinnerLimitSchema = createInsertSchema(dailyWinnerLimits).omit({
  id: true,
});
export type InsertDailyWinnerLimit = z.infer<typeof insertDailyWinnerLimitSchema>;
export type DailyWinnerLimit = typeof dailyWinnerLimits.$inferSelect;

export const paymentTransactions = pgTable("payment_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  reference: text("reference").notNull().unique(),
  amount: numeric("amount").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'completed', 'failed', 'expired'
  virtualAccountNumber: text("virtual_account_number"),
  virtualAccountName: text("virtual_account_name"),
  virtualAccountBank: text("virtual_account_bank"),
  sessionId: text("session_id"),
  expiresAt: timestamp("expires_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
