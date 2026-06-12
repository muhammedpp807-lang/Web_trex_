import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyABQUV4CwkdU1KSQ3WvIiuDf9rJE6mhoOw",
  authDomain: "web-trex.firebaseapp.com",
  projectId: "web-trex",
  storageBucket: "web-trex.firebasestorage.app",
  messagingSenderId: "527108898497",
  appId: "1:527108898497:web:f329b53d9a5e4e1f6d9e40"
};

// Initialize Firebase (prevent re-initialization in dev mode)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
