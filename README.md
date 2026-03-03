# 💰 SpendSmart — Personal Finance Dashboard

A full-stack expense tracking web app built with React, Firebase, and Recharts.
Track daily expenses, visualize spending patterns, and get smart financial insights.

---

## 🚀 How to Publish (Step by Step)

### PART 1 — Firebase Setup (Your Job — 5 mins)

> Firebase is the free backend that stores your data and handles login.

1. **Go to** [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add Project"** → Enter any name (e.g. `spendsmart`) → Continue
3. Disable Google Analytics (optional) → **Create Project**

#### Enable Authentication
4. In the left sidebar → **Authentication** → **Get Started**
5. Under **Sign-in method** tab:
   - Enable **Email/Password** → Save
   - Enable **Google** → add your support email → Save

#### Enable Firestore Database
6. In sidebar → **Firestore Database** → **Create Database**
7. Choose **"Start in production mode"** → Select your region → Done

#### Set Security Rules
8. In Firestore → **Rules** tab → Replace ALL existing text with:
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
9. Click **Publish**

#### Get Your Config Keys
10. Go to **Project Settings** (gear icon ⚙️ in sidebar) → **General** tab
11. Scroll down to **"Your apps"** → Click **"Web"** icon (`</>`)
12. Register app with any nickname → **Register App**
13. You'll see a config object like:
```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "yourapp.firebaseapp.com",
  projectId: "yourapp",
  storageBucket: "yourapp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```
14. **Copy these values** — you'll need them next.

---

### PART 2 — Local Setup (Run on Your Computer)

> Requires: [Node.js](https://nodejs.org) (v18+) installed

```bash
# 1. Extract the project zip / open the folder
cd spendsmart

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
```

Now open `.env` in any text editor (Notepad, VS Code, etc.) and fill in your Firebase values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=yourapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yourapp
VITE_FIREBASE_STORAGE_BUCKET=yourapp.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

```bash
# 4. Run the app locally
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — the app should load with Firebase live!

---

### PART 3 — Publish to Vercel (Free Hosting — 3 mins)

> Vercel gives you a free public URL like `spendsmart.vercel.app`

1. **Push your code to GitHub:**
   - Go to [github.com](https://github.com) → New repository → `spendsmart`
   - Upload all project files (or use Git commands below)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/spendsmart.git
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com) → Sign up free with GitHub
   - Click **"Add New Project"** → Import your `spendsmart` repo
   - Framework: **Vite** (auto-detected)

3. **Add Environment Variables in Vercel:**
   - In the deploy setup → click **"Environment Variables"**
   - Add each variable from your `.env` file:
     - `VITE_FIREBASE_API_KEY` → your value
     - `VITE_FIREBASE_AUTH_DOMAIN` → your value
     - `VITE_FIREBASE_PROJECT_ID` → your value
     - `VITE_FIREBASE_STORAGE_BUCKET` → your value
     - `VITE_FIREBASE_MESSAGING_SENDER_ID` → your value
     - `VITE_FIREBASE_APP_ID` → your value

4. Click **"Deploy"** → Wait 60 seconds → **Your app is live!** 🎉

---

### PART 4 — Authorize Your Domain in Firebase

After deploying to Vercel, you must whitelist your URL in Firebase:

1. Firebase Console → **Authentication** → **Settings** tab
2. Under **"Authorized domains"** → Click **"Add domain"**
3. Enter your Vercel URL: `spendsmart.vercel.app` (without https://)
4. Click **Add** — Google Sign-in will now work on your live site

---

## 📁 Project Structure

```
spendsmart/
├── public/
│   └── favicon.svg          # App icon
├── src/
│   ├── App.jsx              # Main app (all components)
│   └── main.jsx             # React entry point
├── .env.example             # Template for environment variables
├── .env                     # Your secrets (NEVER commit this!)
├── .gitignore               # Keeps .env out of Git
├── firestore.rules          # Firestore security rules
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── vercel.json              # Vercel deployment config
└── vite.config.js           # Vite bundler config
```

---

## ✅ Feature Checklist

| Feature | Status |
|---|---|
| Add / Edit / Delete expenses | ✅ |
| Firebase Authentication (Email + Google) | ✅ |
| Firestore real-time sync | ✅ |
| Dashboard with stat cards | ✅ |
| Area chart — spending trend | ✅ |
| Pie chart — category breakdown | ✅ |
| Bar chart — daily spend | ✅ |
| Smart financial insights | ✅ |
| Budget tracker with alerts | ✅ |
| Filter & sort transactions | ✅ |
| Mobile responsive layout | ✅ |
| Demo mode (no Firebase needed) | ✅ |
| Vercel deployment config | ✅ |
| Secure Firestore rules | ✅ |

---

## 🔒 Security Notes

- `.env` is in `.gitignore` — your Firebase keys are never uploaded to GitHub
- Firestore rules ensure each user can only access their own data
- Firebase API keys are safe to expose in frontend code — they're restricted by Firestore rules and authorized domains

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Auth | Firebase Authentication |
| Database | Cloud Firestore (NoSQL) |
| Charts | Recharts |
| Hosting | Vercel (free) |
| Fonts | DM Sans + Playfair Display + JetBrains Mono |

---

## 📞 Troubleshooting

**"Firebase: Error (auth/unauthorized-domain)"**
→ You forgot Step 4. Add your Vercel domain to Firebase authorized domains.

**"Missing env variables / Demo mode showing on live site"**
→ Environment variables weren't added in Vercel. Go to Vercel → Project Settings → Environment Variables.

**"npm install fails"**
→ Make sure Node.js v18+ is installed: `node --version`

**"Firestore permission denied"**
→ Check your Firestore security rules match exactly what's in `firestore.rules`.
