import { auth } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const AUTH_ERROR_MESSAGES = {
    "auth/email-already-in-use": "Este email já está em uso.",
    "auth/invalid-email": "Email inválido.",
    "auth/user-not-found": "Email ou senha inválidos.",
    "auth/wrong-password": "Email ou senha inválidos.",
    "auth/invalid-credential": "Email ou senha inválidos.",
    "auth/weak-password": "Senha muito fraca. Use pelo menos 8 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Falha de conexão. Verifique sua internet."
};

function mapAuthError(error) {
    const message = AUTH_ERROR_MESSAGES[error.code];
    if (message) {
        return new Error(message);
    }
    return new Error("Erro inesperado. Tente novamente.");
}

export async function signInWithEmail(email, password) {
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return credential.user;
    } catch (error) {
        throw mapAuthError(error);
    }
}

export async function signUpWithEmail(name, email, password) {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        return credential.user;
    } catch (error) {
        throw mapAuthError(error);
    }
}

export function observeAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function signOutUser() {
    await signOut(auth);
}