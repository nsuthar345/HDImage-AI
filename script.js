
function uploadImage() {
  const file = document.getElementById("imageInput").files[0];
  const scale = document.getElementById("scale").value;

  if (!file) {
    alert("Please select an image");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("scale", scale);

 fetch("https://hdimage-ai-backend.onrender.com/enhance", {
    method: "POST",
    body: formData
  })
  .then(res => res.blob())
  .then(blob => {
    document.getElementById("result").src = URL.createObjectURL(blob);
  });
}
