// core.js - AdCashGlobal Central Logic System
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, updateDoc, increment, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// আপনার Firebase কনফিগারেশন
const firebaseConfig = {
    apiKey: "AIzaSyD_B9Bu8cnavz5I1sFrXCdPRfTQL1Vhbuc",
    authDomain: "adcashglobal-3ab99.firebaseapp.com",
    projectId: "adcashglobal-3ab99",
    storageBucket: "adcashglobal-3ab99.firebasestorage.app",
    messagingSenderId: "810638190997",
    appId: "1:810638190997:web:70705c6cca822c0472ee9c"
};

// ইনিশিয়ালাইজেশন
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * ইউজার ডাটা রিয়েল-টাইমে সিঙ্ক করার ফাংশন
 * @param {Function} callback - ডাটা আপডেট হলে যা রান হবে
 */
export function syncUserData(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    callback(docSnap.data());
                }
            });
        } else {
            // লগইন না থাকলে লগইন পেজে পাঠিয়ে দেবে
            if (!window.location.pathname.includes("login.html") && !window.location.pathname.includes("register.html")) {
                window.location.href = "login.html";
            }
        }
    });
}

/**
 * ইনকাম বা ব্যালেন্স যোগ করার ফাংশন
 * @param {Number} amount - কত টাকা যোগ হবে
 * @param {String} taskType - কোন কাজের জন্য (যেমন: 'captcha', 'bonus')
 */
export async function addEarnings(amount, taskType = "general") {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    try {
        const updateData = {
            balance: increment(amount)
        };
        
        // টাস্ক অনুযায়ী আলাদা কাউন্টার আপডেট
        if (taskType === "captcha") updateData.captchasDone = increment(1);
        if (taskType === "daily") updateData.dailyStreak = increment(1);

        await updateDoc(userRef, updateData);
        return true;
    } catch (error) {
        console.error("Earnings Error:", error);
        throw error;
    }
}

/**
 * এডমিন সেটিংস আনার ফাংশন (লিমিট বা বোনাস কন্ট্রোল করতে)
 */
export async function getAdminSettings() {
    try {
        const settingsRef = doc(db, "admin", "settings");
        const snap = await getDoc(settingsRef);
        return snap.exists() ? snap.data() : {};
    } catch (e) {
        return {};
    }
}

// এক্সপোর্ট অবজেক্টস
export { auth, db };