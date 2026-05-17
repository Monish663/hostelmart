import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue } from 'firebase/database'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
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

/* Database helpers */
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

/* Owner Auth - email/password via Firebase Auth - no password in code */
export const ownerLogin = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const ownerLogout = () => signOut(auth)

export const onOwnerAuthChange = (callback) =>
  onAuthStateChanged(auth, callback)

/* Customer Phone OTP Auth */
export const setupRecaptcha = (elementId) => {
  if (window.recaptchaVerifier) {
    try { window.recaptchaVerifier.clear() } catch(e) {}
    window.recaptchaVerifier = null
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {},
  })
  return window.recaptchaVerifier
}

export const sendOtp = async (phoneNumber) => {
  const verifier = setupRecaptcha('recaptcha-container')
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier)
  return confirmation
}

export const customerLogout = () => signOut(auth)

export { database }
