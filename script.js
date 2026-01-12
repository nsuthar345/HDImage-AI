// 1. Firebase Config (Apna wala hi rehne dein)
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "hd-image-ai.firebaseapp.com",
  projectId: "hd-image-ai",
  storageBucket: "hd-image-ai.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// UI Elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const userNameText = document.getElementById("userName");

// --- 1. LOGIN LOGIC ---
loginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log("Logged in:", result.user.displayName);
        })
        .catch((error) => {
            console.error("Login error:", error);
            alert("Login Failed! Please check Firebase Settings.");
        });
});

logoutBtn.addEventListener("click", () => {
    auth.signOut();
});

auth.onAuthStateChanged(user => {
    if (user) {
        loginBtn.style.display = "none";
        userInfo.style.display = "block";
        userNameText.innerText = "Hi, " + user.displayName;
    } else {
        loginBtn.style.display = "block";
        userInfo.style.display = "none";
    }
});

// --- 2. IMAGE ENHANCE LOGIC ---
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const form = document.getElementById("uploadForm");
const resultImg = document.getElementById("result");
const resultSection = document.getElementById("resultSection");

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) preview.src = URL.createObjectURL(file);
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = imageInput.files[0];
    const scaleValue = document.getElementById("scaleSelect").value;
    const user = auth.currentUser;

    if (!file) return alert("Image select karein!");

    // Check Login for Pro
    if ((scaleValue === "4" || scaleValue === "8") && !user) {
        alert("Pro quality (4x/8x) ke liye pehle Login karein!");
        return;
    }

    // Check Payment for Pro
    if (scaleValue === "4" || scaleValue === "8") {
        alert("Redirecting to Razorpay...");
        // Payment function call yahan hogi
        return;
    }

    // Free 2x Process
    processImage(file, scaleValue);
});

async function processImage(file, scale) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("scale", scale);

    alert("Processing... wait 30 sec.");

    try {
        const response = await fetch("https://hdimage-ai-backend.onrender.com/enhance", {
            method: "POST",
            body: formData
        });

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        resultImg.src = imageUrl;
        resultSection.style.display = "block";

        document.getElementById("downloadBtn").onclick = () => {
            const a = document.createElement("a");
            a.href = imageUrl;
            a.download = "enhanced.png";
            a.click();
        };
    } catch (err) {
        alert("Error: Backend is sleeping. Try again.");
    }
}
