# 🏪 HostelMart — Hostel Grocery Delivery App

A full-stack grocery ordering system for hostels with real-time Firebase sync,
owner dashboard, and room-based delivery.

---

## 📁 Project File Structure

```
hostelmart/
├── public/
├── src/
│   ├── components/
│   │   ├── Badge.jsx          ← Order status badge
│   │   ├── CustomerPanel.jsx  ← Customer shop + cart + orders
│   │   ├── OwnerDash.jsx      ← Owner dashboard stats
│   │   ├── OwnerHistory.jsx   ← Past orders & revenue
│   │   ├── OwnerLogin.jsx     ← Protected login screen
│   │   ├── OwnerOrders.jsx    ← Live orders management
│   │   ├── OwnerPanel.jsx     ← Owner shell with tabs
│   │   └── OwnerStock.jsx     ← Inventory management
│   ├── App.jsx                ← Root app + Firebase listeners
│   ├── constants.js           ← Colours, products, credentials
│   ├── firebase.js            ← Firebase SDK setup
│   ├── main.jsx               ← React entry point
│   └── styles.js              ← Shared style helpers
├── index.html
├── package.json
├── vite.config.js
├── .env                       ← Your secret Firebase keys (DO NOT COMMIT)
├── .env.example               ← Template for .env
└── .gitignore
```

---

## 🚀 STEP-BY-STEP SETUP

---

### STEP 1 — Install Node.js

1. Go to https://nodejs.org
2. Download the **LTS version** (e.g. 20.x)
3. Install it (click Next → Next → Finish)
4. Open a terminal and verify:
   ```
   node -v
   npm -v
   ```
   Both should show version numbers.

---

### STEP 2 — Open in VSCode

1. Open **VSCode**
2. Go to **File → Open Folder** → select the `hostelmart` folder
3. Open the terminal: **Terminal → New Terminal**

---

### STEP 3 — Install Dependencies

In the VSCode terminal, run:

```bash
npm install
```

Wait for it to finish (downloads React, Firebase, Vite).

---

### STEP 4 — Set Up Firebase Database

**A. Create Firebase Project**
1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Name it `hostelmart` → Continue → Continue → Create project

**B. Create Realtime Database**
1. In left sidebar → **Build → Realtime Database**
2. Click **"Create Database"**
3. Choose any location (e.g. asia-southeast1) → Next
4. Select **"Start in test mode"** → Enable
5. You will see your database URL like:
   `https://hostelmart-default-rtdb.firebaseio.com`

**C. Create Web App & Get Config**
1. Click the **gear icon ⚙️** → Project Settings
2. Scroll down → Under "Your apps" → click the **Web icon (</>)**
3. App nickname: `hostelmart-web` → Register app
4. You will see a config object like:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "hostelmart.firebaseapp.com",
     databaseURL: "https://hostelmart-default-rtdb.firebaseio.com",
     projectId: "hostelmart",
     storageBucket: "hostelmart.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc123"
   };
   ```
5. Copy these values — you need them for Step 5.

---

### STEP 5 — Create Your .env File

1. In the `hostelmart` folder, create a file called `.env`
   (copy from `.env.example`)
2. Fill in your Firebase values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=hostelmart.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://hostelmart-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=hostelmart
VITE_FIREBASE_STORAGE_BUCKET=hostelmart.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

> ⚠️ IMPORTANT: The `.env` file is in `.gitignore` so it will NOT be uploaded
> to GitHub. Your keys stay private.

---

### STEP 6 — Run Locally

```bash
npm run dev
```

Open your browser at: **http://localhost:5173**

The app should load and connect to Firebase. Test it!

**Owner Login:**
- User ID: `admin`
- Password: `hostel123`

> To change credentials, edit `src/constants.js` lines:
> ```js
> export const OWNER_ID  = 'admin'
> export const OWNER_PWD = 'hostel123'
> ```

---

### STEP 7 — Push to GitHub

**A. Create a GitHub account** at https://github.com if you don't have one.

**B. Create a new repository**
1. Go to https://github.com/new
2. Repository name: `hostelmart`
3. Set to **Public** (required for free Vercel hosting)
4. Click **"Create repository"**

**C. Push your code**

In VSCode terminal:

```bash
git init
git add .
git commit -m "Initial HostelMart commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hostelmart.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

> ✅ The `.env` file will NOT be pushed (it's in .gitignore). Good!

---

### STEP 8 — Deploy to Vercel

**A. Create Vercel account**
1. Go to https://vercel.com
2. Sign up with your **GitHub account** (click "Continue with GitHub")

**B. Import your project**
1. On Vercel dashboard → click **"Add New Project"**
2. Find and click **"hostelmart"** from your GitHub repos
3. Click **"Import"**

**C. Add Environment Variables (Firebase keys)**
1. Before clicking Deploy, expand **"Environment Variables"**
2. Add each variable from your `.env` file one by one:
   - `VITE_FIREBASE_API_KEY` → paste value
   - `VITE_FIREBASE_AUTH_DOMAIN` → paste value
   - `VITE_FIREBASE_DATABASE_URL` → paste value
   - `VITE_FIREBASE_PROJECT_ID` → paste value
   - `VITE_FIREBASE_STORAGE_BUCKET` → paste value
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` → paste value
   - `VITE_FIREBASE_APP_ID` → paste value

**D. Deploy**
1. Click **"Deploy"**
2. Wait ~2 minutes
3. You'll get a live URL like: `https://hostelmart-xyz.vercel.app` 🎉

---

### STEP 9 — Add Vercel Domain to Firebase (Important!)

To allow your live Vercel app to talk to Firebase:

1. Go to Firebase Console → **Authentication → Settings → Authorized domains**
2. Click **"Add domain"**
3. Add your Vercel URL: `hostelmart-xyz.vercel.app`

Also update Firebase Database Rules for production (optional but recommended):
1. Firebase Console → Realtime Database → **Rules**
2. Change to:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
(Keep as test mode for now. Set up proper auth later for production.)

---

## 🔄 How Deployment Works After This

Every time you make changes:

```bash
git add .
git commit -m "your change description"
git push
```

Vercel automatically re-deploys within 1–2 minutes! ✅

---

## 🛠️ Changing Owner Password

Open `src/constants.js` and change:
```js
export const OWNER_ID  = 'admin'       // ← change this
export const OWNER_PWD = 'hostel123'   // ← change this
```
Then push to GitHub → Vercel redeploys automatically.

---

## ⚡ Tech Stack

| Layer     | Technology              |
|-----------|------------------------|
| Frontend  | React 18 + Vite        |
| Database  | Firebase Realtime DB   |
| Hosting   | Vercel (free)          |
| Repo      | GitHub                 |
| Sync      | Firebase onValue()     |

---

## 🆘 Common Problems

| Problem | Fix |
|---------|-----|
| `npm install` fails | Make sure Node.js is installed |
| App loads but no data | Check `.env` values match Firebase |
| Can't login on Vercel | Check environment variables in Vercel dashboard |
| Database not updating | Add your Vercel domain to Firebase authorized domains |
