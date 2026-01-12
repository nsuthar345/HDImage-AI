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
    try:
        if "image" not in request.files:
            return "No image found in request", 400
            
        file = request.files["image"]
        # Frontend se scale le rahe hain (2, 4, ya 8)
        scale = int(request.form.get("scale", 2)) 

        # 1. Image ko open karke Numpy array mein badalna
        image = Image.open(file).convert("RGB")
        img_np = np.array(image)

        # 2. Image ka Size badhana (Resize)
        h, w = img_np.shape[:2]
        upscaled = cv2.resize(
            img_np,
            (w * scale, h * scale),
            interpolation=cv2.INTER_CUBIC # High quality interpolation
        )

        # 3. ADVANCED PROCESSING (Quality badhane ke liye)
        if scale == 2:
            # Basic sharpening for 2x
            kernel = np.array([[0,-1,0], [-1,5,-1], [0,-1,0]])
            processed = cv2.filter2D(upscaled, -1, kernel)
        
        elif scale == 4:
            # 4x ke liye Denoising + Sharpening (Zyada clear)
            # Isse image ke dots/noise saaf ho jate hain
            denoised = cv2.fastNlMeansDenoisingColored(upscaled, None, 10, 10, 7, 21)
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            processed = cv2.filter2D(denoised, -1, kernel)
            
        elif scale == 8:
            # 8x ke liye Deep Cleaning (Ultra HD effect)
            denoised = cv2.fastNlMeansDenoisingColored(upscaled, None, 15, 15, 7, 21)
            # Gaussian Blur + Weight use karke HDR jaisa look dena
            gaussian_blur = cv2.GaussianBlur(denoised, (0, 0), 3)
            processed = cv2.addWeighted(denoised, 1.5, gaussian_blur, -0.5, 0)

        # 4. Wapas image format mein badal kar bhejna
        output = Image.fromarray(processed)
        img_io = io.BytesIO()
        output.save(img_io, "PNG")
        img_io.seek(0)

        return send_file(img_io, mimetype="image/png")
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return str(e), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
