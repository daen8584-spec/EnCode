import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore-lite.js";

export {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
export { arrayUnion, doc, getDoc, increment, setDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore-lite.js";

const app = initializeApp({
    apiKey: "AIzaSyBXzoRxfOjArQdFIn2QIN5FlRY5U850DSI",
    authDomain: "proyect-af2be.firebaseapp.com",
    projectId: "proyect-af2be",
    storageBucket: "proyect-af2be.firebasestorage.app",
    messagingSenderId: "824409969741",
    appId: "1:824409969741:web:fdc672d52ad2041c36f804"
});

export const auth = getAuth(app);
export const db = getFirestore(app);
