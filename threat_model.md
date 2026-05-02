# Threat Model

## Project Overview

This project is a sports quiz and prize-wheel platform with a React frontend under `client/`, an Express API under `server/`, and a PostgreSQL database accessed through Drizzle. Users sign up, fund wallets, buy quiz sessions, earn points, spin for prizes, and can participate in a referral program. Production traffic is assumed to terminate over platform-managed TLS, and production runs with `NODE_ENV=production`.

The highest-risk production surfaces are the Express API routes that handle identity, profile data, wallet balances, quiz state, admin actions, and payment/webhook processing. There are also Supabase client and edge-function artifacts in the repository; those should be treated as shared or external surfaces and only scanned when they are still part of the deployed flow.

## Assets

- **User identities and account records** — email addresses, password hashes, profile details, referral relationships, and admin flags. Compromise enables impersonation, privilege escalation, and privacy loss.
- **Financial state** — wallet balances, funding totals, payment transactions, prize payouts, and referral rewards. Integrity failures here directly translate into cash loss or fraudulent credits.
- **Prize and game integrity** — quiz questions, correct answers, session outcomes, points, wheel spins, winners, and daily limits. If attackers can tamper with these values, they can fraudulently obtain prizes or reduce trust in the platform.
- **Sensitive personal and payout data** — phone numbers, location, banking details, winner records, and payment references. Exposure creates privacy and fraud risk.
- **Application secrets and third-party credentials** — database connection strings, payment-provider keys, webhook credentials, SendGrid and Supabase secrets. Leakage would allow direct abuse of external systems.

## Trust Boundaries

- **Browser to Express API** — all browser input is untrusted. The API must authenticate the caller and authorize every access to user, admin, payment, and prize resources.
- **Express API to PostgreSQL** — the API has direct authority over user balances, admin flags, and payout records. Any route-level authorization flaw or unsafe business logic can become full data compromise or financial fraud.
- **Express API to payment providers** — the server trusts Paystack and 9PSB responses to credit wallets. Webhooks and callbacks must be authenticated and bound to legitimate transactions.
- **Authenticated user to admin boundary** — admin-only operations include reading all users, changing balances, changing points, managing winners, and controlling referrals. This boundary must be enforced on the server, not just hidden in the UI.
- **Production app to legacy/shared Supabase artifacts** — `client/src`, `src/`, `supabase/functions`, and SQL migrations may represent legacy or side-channel production surfaces. These should only be treated as production-relevant when the deployed flow still depends on them.
- **Dev-only boundary** — Vite dev middleware, duplicate unused frontend trees, test helpers, and local scripts are out of scope unless production reachability is demonstrated.

## Scan Anchors

- **Production entry points:** `server/index.ts`, `server/routes.ts`, `client/src/main.tsx`, `client/src/App.tsx`
- **Highest-risk code areas:** `server/routes.ts`, `server/storage.ts`, `server/paystack.ts`, `server/psb-service.ts`
- **Public surfaces:** `/api/auth/*`, `/api/questions`, `/api/prizes`, `/api/winners/public`, payment initialization/callback/webhook routes
- **Authenticated/business surfaces:** profile, dashboard, wallet, quiz, wheel, referral, and payment status routes
- **Admin surfaces:** all `/api/admin/*` routes and any route that can change `isAdmin`, balances, points, winners, or referral settings
- **Usually ignore unless proven deployed:** root-level `src/` duplicate frontend tree, ad-hoc test files, Vite-only dev behavior

## Threat Categories

### Spoofing

The API must not trust user identity from `localStorage`, request bodies, or route parameters. All endpoints that operate on a user account or privileged action MUST bind the request to a server-verified session or token, and webhook endpoints MUST verify that the caller is the legitimate payment provider.

### Tampering

Users can influence quiz answers, session completion state, profile fields, and payment-related requests from the browser. Wallet credits, point awards, quiz outcomes, referral rewards, and admin-only settings MUST be calculated and enforced server-side from trusted state, not from client-submitted fields like `userId`, `isCorrect`, `pointsEarned`, or `isAdmin`.

### Information Disclosure

The application stores PII and payout information, including bank details and transaction history. User and admin APIs MUST only return fields necessary for the caller, MUST never expose password hashes, and MUST not allow one user to read another user's profile, wallet, referral, payment, or winner records.

### Denial of Service

Public auth, payment, and gameplay endpoints can be abused if they lack request throttling or idempotency controls. Expensive or state-changing routes SHOULD apply basic abuse controls, and externally triggered payment-processing paths MUST tolerate retries without duplicating credits.

### Elevation of Privilege

This project has a strong user/admin boundary and multiple money-moving actions. Admin routes, prize-management routes, and any route that can change balances, points, winner state, referral settings, or `isAdmin` MUST enforce server-side authorization, and state transitions MUST prevent repeated credits or replay-based privilege gain.
