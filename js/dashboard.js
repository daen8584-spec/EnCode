async function handleSignOut() {
    if (authService) {
        try {
            await authService.signOutUser();
        } catch (error) {
            console.error("Sign-out Falhou", error);
        }
    }
    window.location.href = "login.html";
}