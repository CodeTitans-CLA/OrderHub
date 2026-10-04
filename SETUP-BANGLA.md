# OrderHub v3 সেটআপ — বাংলা

## 1) `.env.local`
`.env.example` copy করে `.env.local` বানান। Google Sheet ID, tab, service account email/private key এবং MongoDB URI দিন।

## 2) Google Sheet
Service Account email-কে Sheet-এ Editor করুন। Header ideally:
`ID, Employee Name, Team1, Date, Profile, Price, Client's Name, Order ID, Order Link, Sheet Link, Assign Person, Team, Status, Service Line, Delivery Date, Delivery Amount, Deli_Last_Time, Deadline, Odoo Update, Remarks`

`Team1` = Main Team, `Team` = Department Team।

## 3) MongoDB
User account, profile, target, password reset এবং activity log-এর জন্য MongoDB দরকার। Local MongoDB হলে:
`MONGODB_URI=mongodb://127.0.0.1:27017/orderhub`
MongoDB Atlas ব্যবহার করলেও হবে।

## 4) Admin Login
`.env.local`-এর `USERS_JSON`-এ এক বা একাধিক Admin রাখুন। Admin সব data দেখতে/edit করতে পারবে।

## 5) Google User Login
Google Cloud Console → APIs & Services → Credentials → OAuth client ID → Web application তৈরি করুন।
Authorized redirect URI দিন:
`http://localhost:3000/api/auth/google/callback`
Deploy করলে production domain callback-ও add করুন।
তারপর `GOOGLE_OAUTH_CLIENT_ID` এবং `GOOGLE_OAUTH_CLIENT_SECRET` বসান।

Google login করলে Google profile photo dashboard-এ দেখাবে।

## 6) User mapping
User login করার পর Profile → `Google Sheet employee / assign name`-এ Sheet-এর exact নাম দেবে। Admin Users page থেকেও এই mapping set করা যায়। User শুধু নিজের matching orders দেখবে।

Matching হয় `Employee Name` exact match অথবা `Assign Person`-এর মধ্যে নাম থাকলে।

## 7) Target
প্রতি user-এর default target `$1100`। Admin → Users page থেকে আলাদা target change করা যায়। User dashboard Delivered status-এর `Delivery Amount` sum করে progress দেখায়।

## 8) Gmail signup / verification / forgot password
Google OAuth সবচেয়ে সহজ verified Gmail flow। Email/password signup-এ verification link লাগে। Email পাঠাতে Resend configure করুন:
`RESEND_API_KEY=...`
`EMAIL_FROM=OrderHub <noreply@yourdomain.com>`
Local development-এ Resend configure না থাকলে testing-এর জন্য verification/reset URL UI-তে দেখাবে।

## 9) Run
```powershell
npm install
npm run dev
```
Open: `http://localhost:3000`

## 10) PWA
Localhost বা HTTPS production-এ Chrome/Edge থেকে Install App করা যাবে।

## 11) Security
`.env.local` এবং `service-account.json` GitHub-এ commit করবেন না। Production deploy-এর আগে demo/admin passwords এবং all secrets change করুন।
