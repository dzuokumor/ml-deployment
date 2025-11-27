import numpy as np
from PIL import Image

def preprocess_image(image_path, target_size=(64, 64)):
    img = Image.open(image_path).convert('RGB')
    img = img.resize(target_size)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def preprocess_image_from_bytes(image_bytes, target_size=(64, 64)):
    img = Image.open(image_bytes).convert('RGB')
    img = img.resize(target_size)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array
