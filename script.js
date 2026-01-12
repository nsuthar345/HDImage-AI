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
    formData.append("scale", "2"); // Yeh line important hai!

    alert("Enhancing... please wait 20-30 seconds (Render Free Tier may be slow)");

    try {
        const response = await fetch(
            "https://hdimage-ai-backend.onrender.com/enhance",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server Error:", errorData);
            throw new Error("Server error");
        }

        const blob = await response.blob();
        resultImg.src = URL.createObjectURL(blob);
        alert("Success! Image Enhanced.");

    } catch (err) {
        console.error("Fetch Error:", err);
        alert("Enhance failed. Check console for details.");
    }
});
