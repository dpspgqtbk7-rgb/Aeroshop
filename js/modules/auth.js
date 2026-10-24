// js/modules/auth.js
import { store } from '../core/store.js';
import { auth, googleProvider, fbMethods } from '../../firebase-config.js';

export function initAuthObserver() {
    fbMethods.onAuthStateChanged(auth, (user) => {
        if (user) {
            const userProfile = {
                uid: user.uid,
                displayName: user.displayName || 'Pasajero',
                email: user.email,
                photoURL: user.photoURL || ''
            };
            
            store.setState({ currentUserProfile: userProfile });
            renderUserProfileUI(userProfile);
        } else {
            store.setState({ currentUserProfile: null });
            renderUserProfileUI(null);
        }
    });
}

export async function loginWithGoogle() {
    try {
        await fbMethods.signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("❌ Error al iniciar sesión:", error);
    }
}

export async function logoutUser() {
    try {
        await fbMethods.signOut(auth);
    } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
    }
}
export async function logoutUser() {
    try {
        await fbMethods.signOut(auth);
    } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
    }
}
function renderUserProfileUI(profile) {
    const userContainer = document.getElementById('user-passport-card');
    const loginBtn = document.getElementById('btn-login');
    const logoutBtn = document.getElementById('btn-logout');

   

    if (profile) {
        if (userAvatar) userAvatar.src = profile.photoURL;
        if (userEmail) userEmail.innerText = profile.email;
        if (editNombreReal && !editNombreReal.value) editNombreReal.value = profile.displayName;
    } else {
        if (userAvatar) userAvatar.src = '';
        if (userEmail) userEmail.innerText = 'Sin sesión iniciada';
        if (editNombreReal) editNombreReal.value = '';
    }
}