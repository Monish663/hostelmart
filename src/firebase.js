import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

/* ── Write data to a path ── */
export const dbSet = async (path, data) => {
  await set(ref(database, path), data)
}

/* ── Read data once from a path ── */
export const dbGet = async (path) => {
  const snapshot = await get(ref(database, path))
  return snapshot.exists() ? snapshot.val() : null
}

/* ── Real-time listener — calls callback on every change ── */
export const dbListen = (path, callback) => {
  const unsubscribe = onValue(ref(database, path), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null)
  })
  return unsubscribe   // call this to stop listening
}

export { database }
