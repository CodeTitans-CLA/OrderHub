# OrderHub v3 — Google Sheets + Multi-User PWA

OrderHub is a responsive Next.js dashboard that uses Google Sheets as the master order database. MongoDB is used only for users, profiles, targets, password recovery, verification, and audit logs.

## Main features

- Premium responsive dashboard and installable PWA.
- Google Sheet live sync and CRUD for admins.
- Multi-select filters: Main Team, Department Team, Status, Service Line and Month.
- Admin dashboard: all orders, team filters, status totals, amounts, deadlines, activities and user management.
- User dashboard: only orders matched to the user's Sheet name, personal status counts, delivered count/amount and $1100 monthly target progress.
- Two login experiences: Admin login and User login.
- Multiple user accounts stored in MongoDB.
- Google OAuth login with verified Google email and Google profile photo.
- Gmail email/password signup with verification flow.
- Forgot/reset password flow.
- Admin can map a user to the exact Google Sheet employee/assignee name and change monthly target.
- Activity log for website changes and Apps Script webhook support for Sheet edits.

## Quick start

1. Copy `.env.example` to `.env.local` and fill in credentials.
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000`

Read `SETUP-BANGLA.md` for detailed Bangla setup.
