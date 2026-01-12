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

    alert("Enhancing... please wait 30-40 seconds");

    try {
        const response = await fetch(
            "https://hdimage-ai-backend.onrender.com/enhance",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Server error");
        }

        const blob = await response.blob();
        resultImg.src = URL.createObjectURL(blob);

    } catch (err) {
        console.error(err);
        alert("Enhance failed");
    }
});
