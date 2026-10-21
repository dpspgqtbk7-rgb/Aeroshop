// js/modules/auth.js
import { store } from '../core/store.js';
import { fbAuth, fbProvider, signInWithPopup, signOut, onAuthStateChanged } from '../config/firebase.js';

export function initAuthObserver() {
    onAuthStateChanged(fbAuth, (user) => {
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
        await signInWithPopup(fbAuth, fbProvider);
    } catch (error) {
        console.error("❌ Error al iniciar sesión:", error);
    }
}

export async function logoutUser() {
    try {
        await signOut(fbAuth);
    } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
    }
}

function renderUserProfileUI(profile) {
    const userContainer = document.getElementById('user-passport-card');
    const loginBtn = document.getElementById('btn-login');
    const logoutBtn = document.getElementById('btn-logout');

    if (!userContainer) return;

    if (profile) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        userContainer.innerHTML = `
            <div class="passport-header">
                <img src="${profile.photoURL || 'img/default-avatar.png'}" class="passport-avatar" alt="Avatar">
                <div class="passport-info">
                    <h3>${profile.displayName}</h3>
                    <p class="passport-id">#USR-${profile.uid.slice(-5).toUpperCase()}</p>
                </div>
            </div>
        `;
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        userContainer.innerHTML = `<p>Inicia sesión para ver tu Pasaporte Aeroshop.</p>`;
    }
}