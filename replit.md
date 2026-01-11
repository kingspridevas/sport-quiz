# Sports Quiz Platform

## Overview

A gamified sports quiz platform that allows users to test their sports knowledge through timed quizzes and win prizes via a prize wheel system. Users pay to participate in quizzes using wallet credits, earn points for correct answers, and spend points to spin a prize wheel for cash rewards and other prizes. The platform includes multi-language support (English, Yoruba, Hausa, Igbo) and integrates with payment services for wallet funding.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter for lightweight SPA navigation.

**State Management**: React Context API for authentication state, with TanStack Query (React Query) for server state management and caching.

**Styling**: TailwindCSS with PostCSS and Autoprefixer for utility-first styling approach.

**Component Structure**: Modular component architecture with clear separation between:
- Authentication components (Auth, AuthContext)
- User-facing features (UserDashboard, QuizSession, MagicWheel, WalletManager, ProfileSettings)
- Admin features (AdminDashboard)

**Design Pattern**: The application uses a role-based view system where users see different dashboards based on their `isAdmin` status. All components consume authentication state through a centralized AuthContext provider.

### Backend Architecture

**Runtime**: Node.js with Express framework handling API routes and serving the SPA.

**Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations.

**Database Connection**: PostgreSQL connection pooling via the `pg` library.

**API Structure**: RESTful API endpoints under `/api` prefix, including:
- `/api/auth/signup` - User registration with profile creation, wallet initialization, and points setup
- `/api/auth/login` - User authentication with password verification using bcryptjs

**Server-Side Rendering Setup**: Vite middleware integration for development with HMR support, serving the React SPA with transform middleware.

**Storage Layer**: Abstracted storage interface (`IStorage`) in `server/storage.ts` providing methods for:
- Profile management (CRUD operations)
- Wallet operations
- Quiz sessions and answers
- Prize configurations
- Wheel spins and daily limits
- Payment transactions

### Database Schema

**Core Tables**:
- `profiles` - User accounts with authentication, personal info, banking details, and admin flags
- `wallets` - User wallet balances and funding totals
- `wallet_transactions` - Transaction history for wallet operations
- `questions` - Quiz questions with multi-language support (English, Yoruba, Hausa, Igbo)
- `quiz_sessions` - Quiz attempt records with scoring and completion status
- `quiz_answers` - Individual question responses within quiz sessions
- `user_points` - Point balances and earning/spending history
- `prize_config` - Prize definitions with types, values, daily limits, and probability weights
- `wheel_spins` - Record of prize wheel spins and winnings
- `daily_winner_limits` - Daily caps on specific prize types
- `payment_transactions` - External payment tracking
- `referrals` - Referral relationships between users with status, qualification, and reward tracking
- `referral_settings` - Configurable settings for referral program (reward amount, minimum funding, auto-reward toggle)

**Schema Validation**: Zod schemas generated from Drizzle table definitions using `drizzle-zod` for runtime validation.

**Migration Strategy**: Schema changes managed through Drizzle Kit with migrations output to `/migrations` directory.

### Authentication & Authorization

**Password Security**: bcryptjs for password hashing (10 salt rounds).

**Session Management**: Currently implements a custom authentication flow. The codebase references Supabase client but the backend uses custom Express routes with bcrypt.

**Authorization Pattern**: Role-based access control using `isAdmin` boolean flag on profiles. Admin users access different UI (AdminDashboard) compared to regular users (UserDashboard).

**Profile Creation Flow**: On signup, three related records are created atomically:
1. Profile with hashed password
2. Wallet initialized with zero balance
3. User points initialized at zero

### Key Business Logic

**Quiz System**:
- Fixed cost of 100 wallet units per quiz session
- 5 questions per session with 30 seconds per question
- Minimum 3 correct answers required to pass
- Points awarded for passing quizzes

**Prize Wheel**:
- Requires 5 points to spin
- Weighted probability system for prize distribution
- Daily limits on high-value prizes
- Prize types: cash, item, retry, draw, thank_you

**Referral Program**:
- Each user gets a unique 6-character alphanumeric referral code on signup
- Signup flow accepts optional `?ref=CODE` query parameter to track referrals
- Referrals tracked in `referrals` table with status: pending → qualified → rewarded
- Qualification triggers when referee funds wallet with ≥₦500 (configurable)
- Auto-reward system credits ₦200 (configurable) to referrer's wallet when enabled
- Admin can manually reward/reject referrals when auto-reward is disabled
- Settings managed via `referral_settings` table (reward amount, minimum funding, auto-reward toggle)
- User dashboard displays referral code, shareable link, and earnings stats
- Admin dashboard includes Referrals tab for managing settings and referrals

**Multi-Language Support**: Questions and options stored with language variants (Yoruba, Hausa, Igbo) alongside English defaults.

## External Dependencies

### Third-Party Services

**Supabase**: Authentication and database service (referenced in client-side code with hardcoded URL and anon key - should be environment variables).

**Payment Provider (9PSB)**: Virtual account creation and webhook processing for wallet funding:
- Base URL: `https://baastest.9psb.com.ng/iva-api/v1/merchant/virtualaccount`
- Uses public/private key authentication with SHA-512 hashing
- Webhook endpoint for payment notifications

**SendGrid**: Email notifications for prize winnings (configured in Supabase Edge Function).

### External APIs & Integrations

**Supabase Edge Functions**:
1. `create-virtual-account` - Generates temporary virtual bank accounts for wallet funding
2. `prize-notification` - Sends email notifications when users win prizes
3. `psb-webhook` - Processes payment webhooks from 9PSB payment provider

**Database**: PostgreSQL (connection via `DATABASE_URL` environment variable).

### Key Libraries

**Frontend**:
- `@supabase/supabase-js` - Supabase client SDK
- `@tanstack/react-query` - Server state management
- `react-hook-form` + `@hookform/resolvers` - Form handling and validation
- `lucide-react` - Icon library
- `wouter` - Lightweight routing

**Backend**:
- `drizzle-orm` - Type-safe SQL query builder
- `drizzle-kit` - Schema migration tool
- `express` - Web framework
- `bcryptjs` - Password hashing
- `pg` - PostgreSQL client
- `zod` - Runtime type validation
- `dotenv` - Environment variable management

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (required)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for Edge Functions)
- `SENDGRID_API_KEY` - SendGrid API key for email notifications