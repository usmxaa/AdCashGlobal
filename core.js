// core.js - AdCashGlobal Central System Manager
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, doc, onSnapshot, setDoc, updateDoc, 
    collection, addDoc, getDoc, query, orderBy, where, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ১. আপনার দেওয়া লেটেস্ট Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_B9Bu8cnavz5I1sFrXCdPRfTQL1Vhbuc",
    authDomain: "adcashglobal-3ab99.firebaseapp.com",
    projectId: "adcashglobal-3ab99",
    storageBucket: "adcashglobal-3ab99.firebasestorage.app",
    messagingSenderId: "810638190997",
    appId: "1:810638190997:web:70705c6cca822c0472ee9c",
    measurementId: "G-WW075X1XDT"
};

// ২. Firebase ইনিশিয়ালাইজ করা
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ৩. অ্যাডমিন সেটিংস সিঙ্ক (১৫টি পেজের রিওয়ার্ড ও নোটিশ কন্ট্রোল করার জন্য)
export function syncGlobalSettings(callback) {
    const settingsRef = doc(db, "settings", "global");
    onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            console.log("No global settings found. Please set them from Admin Panel.");
        }
    });
}

// ৪. ইউজার ডাটা রিয়েল-টাইম সিঙ্ক (ব্যালেন্স ও প্রোফাইল আপডেটের জন্য)
export function syncUserData(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    callback(docSnap.data());
                }
            });
        }
    });
}

// ৫. এক্সপোর্ট করা হচ্ছে প্রয়োজনীয় সব ফাংশন (যাতে অন্য পেজ থেকে ব্যবহার করা যায়)
export { 
    doc, setDoc, updateDoc, collection, addDoc, getDoc, 
    onSnapshot, query, orderBy, where, deleteDoc,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
};
