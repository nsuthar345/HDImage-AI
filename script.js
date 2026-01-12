// 1. FIREBASE SETUP
const firebaseConfig = {
  apiKey: "AIzaSy...", // Apna real apiKey yahan rehne dein
  authDomain: "hd-image-ai.firebaseapp.com",
  projectId: "hd-image-ai",
  storageBucket: "hd-image-ai.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// 2. UI ELEMENTS
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loggedInUI = document.getElementById("loggedInUI");
const loggedOutUI = document.getElementById("loggedOutUI");
const userNameText = document.getElementById("userName");

const imageInput = document.getElementById("imageInput");
const previewImg = document.getElementById("preview");
const resultImg = document.getElementById("result");
const resultSection = document.getElementById("resultSection");
const enhanceBtn = document.getElementById("enhanceBtn");

// 3. AUTHENTICATION LOGIC (Login & Sign-up)
const handleAuth = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => console.log("Success"))
        .catch(err => alert("Error: " + err.message));
};

loginBtn.onclick = handleAuth;
signupBtn.onclick = handleAuth;
logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        loggedOutUI.style.display = "none";
        loggedInUI.style.display = "flex";
        userNameText.innerText = "Hi, " + user.displayName.split(' ')[0];
    } else {
        loggedOutUI.style.display = "flex";
        loggedInUI.style.display = "none";
    }
});

// 4. IMAGE HANDLING & PREVIEW
imageInput.onchange = () => {
    const file = imageInput.files[0];
    if (file) {
        previewImg.src = URL.createObjectURL(file);
        resultSection.style.display = "none";
        enhanceBtn.innerHTML = "Enhance Now";
    }
};

// 5. MAIN FORM SUBMISSION
document.getElementById("uploadForm").onsubmit = async (e) => {
    e.preventDefault();
    const file = imageInput.files[0];
    const scale = document.getElementById("scaleSelect").value;
    const user = auth.currentUser;

    if (!file) return alert("Photo select karein!");

    // Pro Quality Check
    if ((scale === "4" || scale === "8") && !user) {
        alert("Pro Quality ke liye Login/Sign-up karein!");
        return;
    }

    if (scale === "4" || scale === "8") {
        startPayment(scale);
    } else {
        processImage(scale);
    }
};

// 6. RAZORPAY PAYMENT
function startPayment(scale) {
    const options = {
        "key": "YOUR_RAZORPAY_KEY_ID", // Yahan apni Razorpay Key dalein
        "amount": 19900, 
        "currency": "INR",
        "name": "Heensa AI Pro",
        "description": "Unlock Ultra HD Quality",
        "handler": function () {
            processImage(scale);
        },
        "prefill": { "email": auth.currentUser.email },
        "theme": { "color": "#38bdf8" }
    };
    const rzp = new Razorpay(options);
    rzp.open();
}

// 7. BACKEND API CALL
async function processImage(scale) {
    enhanceBtn.disabled = true;
    enhanceBtn.innerHTML = `<span class="loader"></span> Processing...`;

    const formData = new FormData();
    formData.append("image", imageInput.files[0]);
    formData.append("scale", scale);

    try {
        const response = await fetch("https://hdimage-ai-backend.onrender.com/enhance", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Server down");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        resultImg.src = url;
        resultSection.style.display = "block";
        enhanceBtn.innerHTML = "Done! Check Below";
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });

        document.getElementById("downloadBtn").onclick = () => {
            const a = document.createElement("a");
            a.href = url;
            a.download = `heensa_ai_${scale}x.png`;
            a.click();
        };

    } catch (err) {
        alert("Error: Backend is starting up. Wait 1 min.");
        enhanceBtn.innerHTML = "Try Again";
    } finally {
        enhanceBtn.disabled = false;
    }
}
