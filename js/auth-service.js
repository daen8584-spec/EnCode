import { auth } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

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

const mapError = ({ code }) => new Error(AUTH_ERROR_MESSAGES[code] ?? "Erro inesperado. Tente novamente.");

export const signInWithEmail = async (email, password) => {
    try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        return user;
    } catch (error) {
        throw mapError(error);
    }
};

export const signUpWithEmail = async (name, email, password) => {
    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name });
        return user;
    } catch (error) {
        throw mapError(error);
    }
};

export const observeAuthState = (callback) => onAuthStateChanged(auth, callback);

export const signOutUser = () => signOut(auth);
