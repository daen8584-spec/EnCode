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
    apiKey: "AIzaSyC80ld4eXYx38RFkUUYPdnkiJV4Dn3vT34",
    authDomain: "encoding-c67fb.firebaseapp.com",
    projectId: "encoding-c67fb",
    storageBucket: "encoding-c67fb.firebasestorage.app",
    messagingSenderId: "367974921915",
    appId: "1:367974921915:web:94b887ce22d3f2ac6f9b9e"
});

export const auth = getAuth(app);
export const db = getFirestore(app);
