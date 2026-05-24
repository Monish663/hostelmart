import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue, remove } from 'firebase/database'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
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
const storage  = getStorage(app)
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

export const dbAppendOrder = async (order) => {
  await set(ref(database, `orders/${order.id}`), order)
}

export const dbDeleteOrder = async (orderId) => {
  await remove(ref(database, `orders/${orderId}`))
}

/* ── Upload product image to Firebase Storage ── */
export const uploadProductImage = async (file, productId) => {
  const ext      = file.name.split('.').pop()
  const imageRef = storageRef(storage, `products/${productId}.${ext}`)
  await uploadBytes(imageRef, file)
  const url = await getDownloadURL(imageRef)
  return url
}

/* ── Auth ── */
export const ownerLogin  = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const ownerLogout = () => signOut(auth)
export const onOwnerAuthChange = (callback) => onAuthStateChanged(auth, callback)
export const signInCustomer = () => signInAnonymously(auth)

export { database, storage }
