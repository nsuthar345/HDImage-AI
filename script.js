// Firebase Config (Keep yours same)
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

// INTERACTIVE SLIDER LOGIC
const slider = document.getElementById("imageSlider");
const sliderWrapper = document.getElementById("sliderWrapper");

if(slider && sliderWrapper) {
    slider.addEventListener('input', (e) => {
        const value = e.target.value;
        // Sirf upar wali image ki width change hogi, photo nahi hilegi
        sliderWrapper.style.width = value + "%";
    });
}

// REST OF THE CODE (PRICING & API)
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

// Auth
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

// Image Upload Preview
elements.imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            elements.previewImg.src = event.target.result;
            elements.resultSection.style.display = "block";
            elements.resultImg.src = "";
            elements.downloadBtn.style.display = "none";
            elements.resultSection.scrollIntoView({ behavior: 'smooth' });
        };
        reader.readAsDataURL(file);
    }
});

// Main Submit Logic
elements.uploadForm.onsubmit = async (e) => {
    e.preventDefault();
    const file = elements.imageInput.files[0];
    const scale = document.getElementById("scaleSelect").value;
    if (!file) return alert("Select a photo!");

    if (scale === "2") {
        processImage(scale);
    } else {
        if (!auth.currentUser) return alert("Please Login for Pro (4x/8x)!");
        startPayment(scale);
    }
};

function startPayment(scale) {
    const price = scale === "8" ? 29900 : 19900; // 8x=299, 4x=199
    const options = {
        "key": "rzp_test_S35DJEe4lmg5Rm", 
        "amount": price,
        "currency": "INR",
        "name": "N & H Deep Resolution",
        "description": scale + "x Enhancement Plan (1 Year Access)",
        "handler": () => processImage(scale),
        "prefill": { "email": auth.currentUser.email },
        "theme": { "color": "#38bdf8" }
    };
    new Razorpay(options).open();
}

async function processImage(scale) {
    elements.enhanceBtn.disabled = true;
    elements.enhanceBtn.innerHTML = "AI is Working...";
    elements.loader.style.display = "block";
    elements.resultImg.style.opacity = "0.2";

    const formData = new FormData();
    formData.append("image", elements.imageInput.files[0]);
    formData.append("scale", scale);

    try {
        const response = await fetch("https://hdimage-ai-backend.onrender.com/enhance", {
            method: "POST",
            body: formData
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        elements.resultImg.src = url;
        elements.resultImg.style.opacity = "1";
        elements.loader.style.display = "none";
        elements.downloadBtn.style.display = "inline-block";
        elements.downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = url;
            a.download = `nh_enhanced_${scale}x.png`;
            a.click();
        };
    } catch (err) {
        alert("Server Busy! Try again.");
    } finally {
        elements.enhanceBtn.disabled = false;
        elements.enhanceBtn.innerHTML = "Enhance Now";
    }
}
