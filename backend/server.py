from flask import Flask, request, send_file
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

@app.route("/enhance", methods=["POST"])
def enhance():
    file = request.files["image"]
    scale = int(request.form["scale"])

    image = Image.open(file).convert("RGB")
    img_np = np.array(image)

    h, w = img_np.shape[:2]
    upscaled = cv2.resize(
        img_np,
        (w * scale, h * scale),
        interpolation=cv2.INTER_CUBIC
    )

    kernel = np.array([[0,-1,0],[-1,5,-1],[0,-1,0]])
    sharpened = cv2.filter2D(upscaled, -1, kernel)

    output = Image.fromarray(sharpened)
    img_io = io.BytesIO()
    output.save(img_io, "PNG")
    img_io.seek(0)

    return send_file(img_io, mimetype="image/png")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
