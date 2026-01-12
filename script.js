// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOJ7YkfIQPzQMi7IjgAA6Rz4t0ta2lsq8",
  authDomain: "hd-image-ai.firebaseapp.com",
  projectId: "hd-image-ai",
  storageBucket: "hd-image-ai.firebasestorage.app",
  messagingSenderId: "492350131358",
  appId: "1:492350131358:web:8af497b15f66332379ff8f",
  measurementId: "G-PGGD9JFV62"
};
// Initialize Firebase safely
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// 2. UI ELEMENTS
const elements = {
    loginBtn: document.getElementById("loginBtn"),
    signupBtn: document.getElementById("signupBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    loggedInUI: document.getElementById("loggedInUI"),
    loggedOutUI: document.getElementById("loggedOutUI"),
    userName: document.getElementById("uName"),
    imageInput: document.getElementById("imageInput"),
    previewImg: document.getElementById("preview"),
    resultImg: document.getElementById("result"),
    resultSection: document.getElementById("resultSection"),
    enhanceBtn: document.getElementById("enhanceBtn"),
    uploadForm: document.getElementById("uploadForm")
};

// 3. AUTHENTICATION LOGIC
const handleGoogleAuth = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (err) {
        console.error("Auth Error:", err);
        alert("Login Failed: " + err.message + "\nCheck if popups are allowed.");
    }
};

if (elements.loginBtn) elements.loginBtn.onclick = handleGoogleAuth;
if (elements.signupBtn) elements.signupBtn.onclick = handleGoogleAuth;
if (elements.logoutBtn) elements.logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        if (elements.loggedOutUI) elements.loggedOutUI.style.display = "none";
        if (elements.loggedInUI) elements.loggedInUI.style.display = "flex";
        if (elements.userName) elements.userName.innerText = "Hi, " + user.displayName.split(' ')[0];
    } else {
        if (elements.loggedOutUI) elements.loggedOutUI.style.display = "flex";
        if (elements.loggedInUI) elements.loggedInUI.style.display = "none";
    }
});

// 4. IMAGE PREVIEW
elements.imageInput.onchange = () => {
    const file = elements.imageInput.files[0];
    if (file) {
        elements.previewImg.src = URL.createObjectURL(file);
        elements.resultSection.style.display = "none";
        elements.enhanceBtn.innerHTML = "Enhance Now";
    }
};

// 5. FORM SUBMISSION & PAYMENT
elements.uploadForm.onsubmit = async (e) => {
    e.preventDefault();
    const file = elements.imageInput.files[0];
    const scale = document.getElementById("scaleSelect").value;
    const user = auth.currentUser;

    if (!file) return alert("Please select a photo first!");

    if (scale !== "2" && !user) {
        return alert("Please Login/Sign-up to use Pro (4x/8x) quality!");
    }

    if (scale !== "2") {
        startPayment(scale);
    } else {
        processImage(scale);
    }
};

function startPayment(scale) {
    const options = {
        "key": "YOUR_RAZORPAY_KEY", // Apni Razorpay Key yahan dalein
        "amount": 19900,
        "currency": "INR",
        "name": "Heensa AI Pro",
        "description": "Premium Image Upscaling",
        "handler": () => processImage(scale),
        "prefill": { "email": auth.currentUser.email },
        "theme": { "color": "#38bdf8" }
    };
    new Razorpay(options).open();
}

// 6. API CALL
async function processImage(scale) {
    elements.enhanceBtn.disabled = true;
    elements.enhanceBtn.innerHTML = "Processing... Please Wait";

    const formData = new FormData();
    formData.append("image", elements.imageInput.files[0]);
    formData.append("scale", scale);

    try {
        const response = await fetch("https://hdimage-ai-backend.onrender.com/enhance", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Server connection failed");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        elements.resultImg.src = url;
        elements.resultSection.style.display = "block";
        elements.enhanceBtn.innerHTML = "Success! Done";
        elements.resultSection.scrollIntoView({ behavior: 'smooth' });

        document.getElementById("downloadBtn").onclick = () => {
            const a = document.createElement("a");
            a.href = url;
            a.download = `heensa_cleaned_${scale}x.png`;
            a.click();
        };
    } catch (err) {
        alert("Server is waking up. Please try again in 30 seconds.");
        elements.enhanceBtn.innerHTML = "Try Again";
    } finally {
        elements.enhanceBtn.disabled = false;
    }
} 
