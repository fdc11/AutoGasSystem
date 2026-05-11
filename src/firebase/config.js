import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBjIJNdYUY2ojgw5Y_hZevYc0PyFTiAQ8s",
  authDomain: "autogas-sistema.firebaseapp.com",
  projectId: "autogas-sistema",
  storageBucket: "autogas-sistema.firebasestorage.app",
  messagingSenderId: "873046899744",
  appId: "1:873046899744:web:9dc9cd23778f52492b5045"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app