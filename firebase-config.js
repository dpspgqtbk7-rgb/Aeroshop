// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCMuec9un_xOU2T3AP4SxElQWz14Js8HHU",
    authDomain: "aeroshop-cdmx.firebaseapp.com",
    projectId: "aeroshop-cdmx",
    storageBucket: "aeroshop-cdmx.firebasestorage.app",
    messagingSenderId: "990438625408",
    appId: "1:990438625408:web:e14f86cb118cf934f29665",
    measurementId: "G-LEFTFGQ91G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const fbMethods = { 
    doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where,
    signInWithPopup, signOut, onAuthStateChanged, 
    ref, uploadBytes, getDownloadURL 
};