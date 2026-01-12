// 1. Firebase Configuration (Aapka waala hi hai)
const firebaseConfig = {
  apiKey: "AIzaSy...", // Apni real key yahan rehne dein
  authDomain: "hd-image-ai.firebaseapp.com",
  projectId: "hd-image-ai",
  storageBucket: "hd-image-ai.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// UI Elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const userNameText = document.getElementById("userName");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const form = document.getElementById("uploadForm");
const resultImg = document.getElementById("result");
const resultSection = document.getElementById("resultSection");
const downloadBtn = document.getElementById("downloadBtn");

// --- LOGIN & AUTH LOGIC ---

// Login Button Click
loginBtn.onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => console.log("User Logged In"))
        .catch((error) => alert("Login Error: " + error.message));
};

// Logout Button Click
logoutBtn.onclick = () => {
    auth.signOut();
};

// Auth State Change (Check if user is logged in or out)
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

// --- IMAGE PROCESSING LOGIC ---

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        resultSection.style.display = "none";
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = imageInput.files[0];
    const scale = document.getElementById("scaleSelect").value;
    const user = auth.currentUser;

    if (!file) return alert("Please select an image first");

    // Login check for Pro Scales
    if ((scale === "4" || scale === "8") && !user) {
        alert("Pro features (4x/8x) ke liye please Login karein!");
        return;
    }

    // Payment check for Pro Scales
    if (scale === "4" || scale === "8") {
        startPayment(scale); // Payment function call
    } else {
        processImage(scale); // Direct free process
    }
});

// Razorpay Payment Function
function startPayment(scale) {
    const options = {
        "key": "YOUR_RAZORPAY_KEY_ID", // Yahan apni Razorpay Key dalein
        "amount": 19900, // ₹199
        "currency": "INR",
        "name": "HD Image AI",
        "description": "6 Months Subscription",
        "handler": function (response) {
            alert("Payment Success! Processing Image...");
            processImage(scale);
        },
        "prefill": {
            "email": auth.currentUser.email
        },
        "theme": { "color": "#38bdf8" }
    };
    const rzp = new Razorpay(options);
    rzp.open();
}

// Final Image Fetch Function
async function processImage(scaleValue) {
    const file = imageInput.files[0];
    const formData = new FormData();
    formData.append("image", file);
    formData.append("scale", scaleValue);

    alert("Enhancing... Please wait 30 seconds.");

    try {
        const response = await fetch("https://hdimage-ai-backend.onrender.com/enhance", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Server error");

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        resultImg.src = imageUrl;
        resultSection.style.display = "block";

        downloadBtn.onclick = () => {
            const link = document.createElement("a");
            link.href = imageUrl;
            link.download = `enhanced_${scaleValue}x.png`;
            link.click();
        };

    } catch (err) {
        console.error(err);
        alert("Enhance failed. Check backend.");
    }
}
