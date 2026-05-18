import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue, push, remove } from 'firebase/database'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
  onAuthStateChanged,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app      = initializeApp(firebaseConfig)
const database = getDatabase(app)
export const auth = getAuth(app)

/* ── Database helpers ── */
export const dbSet = async (path, data) => {
  await set(ref(database, path), data)
}

export const dbGet = async (path) => {
  const snapshot = await get(ref(database, path))
  return snapshot.exists() ? snapshot.val() : null
}

export const dbListen = (path, callback) => {
  return onValue(ref(database, path), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null)
  })
}

/* ── Append a single order securely (cannot overwrite existing) ── */
export const dbAppendOrder = async (order) => {
  // Write to orders/{orderId} — rules block any edit to existing orders
  await set(ref(database, `orders/${order.id}`), order)
}

/* ── Delete an order properly ── */
export const dbDeleteOrder = async (orderId) => {
  console.log('Firebase deleting:', orderId)
  const r = ref(database, `orders/${orderId}`)
  console.log('Ref path:', r.toString())
  await remove(r)
  console.log('Firebase delete done')
}

/* ── Owner Auth — email/password, never stored in code ── */
export const ownerLogin  = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const ownerLogout = () => signOut(auth)
export const onOwnerAuthChange = (callback) => onAuthStateChanged(auth, callback)

/* ── Customer Auth — anonymous token so rules can verify real users ── */
export const signInCustomer = () => signInAnonymously(auth)
export const customerLogout = () => signOut(auth)

export { database }
