# SARIPH POS project notes

Source reviewed: a local collaborator-owned checkout. The source repository was read only; this portfolio does not link to it or claim public deployment.

## Verified scope

- React/Create React App frontend, PHP 8.2+ and Laravel 12 backend, Sanctum authentication, and a local MySQL configuration.
- The API has routes for login, products, users, sales, discounts, cancellation, post-void, receipts, dashboard statistics, and audit/transaction history. Cashier, supervisor, and admin roles have different permissions.
- `c0d20a0` is credited to `euniels` and connects the React frontend to the backend API, replacing hardcoded data.
- `8e7e8cb`, `fba93b6`, `d7b0df4`, and `e071064` show backend scaffolding, middleware/routes/CORS, and seed setup by `euniels`.
- Merge commits `18b4e93`, `5a9efe0`, `6c719d7`, `585ebc5`, `4ae7469`, and `c8d3f35` are credited to Eunel Guarte and integrate team branches/pull requests.
- Feature commits also credit teammates for authentication/users, products, sales, and receipt/audit modules. The case study describes these as team work rather than claiming sole authorship.
- The user reported leading backend development and handling final integration, polishing, and QA. Those responsibilities are reflected in the portfolio copy; the history independently confirms backend setup, merges, and a final integration commit.

## Screenshots

`public/images/sariph-pos/` contains authenticated 1440 × 900 captures from the local React frontend and Laravel/MySQL backend: cashier terminal, products, admin dashboard, users, transaction history, and audit log. They show local demo/test data, including test voids and cancellations, and do not represent production activity. No sale or product was created for the captures. `public/images/sariph-pos-login.png` is an earlier local login capture, and `public/images/sariph-pos-architecture.svg` diagrams the verified architecture. All images used by the portfolio are stored inside the portfolio directory.

## Run the local system (PowerShell)

Prerequisites: Node.js, PHP 8.2+, Composer, and the database configured in `backend/.env` (the current local configuration selects MySQL). Use two terminals:

```powershell
# From the local point-of-sales checkout root
cd backend
composer install
php artisan serve
```

```powershell
# From the local point-of-sales checkout root
npm.cmd ci
npm.cmd start
```

Open `http://localhost:3000`; the frontend API URL is hardcoded to `http://localhost:8000/api`. The backend serves on port 8000 by default. On a new database, create/configure `backend/.env`, run `php artisan key:generate`, then `php artisan migrate` and `php artisan db:seed`. Do not reseed an existing database: the seeder calls `User::create` for the demo accounts and can hit duplicate email constraints.

The checkout has an uncommitted change to `backend/.gitignore`; preserve it. Do not include `.env`, credentials, customer data, or the collaborator's repository link in the public portfolio. Capture only demo-data screens for any future screenshots.
