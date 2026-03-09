# 💰 SpendSmart — Personal Finance Dashboard

> A full-stack expense tracking web app built with **React 18**, **Firebase**, and **Recharts**.  
> Track daily expenses, visualize spending patterns, and get smart financial insights — all for free.

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite | 18.3.1 / 5.4.2 |
| Auth | Firebase Authentication | 10.12.0 |
| Database | Cloud Firestore (NoSQL) | 10.12.0 |
| Charts | Recharts | 2.12.7 |
| Hosting | Vercel (free) | — |
| Fonts | DM Sans · Playfair Display · JetBrains Mono | — |

---

## 📁 Project Structure

```
spendsmart/
├── public/
│   └── favicon.svg              # App icon
├── src/
│   ├── App.jsx                  # Main app — all components & logic
│   └── main.jsx                 # React entry point
├── .env.example                 # Template for environment variables
├── .env                         # ⚠️ Your secrets — NEVER commit this!
├── .gitignore                   # Keeps .env out of Git
├── firestore.rules              # Firestore security rules
├── index.html                   # HTML entry point with SEO meta tags
├── package.json                 # Dependencies
├── vercel.json                  # Vercel deployment config
└── vite.config.js               # Vite bundler config
```

---

## ✅ Features

| Feature | Status |
|---|---|
| Add / Edit / Delete expenses | ✅ |
| Firebase Authentication — Email + Google | ✅ |
| Firestore real-time sync | ✅ |
| Dashboard with stat cards | ✅ |
| Area chart — spending trend | ✅ |
| Pie chart — category breakdown | ✅ |
| Bar chart — daily spend | ✅ |
| Smart financial insights (JS rules) | ✅ |
| Budget tracker with color alerts | ✅ |
| Financial health score | ✅ |
| Filter & sort transactions | ✅ |
| Demo mode — works without Firebase | ✅ |
| Vercel deployment ready | ✅ |
| Secure Firestore rules | ✅ |

---

## 🚀 How to Run Locally

### Prerequisites
- [Node.js v18+](https://nodejs.org) installed
- A Firebase project (see Firebase Setup below)

```bash
# 1. Navigate into the project folder
cd spendsmart

# 2. Install all dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Then open .env and fill in your Firebase values (see below)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔥 Firebase Setup

### Step 1 — Create a Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → enter a name → **Create Project**

### Step 2 — Enable Authentication
1. Sidebar → **Build** → **Authentication** → **Get Started**
2. Under **Sign-in method**, enable:
   - ✅ **Email/Password**
   - ✅ **Google** (add your Gmail as support email)

### Step 3 — Enable Firestore
1. Sidebar → **Build** → **Firestore Database** → **Create Database**
2. Choose **Standard edition** → select region `asia-south1` (Mumbai) → **Next**
3. Choose **Start in production mode** → **Create**

### Step 4 — Set Security Rules
In Firestore → **Rules** tab, replace everything with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /expenses/{expenseId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Click **Publish**.

### Step 5 — Get Your Config Keys
1. Click the **⚙️ gear icon** → **Project Settings** → **General** tab
2. Scroll to **Your apps** → click the **</>** (Web) icon
3. Register with any nickname → copy the config object

---

## 🔑 Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

> ⚠️ **Never commit `.env` to GitHub.** It is already listed in `.gitignore`.

---

## 🌐 Deploy to Vercel (Free)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/spendsmart.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → sign up free with GitHub
2. Click **Add New Project** → import your `spendsmart` repo
3. Framework will be auto-detected as **Vite**
4. Under **Environment Variables**, add all 6 `VITE_FIREBASE_*` values from your `.env`
5. Click **Deploy** → wait ~60 seconds → your app is live! 🎉

### Step 3 — Authorize Your Domain in Firebase
After deploying, Google Sign-in needs your live URL whitelisted:

1. Firebase Console → **Authentication** → **Settings** tab
2. Under **Authorized domains** → **Add domain**
3. Enter your Vercel URL e.g. `spendsmart.vercel.app` (no `https://`)
4. Click **Add**

---

## 🔒 Security Notes

- `.env` is in `.gitignore` — Firebase keys are never uploaded to GitHub
- Firestore rules ensure each user can **only access their own data**
- Firebase API keys in frontend are safe — they are scoped by Firestore rules + authorized domains
- No credit card required — Firebase Spark (free) plan is sufficient for personal use

---

## 📦 Available Scripts

```bash
npm run dev        # Start local development server at localhost:5173
npm run build      # Build optimized production bundle → /dist
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint on source files
```

---

## 🐛 Troubleshooting

| Error | Fix |
|---|---|
| `npm` is not recognized | Install Node.js from nodejs.org and reopen terminal |
| PowerShell script disabled | Run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
| App shows Demo Mode on live site | Add all 6 `VITE_FIREBASE_*` env variables in Vercel dashboard |
| `auth/unauthorized-domain` | Add your Vercel URL to Firebase → Authentication → Authorized domains |
| `Firestore permission denied` | Check your Firestore security rules match the ones in `firestore.rules` |
| `npm install` fails | Run `node --version` — must be v18 or higher |

---

## 📄 License

This project is for personal and educational use.  
Built with ❤️ using React, Firebase, and Vite.
