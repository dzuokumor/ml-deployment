from src.preprocessing import preprocess_image, preprocess_image_from_bytes
from src.model import model_instance

def predict_from_path(image_path):
    img_array = preprocess_image(image_path)
    result = model_instance.predict(img_array)
    return result

def predict_from_bytes(image_bytes):
    img_array = preprocess_image_from_bytes(image_bytes)
    result = model_instance.predict(img_array)
    return result
