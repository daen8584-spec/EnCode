import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "./firebase.js";

const ERRORS = {
    "auth/email-already-in-use": "Este email já está em uso.",
    "auth/invalid-email": "Email inválido.",
    "auth/invalid-credential": "Email ou senha inválidos.",
    "auth/user-not-found": "Email ou senha inválidos.",
    "auth/wrong-password": "Email ou senha inválidos.",
    "auth/weak-password": "Senha muito fraca. Use pelo menos 8 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Falha de conexão. Verifique sua internet."
};

const translate = (error) => new Error(ERRORS[error.code] ?? "Erro inesperado. Tente novamente.");

export async function signIn(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        throw translate(error);
    }
}

export async function signUp(name, email, password) {
    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name });
    } catch (error) {
        throw translate(error);
    }
}

export const logOut = () => signOut(auth);

export const displayName = (user) => user.displayName?.trim() || user.email.split("@")[0];

export async function requireUser() {
    await auth.authStateReady();
    if (auth.currentUser) return auth.currentUser;
    location.replace("login.html");
    return new Promise(() => {}); // the page is unloading; halt the caller
}
