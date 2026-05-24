import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue, remove } from 'firebase/database'
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

export const dbAppendOrder = async (order) => {
  await set(ref(database, `orders/${order.id}`), order)
}

export const dbDeleteOrder = async (orderId) => {
  await remove(ref(database, `orders/${orderId}`))
}

/* ── Upload image to Cloudinary (free, no billing needed) ── */
export const uploadProductImage = async (file) => {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  // Check config
  if (!cloudName || cloudName === 'paste_your_cloud_name_here') {
    throw new Error('Cloudinary Cloud Name not set in .env file')
  }
  if (!uploadPreset) {
    throw new Error('Cloudinary Upload Preset not set in .env file')
  }

  // Check file size (max 3MB)
  if (file.size > 3 * 1024 * 1024) {
    throw new Error('Image too large. Please use an image under 3MB.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'hostelmart')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()

  // Show exact Cloudinary error if any
  if (!res.ok || data.error) {
    throw new Error('Cloudinary error: ' + (data.error?.message || res.statusText))
  }

  return data.secure_url
}

/* ── Auth ── */
export const ownerLogin  = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const ownerLogout = () => signOut(auth)
export const onOwnerAuthChange = (callback) => onAuthStateChanged(auth, callback)
export const signInCustomer = () => signInAnonymously(auth)

export { database }
