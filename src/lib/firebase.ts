import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQTLi0ygFy6TrfBRgT-BxjDOkWCqtoXjs",
  authDomain: "cronicas-do-tempo.firebaseapp.com",
  projectId: "cronicas-do-tempo",
  storageBucket: "cronicas-do-tempo.firebasestorage.app",
  messagingSenderId: "1014650260020",
  appId: "1:1014650260020:web:3e8f5c45f74f7b50ad1861",
  measurementId: "G-6XEWLDE4X1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
