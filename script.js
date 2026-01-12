const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const form = document.getElementById("uploadForm");
const resultImg = document.getElementById("result");
const resultSection = document.getElementById("resultSection");
const downloadBtn = document.getElementById("downloadBtn");

// Image Preview logic
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        resultSection.style.display = "none"; // Nayi image select hone par purana result chhupa do
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = imageInput.files[0];
    if (!file) {
        alert("Please select an image first");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("scale", "2");

    alert("Enhancing... please wait 30 seconds");

    try {
        const response = await fetch("https://hdimage-ai-backend.onrender.com/enhance", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Server error");

        const blob = await response.blob();
        const finalImageUrl = URL.createObjectURL(blob);

        // Result dikhao
        resultImg.src = finalImageUrl;
        resultSection.style.display = "block";

        // Download logic
        downloadBtn.onclick = () => {
            const link = document.createElement("a");
            link.href = finalImageUrl;
            link.download = "HD_Enhanced_Image.png";
            link.click();
        };

    } catch (err) {
        console.error(err);
        alert("Enhance failed. Please try again.");
    }
});
