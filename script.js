// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBOJ7YkfIQPzQMi7IjgAA6Rz4t0ta2lsq8",
    authDomain: "hd-image-ai.firebaseapp.com",
    projectId: "hd-image-ai",
    storageBucket: "hd-image-ai.firebasestorage.app",
    messagingSenderId: "492350131358",
    appId: "1:492350131358:web:8af497b15f66332379ff8f"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const elements = {
    loginBtn: document.getElementById("loginBtn"),
    signupBtn: document.getElementById("signupBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    loggedInUI: document.getElementById("loggedInUI"),
    loggedOutUI: document.getElementById("loggedOutUI"),
    userName: document.getElementById("displayUser"),
    imageInput: document.getElementById("imageInput"),
    previewImg: document.getElementById("preview"),
    resultImg: document.getElementById("result"),
    resultSection: document.getElementById("resultSection"),
    enhanceBtn: document.getElementById("enhanceBtn"),
    uploadForm: document.getElementById("uploadForm"),
    loader: document.getElementById("loadingOverlay"),
    downloadBtn: document.getElementById("downloadBtn")
};

// 1. Auth Logic
const handleGoogleAuth = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try { await auth.signInWithPopup(provider); } catch (err) { alert("Login Failed"); }
};

if (elements.loginBtn) elements.loginBtn.onclick = handleGoogleAuth;
if (elements.signupBtn) elements.signupBtn.onclick = handleGoogleAuth;
if (elements.logoutBtn) elements.logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        elements.loggedOutUI.style.display = "none";
        elements.loggedInUI.style.display = "flex";
        elements.userName.innerText = "Hi, " + user.displayName.split(' ')[0];
    } else {
        elements.loggedOutUI.style.display = "flex";
        elements.loggedInUI.style.display = "none";
    }
});

// 2. Instant Preview Logic
elements.imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            elements.previewImg.src = event.target.result;
            elements.resultImg.src = ""; // Clear old result
            elements.resultSection.style.display = "block";
            elements.downloadBtn.style.display = "none";
            elements.loader.style.display = "none";
            elements.resultSection.scrollIntoView({ behavior: 'smooth' });
        };
        reader.readAsDataURL(file);
    }
});

// 3. Form Submit
elements.uploadForm.onsubmit = async (e) => {
    e.preventDefault();
    const file = elements.imageInput.files[0];
    const scale = document.getElementById("scaleSelect").value;
    const user = auth.currentUser;

    if (!file) return alert("Please select a photo first!");
    if (scale !== "2" && !user) return alert("Please Login to use Pro (4x/8x)!");

    if (scale !== "2") {
        startPayment(scale);
    } else {
        processImage(scale);
    }
};

async function processImage(scale) {
    elements.enhanceBtn.disabled = true;
    elements.enhanceBtn.innerHTML = "Processing...";
    elements.loader.style.display = "block";
    elements.resultImg.style.opacity = "0.3";

    const formData = new FormData();
    formData.append("image", elements.imageInput.files[0]);
    formData.append("scale", scale);

    try {
        const response = await fetch("https://hdimage-ai-backend.onrender.com/enhance", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Server Error");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        elements.resultImg.src = url;
        elements.resultImg.style.opacity = "1";
        elements.loader.style.display = "none";
        elements.enhanceBtn.innerHTML = "Enhance Now";
        elements.downloadBtn.style.display = "inline-block";

        elements.downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = url;
            a.download = `heensa_cleaned_${scale}x.png`;
            a.click();
        };
    } catch (err) {
        alert("Server is busy. Please try again in 1 minute.");
        elements.enhanceBtn.innerHTML = "Try Again";
        elements.loader.style.display = "none";
    } finally {
        elements.enhanceBtn.disabled = false;
    }
}

function startPayment(scale) {
    const options = {
        "key": "YOUR_RAZORPAY_KEY", 
        "amount": 19900,
        "currency": "INR",
        "name": "Heensa AI Pro",
        "handler": () => processImage(scale),
        "prefill": { "email": auth.currentUser.email },
        "theme": { "color": "#38bdf8" }
    };
    new Razorpay(options).open();
}
