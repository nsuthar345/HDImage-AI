const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const form = document.getElementById("uploadForm");
const resultImg = document.getElementById("result");

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
    formData.append("scale", "2"); // Backend ko scale chahiye

    alert("Processing... Please wait 30 seconds.");

    try {
        console.log("Sending request to Render...");
        const response = await fetch(
            "https://hdimage-ai-backend.onrender.com/enhance",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server Response Error:", errorText);
            throw new Error(`Server returned ${response.status}`);
        }

        const blob = await response.blob();
        resultImg.src = URL.createObjectURL(blob);
        console.log("Image enhanced successfully!");

    } catch (err) {
        console.error("Connection Error:", err);
        alert("Enhance failed. Check if backend is awake at Render.");
    }
});
