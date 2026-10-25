// js/modules/auth.js
import { store } from '../core/store.js';
import { showToast, closeModalState } from '../ui.js';
import { auth, db, googleProvider, fbMethods } from '../../firebase-config.js';

const COLECCION_USUARIOS = 'usuarios';

export function initAuthObserver() {
    fbMethods.onAuthStateChanged(auth, (user) => {
        if (user) {
            const userProfile = {
                uid: user.uid,
                displayName: user.displayName || 'Pasajero',
                email: user.email,
                photoURL: user.photoURL || 'logo-cookies.png'
            };

            store.setState({ currentUserProfile: userProfile });
            renderUserProfileUI(userProfile);
            cerrarLoginSiEstabaAbierto();
            cargarPerfilGuardado(user.uid);
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
        // Cerrar la ventanita de Google a propósito no es un error
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return;

        console.error('❌ Error al iniciar sesión:', error);
        if (error.code === 'auth/unauthorized-domain') {
            console.warn('Agrega tu dominio de Vercel en Firebase → Authentication → Settings → Authorized domains.');
        }
        showToast('No se pudo iniciar sesión. Intenta de nuevo.', 'error');
    }
}

export async function logoutUser() {
    try {
        await fbMethods.signOut(auth);
        showToast('Sesión cerrada ✈️');
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        showToast('No se pudo cerrar la sesión', 'error');
    }
}

// Guarda nombre y apodo del Pasaporte en Firestore: usuarios/{uid}
export async function guardarDatosPerfil() {
    const { currentUserProfile } = store.getState();
    if (!currentUserProfile) {
        showToast('Inicia sesión para guardar tus datos', 'error');
        return;
    }

    const nombreReal = (document.getElementById('editNombreReal')?.value || '').trim().slice(0, 80);
    const apodo = (document.getElementById('editApodo')?.value || '').trim().slice(0, 40);

    try {
        await fbMethods.setDoc(
            fbMethods.doc(db, COLECCION_USUARIOS, currentUserProfile.uid),
            { nombreReal, apodo, email: currentUserProfile.email, actualizadoEn: new Date().toISOString() },
            { merge: true }
        );
        showToast('💾 Datos guardados en tu Pasaporte');
    } catch (error) {
        console.error('❌ Error al guardar perfil:', error);
        showToast('No se pudieron guardar tus datos. Intenta de nuevo.', 'error');
    }
}

async function cargarPerfilGuardado(uid) {
    try {
        const snap = await fbMethods.getDoc(fbMethods.doc(db, COLECCION_USUARIOS, uid));
        if (!snap.exists()) return;
        const datos = snap.data();
        const nombre = document.getElementById('editNombreReal');
        const apodo = document.getElementById('editApodo');
        if (nombre && datos.nombreReal) nombre.value = datos.nombreReal;
        if (apodo && datos.apodo) apodo.value = datos.apodo;
    } catch (error) {
        // Si las reglas de Firestore aún no están listas, el sitio sigue funcionando
        console.warn('No se pudo leer el perfil guardado:', error.code || error);
    }
}

function cerrarLoginSiEstabaAbierto() {
    const login = document.getElementById('loginModal');
    if (login && login.classList.contains('active')) {
        login.classList.remove('active');
        closeModalState();
    }
}

function renderUserProfileUI(profile) {
    const userAvatar = document.getElementById('userAvatar');
    const userEmail = document.getElementById('userEmail');
    const editNombreReal = document.getElementById('editNombreReal');
    const editApodo = document.getElementById('editApodo');

    if (profile) {
        if (userAvatar) userAvatar.src = profile.photoURL || 'logo-cookies.png';
        if (userEmail) userEmail.textContent = profile.email;
        if (editNombreReal && !editNombreReal.value) editNombreReal.value = profile.displayName;
    } else {
        if (userAvatar) userAvatar.src = 'logo-cookies.png';
        if (userEmail) userEmail.textContent = 'Sin sesión iniciada';
        if (editNombreReal) editNombreReal.value = '';
        if (editApodo) editApodo.value = '';
    }
}
