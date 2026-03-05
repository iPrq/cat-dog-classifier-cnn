from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the brain you downloaded from Colab
model = tf.keras.models.load_model('cat_dog_classifier_1.keras')

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # 1. Read the uploaded file
    data = await file.read()
    image = Image.open(io.BytesIO(data)).convert('RGB')
    
    # 2. Resize to 180x180 (Exactly like your training!)
    image = image.resize((180, 180))
    img_array = tf.keras.utils.img_to_array(image)
    img_array = np.expand_dims(img_array, axis=0) # Add batch dimension
    
    # 3. Get result
    prediction = model.predict(img_array)
    score = float(prediction[0][0])
    
    label = "Dog" if score > 0.5 else "Cat"
    confidence = score if score > 0.5 else 1 - score
    
    return {"result": label, "confidence": f"{confidence*100:.2f}%"}