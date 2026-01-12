from flask import Flask, request, send_file
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

@app.route("/enhance", methods=["POST"])
def enhance():
    file = request.files["image"]
    scale = int(request.form["scale"])

    image = Image.open(file).convert("RGB")
    img_np = np.array(image)

    # Upscale
    height, width = img_np.shape[:2]
    upscaled = cv2.resize(
        img_np,
        (width * scale, height * scale),
        interpolation=cv2.INTER_CUBIC
    )

    # Sharpening
    kernel = np.array([[0,-1,0],[-1,5,-1],[0,-1,0]])
    sharpened = cv2.filter2D(upscaled, -1, kernel)

    # Convert back to image
    output = Image.fromarray(sharpened)
    img_io = io.BytesIO()
    output.save(img_io, "PNG")
    img_io.seek(0)

    return send_file(img_io, mimetype="image/png")

if __name__ == "__main__":
    app.run(debug=True)
