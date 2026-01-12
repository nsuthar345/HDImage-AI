const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const form = document.getElementById("uploadForm");
const resultImg = document.getElementById("result");
const downloadBtn = document.getElementById("downloadBtn"); // Naya button

// IMAGE PREVIEW
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
    }
});

// ENHANCE BUTTON
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

    alert("Processing... Please wait.");
    downloadBtn.style.display = "none"; // Purana download button chhupa do

    try {
        const response = await fetch(
            "https://hdimage-ai-backend.onrender.com/enhance",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) throw new Error("Server error");

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        resultImg.src = imageUrl;
        
        // DOWNLOAD LOGIC
        downloadBtn.style.display = "inline-block"; // Button dikhao
        downloadBtn.onclick = () => {
            const link = document.createElement("a");
            link.href = imageUrl;
            link.download = "enhanced_image.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

    } catch (err) {
        console.error(err);
        alert("Enhance failed");
    }
});
