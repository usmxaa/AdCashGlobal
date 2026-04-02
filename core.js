// core.js - AdCashGlobal Central Logic System
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, updateDoc, increment, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_B9Bu8cnavz5I1sFrXCdPRfTQL1Vhbuc",
    authDomain: "adcashglobal-3ab99.firebaseapp.com",
    projectId: "adcashglobal-3ab99",
    storageBucket: "adcashglobal-3ab99.firebasestorage.app",
    messagingSenderId: "810638190997",
    appId: "1:810638190997:web:70705c6cca822c0472ee9c"
};

// Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * ইউজার ডাটা রিয়েল-টাইমে সিঙ্ক করার ফাংশন
 */
export function syncUserData(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            // রিয়েল-টাইম লিসেনার
            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    callback(docSnap.data());
                } else {
                    console.error("User document not found in Firestore!");
                }
            }, (error) => {
                console.error("Snapshot error:", error);
            });
        } else {
            // লগইন চেক: যদি ইউজার লগইন না থাকে এবং সে ড্যাশবোর্ডে থাকে, তবেই রিডাইরেক্ট হবে
            const path = window.location.pathname;
            if (!path.includes("login.html") && !path.includes("register.html")) {
                window.location.href = "login.html";
            }
        }
    });
}

/**
 * ইনকাম বা ব্যালেন্স যোগ করার ফাংশন
 */
export async function addEarnings(amount, taskType = "general") {
    const user = auth.currentUser;
    if (!user) {
        alert("Session expired. Please login again.");
        window.location.href = "login.html";
        return;
    }

    const userRef = doc(db, "users", user.uid);
    try {
        const updateData = {
            balance: increment(amount)
        };
        
        // টাস্ক অনুযায়ী আলাদা কাউন্টার আপডেট
        if (taskType === "captcha") updateData.captchasDone = increment(1);
        if (taskType === "daily") {
            updateData.dailyStreak = increment(1);
            updateData.lastDailyClaim = Date.now();
        }

        await updateDoc(userRef, updateData);
        return true;
    } catch (error) {
        console.error("Earnings Error:", error);
        alert("Sync error. Please check your internet connection.");
        throw error;
    }
}

/**
 * লগআউট ফাংশন
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

/**
 * এডমিন সেটিংস আনার ফাংশন
 */
export async function getAdminSettings() {
    try {
        const settingsRef = doc(db, "admin", "settings");
        const snap = await getDoc(settingsRef);
        return snap.exists() ? snap.data() : { dailyBonus: 0.050, captchaRate: 0.002 };
    } catch (e) {
        return { dailyBonus: 0.050, captchaRate: 0.002 }; // Default values
    }
}

export { auth, db };