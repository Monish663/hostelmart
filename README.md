website link :
        https://hostelmart-beta.vercel.app/












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
