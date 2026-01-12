from flask import Flask, request, send_file
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)  # Isse frontend aur backend connect ho payenge

@app.route("/enhance", methods=["POST"])
def enhance():
    try:
        # Check if image is in request
        if "image" not in request.files:
            return {"error": "No image uploaded"}, 400
            
        file = request.files["image"]
        
        # Scale value frontend se lene ki koshish (default 2)
        scale = int(request.form.get("scale", 2))

        # Process image
        image = Image.open(file).convert("RGB")
        img_np = np.array(image)

        h, w = img_np.shape[:2]
        # Image resize (Enhance)
        upscaled = cv2.resize(
            img_np,
            (w * scale, h * scale),
            interpolation=cv2.INTER_CUBIC
        )

        # Sharpening filter
        kernel = np.array([[0,-1,0],[-1,5,-1],[0,-1,0]])
        sharpened = cv2.filter2D(upscaled, -1, kernel)

        # Convert back to image
        output = Image.fromarray(sharpened)
        img_io = io.BytesIO()
        output.save(img_io, "PNG")
        img_io.seek(0)

        return send_file(img_io, mimetype="image/png")
    
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
