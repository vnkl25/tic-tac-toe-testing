import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, /*connectAuthEmulator*/ } from "firebase/auth";
import { getFirestore, /*connectFirestoreEmulator*/  } from "firebase/firestore";
import { getStorage, /*connectStorageEmulator*/ } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA94NIVqQrfCk5m34OE9p8Ho6h3epuC-e8",
  authDomain: "tic-tac-toe-testing-cc84f.firebaseapp.com",
  projectId: "tic-tac-toe-testing-cc84f",
  storageBucket: "tic-tac-toe-testing-cc84f.firebasestorage.app",
  messagingSenderId: "725947059339",
  appId: "1:725947059339:web:d78e00fa9278b48a52588e"
};

const app = initializeApp(firebaseConfig);

// Auth 
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Firestore
const db = getFirestore(app);

// Storage
const storage = getStorage(app);

// Only connect to emulators when running locally
/*if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}*/

export { auth, provider };
export  { db };
export { storage };
