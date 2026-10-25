// js/modules/auth.js
import { store } from '../core/store.js';
import { showToast, closeModalState } from '../ui.js';
import { auth, db, googleProvider, appleProvider, fbMethods } from '../../firebase-config.js';
import { iniciarPasaporte, detenerPasaporte } from './pasaporte.js';

const COLECCION_USUARIOS = 'usuarios';

/* ==========================================
   SESIÓN
   ========================================== */
export function initAuthObserver() {
    fbMethods.onAuthStateChanged(auth, (user) => {
        if (user) {
            const proveedorId = user.providerData?.[0]?.providerId || '';
            const userProfile = {
                uid: user.uid,
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || '',
                proveedor: proveedorId.includes('apple') ? 'Apple' : (proveedorId.includes('google') ? 'Google' : 'Cuenta'),
                creadaEn: user.metadata?.creationTime || ''
            };

            store.setState({ currentUserProfile: userProfile });
            renderUserProfileUI(userProfile);
            const login = cerrarLoginSiEstabaAbierto();
            cargarPerfilGuardado(userProfile);
            iniciarPasaporte(userProfile.uid);
            // Avisos (carga aparte: si falla, el login sigue funcionando)
            import('./push.js').then(m => m.iniciarPush()).catch(err => console.warn('Avisos no disponibles:', err));

            if (login.estabaAbierto) {
                if (login.desdePedido) {
                    showToast('✅ Sesión iniciada. Toca "Enviar pedido" otra vez 🚀');
                } else {
                    // Recién entró: se abre su Pasaporte con el aviso de notificaciones resaltado
                    document.getElementById('profileModal')?.classList.add('active');
                    document.getElementById('pushBox')?.classList.add('push-destacado');
                    document.body.classList.add('modal-open');
                    showToast('✅ Bienvenido a bordo ✈️');
                }
            }
        } else {
            store.setState({ currentUserProfile: null });
            renderUserProfileUI(null);
            detenerPasaporte();
        }
    });
}

// Entra con Google o Apple. Si el navegador bloquea la ventanita (pasa en iPhone), usa redirección.
async function loginConProveedor(provider, nombre) {
    try {
        await fbMethods.signInWithPopup(auth, provider);
    } catch (error) {
        // Cerrar la ventanita a propósito no es un error
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return;

        if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
            try { await fbMethods.signInWithRedirect(auth, provider); return; } catch (e) { error = e; }
        }

        console.error('❌ Error al iniciar sesión con ' + nombre + ':', error);
        const mensajes = {
            'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase (Authentication → Settings → Authorized domains).',
            'auth/operation-not-allowed': nombre + ' aún no está activado en Firebase (Authentication → Sign-in method).',
            'auth/account-exists-with-different-credential': 'Ese correo ya se registró con otro método. Entra con el que usaste antes.',
            'auth/network-request-failed': 'Sin internet. Revisa tu conexión.'
        };
        if (mensajes[error.code]) console.warn(mensajes[error.code]);
        showToast(error.code === 'auth/account-exists-with-different-credential'
            ? 'Ese correo ya está registrado con otro método (Google o Apple).'
            : error.code === 'auth/operation-not-allowed'
                ? nombre + ' todavía no está disponible. Usa otro método.'
                : 'No se pudo iniciar sesión. Intenta de nuevo.', 'error');
    }
}

export function loginWithGoogle() { return loginConProveedor(googleProvider, 'Google'); }
export function loginWithApple()  { return loginConProveedor(appleProvider, 'Apple'); }

export async function logoutUser() {
    try {
        await fbMethods.signOut(auth);
        document.getElementById('profileModal')?.classList.remove('active');
        closeModalState();
        showToast('Sesión cerrada ✈️');
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        showToast('No se pudo cerrar la sesión', 'error');
    }
}

/* ==========================================
   PERFIL (Firestore: usuarios/{uid})
   ========================================== */
const limpiar = (texto, max) => String(texto || '').replace(/[<>]/g, '').trim().slice(0, max);

export async function guardarDatosPerfil() {
    const { currentUserProfile } = store.getState();
    if (!currentUserProfile) {
        showToast('Inicia sesión para guardar tus datos', 'error');
        return;
    }

    const nombreReal = limpiar(document.getElementById('editNombreReal')?.value, 80);
    const apodo = limpiar(document.getElementById('editApodo')?.value, 40);
    const telefono = String(document.getElementById('editTelefono')?.value || '').replace(/\D/g, '');

    if (telefono && telefono.length !== 10) {
        showToast('Tu WhatsApp debe tener 10 dígitos', 'error');
        document.getElementById('editTelefono')?.focus();
        return;
    }

    const boton = document.querySelector('.btn-save-profile');
    const textoOriginal = boton ? boton.textContent : '';
    if (boton) { boton.disabled = true; boton.textContent = 'Guardando…'; }

    try {
        const ref = fbMethods.doc(db, COLECCION_USUARIOS, currentUserProfile.uid);
        const datos = {
            nombreReal, apodo, telefono,
            email: currentUserProfile.email,
            proveedor: currentUserProfile.proveedor,
            actualizadoEn: new Date().toISOString()
        };
        if (!currentUserProfile.yaExistia) datos.creadoEn = new Date().toISOString();
        await fbMethods.setDoc(ref, datos, { merge: true });
        store.setState({ currentUserProfile: { ...currentUserProfile, yaExistia: true, nombreReal, apodo, telefono } });
        pintarSaludo(apodo || nombreReal || currentUserProfile.displayName);
        showToast('💾 Datos guardados en tu Pasaporte');
    } catch (error) {
        console.error('❌ Error al guardar perfil:', error);
        showToast(error.code === 'permission-denied'
            ? 'Firebase no permitió guardar (revisa las reglas de Firestore).'
            : 'No se pudieron guardar tus datos. Intenta de nuevo.', 'error');
    } finally {
        if (boton) { boton.disabled = false; boton.textContent = textoOriginal; }
    }
}

async function cargarPerfilGuardado(perfil) {
    const nombre = document.getElementById('editNombreReal');
    const apodo = document.getElementById('editApodo');
    const tel = document.getElementById('editTelefono');
    try {
        const snap = await fbMethods.getDoc(fbMethods.doc(db, COLECCION_USUARIOS, perfil.uid));
        if (snap.exists()) {
            const d = snap.data();
            if (nombre) nombre.value = d.nombreReal || perfil.displayName || '';
            if (apodo) apodo.value = d.apodo || '';
            if (tel) tel.value = d.telefono || '';
            store.setState({ currentUserProfile: { ...store.getState().currentUserProfile, yaExistia: true } });
            pintarSaludo(d.apodo || d.nombreReal || perfil.displayName);
        } else if (nombre && !nombre.value) {
            nombre.value = perfil.displayName || '';
        }
    } catch (error) {
        // Si las reglas de Firestore aún no están listas, el sitio sigue funcionando
        console.warn('No se pudo leer el perfil guardado:', error.code || error);
    }
}

/* ==========================================
   PINTAR EL PERFIL EN PANTALLA
   ========================================== */
// Avatar con iniciales cuando la cuenta no trae foto (Apple casi nunca la trae)
function avatarIniciales(texto) {
    const letras = (String(texto || 'A').trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2) || 'A').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#1e293b"/><text x="50%" y="54%" font-family="Arial,sans-serif" font-size="64" font-weight="700" fill="#facc15" text-anchor="middle" dominant-baseline="middle">${letras.replace(/[<&]/g, '')}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function pintarSaludo(nombre) {
    const el = document.getElementById('profileGreeting');
    if (el) el.textContent = nombre ? `¡Bienvenido a bordo, ${nombre}! ✈️` : '¡Bienvenido a bordo! ✈️';
}

function cerrarLoginSiEstabaAbierto() {
    const login = document.getElementById('loginModal');
    const estado = { estabaAbierto: false, desdePedido: false };
    if (login && login.classList.contains('active')) {
        estado.estabaAbierto = true;
        estado.desdePedido = login.dataset.desdePedido === '1';
        login.classList.remove('active');
        delete login.dataset.desdePedido;
        closeModalState();
    }
    return estado;
}

function renderUserProfileUI(profile) {
    const avatar = document.getElementById('userAvatar');
    const email = document.getElementById('userEmail');
    const proveedor = document.getElementById('userProvider');
    const desde = document.getElementById('userSince');
    const nombre = document.getElementById('editNombreReal');
    const apodo = document.getElementById('editApodo');
    const tel = document.getElementById('editTelefono');

    if (profile) {
        if (avatar) {
            avatar.onerror = () => { avatar.onerror = null; avatar.src = avatarIniciales(profile.displayName || profile.email); };
            avatar.src = profile.photoURL || avatarIniciales(profile.displayName || profile.email);
        }
        // Apple puede ocultar el correo real (@privaterelay.appleid.com): se avisa en vez de mostrar algo raro
        if (email) email.textContent = /privaterelay\.appleid\.com$/i.test(profile.email)
            ? 'Correo privado de Apple 🔒' : (profile.email || 'Sin correo');
        if (proveedor) proveedor.textContent = `Sesión con ${profile.proveedor}`;
        if (desde) {
            const f = profile.creadaEn ? new Date(profile.creadaEn) : null;
            desde.textContent = f && !isNaN(f) ? 'Pasajero desde ' + f.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) : '';
        }
        if (nombre && !nombre.value) nombre.value = profile.displayName || '';
        pintarSaludo(profile.displayName);
    } else {
        if (avatar) avatar.src = avatarIniciales('A');
        if (email) email.textContent = 'Sin sesión iniciada';
        if (proveedor) proveedor.textContent = '';
        if (desde) desde.textContent = '';
        if (nombre) nombre.value = '';
        if (apodo) apodo.value = '';
        if (tel) tel.value = '';
        pintarSaludo('');
    }
}
