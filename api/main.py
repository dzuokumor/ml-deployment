from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import io
import os
import shutil
import time
from datetime import datetime
from typing import List
import psutil

from src.prediction import predict_from_bytes
from src.model import model_instance

app = FastAPI(title="land cover classification api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

start_time = time.time()
prediction_count = 0
prediction_times = []
training_logs = []
training_status = "idle"
training_progress = 0

@app.get("/")
def read_root():
    return {"message": "land cover classification api", "status": "running"}

@app.get("/health")
def health_check():
    uptime_seconds = time.time() - start_time
    uptime_hours = uptime_seconds / 3600

    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()

    avg_latency = sum(prediction_times[-100:]) / len(prediction_times[-100:]) if prediction_times else 0

    return {
        "status": "healthy",
        "uptime_hours": round(uptime_hours, 2),
        "uptime_seconds": round(uptime_seconds, 2),
        "prediction_count": prediction_count,
        "average_latency_ms": round(avg_latency * 1000, 2),
        "cpu_percent": cpu_percent,
        "memory_percent": memory.percent,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    global prediction_count, prediction_times

    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="file must be an image")

    start = time.time()

    try:
        contents = await file.read()
        image_bytes = io.BytesIO(contents)

        result = predict_from_bytes(image_bytes)

        latency = time.time() - start
        prediction_times.append(latency)
        prediction_count += 1

        return {
            **result,
            "latency_ms": round(latency * 1000, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-bulk")
async def upload_bulk_data(files: List[UploadFile] = File(...)):
    upload_dir = "uploads/bulk_data"
    os.makedirs(upload_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    batch_dir = os.path.join(upload_dir, f"batch_{timestamp}")
    os.makedirs(batch_dir, exist_ok=True)

    saved_files = []
    validation_results = []
    valid_classes = ['trees', 'shrubland', 'grassland', 'cropland', 'built-up', 'bare_sparse', 'water', 'wetland', 'mangroves']

    code_to_class = {
        '10': 'trees',
        '20': 'shrubland',
        '30': 'grassland',
        '40': 'cropland',
        '50': 'built-up',
        '60': 'bare_sparse',
        '80': 'water',
        '90': 'wetland',
        '95': 'mangroves'
    }

    for file in files:
        try:
            if file.content_type.startswith('image/'):
                path_parts = file.filename.replace('\\', '/').split('/')

                if len(path_parts) >= 2:
                    class_folder = path_parts[-2].lower()
                    filename = path_parts[-1]

                    class_dir = os.path.join(batch_dir, class_folder)
                    os.makedirs(class_dir, exist_ok=True)

                    file_path = os.path.join(class_dir, filename)
                    contents = await file.read()
                    with open(file_path, "wb") as buffer:
                        buffer.write(contents)

                    image_bytes = io.BytesIO(contents)
                    prediction = predict_from_bytes(image_bytes)
                    predicted_code = str(prediction['predicted_class'])
                    predicted_class = code_to_class.get(predicted_code, predicted_code).lower()

                    validation_note = None
                    if class_folder == 'bare_sparse':
                        similar_classes = ['shrubland', 'cropland', 'grassland', 'built-up']
                        confidence_threshold = 0.85

                        print(f"DEBUG bare_sparse: claimed={class_folder}, predicted={predicted_class}, conf={prediction['confidence']}")
                        print(f"DEBUG in similar? {predicted_class in similar_classes}, above threshold? {prediction['confidence'] >= confidence_threshold}")

                        if predicted_class == class_folder:
                            is_valid = True
                            print(f"DEBUG: Exact match")
                        elif predicted_class in similar_classes and prediction['confidence'] >= confidence_threshold:
                            is_valid = True
                            validation_note = f"Accepted: {predicted_class} is similar to bare_sparse"
                            print(f"DEBUG: Accepted as similar, is_valid={is_valid}, note={validation_note}")
                        else:
                            is_valid = False
                            print(f"DEBUG: Rejected")
                    else:
                        is_valid = predicted_class == class_folder

                    result = {
                        'filename': file.filename,
                        'claimed_class': class_folder,
                        'predicted_class': predicted_class,
                        'confidence': prediction['confidence'],
                        'valid': is_valid
                    }
                    if validation_note:
                        result['note'] = validation_note

                    validation_results.append(result)

                    saved_files.append(file.filename)
                else:
                    validation_results.append({
                        'filename': file.filename,
                        'claimed_class': 'unknown',
                        'predicted_class': 'n/a',
                        'confidence': 0,
                        'valid': False,
                        'error': 'file must be in class folder (e.g., trees/image1.png)'
                    })
        except Exception as e:
            print(f"Error processing {file.filename}: {str(e)}")
            validation_results.append({
                'filename': file.filename,
                'claimed_class': 'error',
                'predicted_class': 'n/a',
                'confidence': 0,
                'valid': False,
                'error': str(e)
            })

    valid_count = sum(1 for r in validation_results if r['valid'])

    return {
        "status": "success",
        "files_uploaded": len(saved_files),
        "valid_files": valid_count,
        "invalid_files": len(saved_files) - valid_count,
        "validation_results": validation_results,
        "batch_id": f"batch_{timestamp}",
        "batch_path": batch_dir
    }

def retrain_model_task(train_data_path: str, epochs: int):
    global training_logs, training_status, training_progress
    training_logs = []
    training_status = "training"
    training_progress = 0

    training_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] Retraining started")
    training_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] Training data path: {train_data_path}")
    training_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] Epochs: {epochs}")

    def update_progress(current_epoch, total_epochs):
        global training_progress
        training_progress = int((current_epoch / total_epochs) * 95)

    try:
        result = model_instance.retrain(
            train_data_path,
            epochs=epochs,
            log_callback=lambda msg: training_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}"),
            progress_callback=update_progress
        )
        training_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] Retraining completed: {result}")
        training_progress = 100
        training_status = "completed"
    except Exception as e:
        training_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] Error: {str(e)}")
        training_status = "failed"


@app.post("/retrain")
async def trigger_retrain(
    background_tasks: BackgroundTasks,
    train_data_path: str = "uploads/bulk_data",
    epochs: int = 10
):
    if not os.path.exists(train_data_path):
        raise HTTPException(status_code=404, detail=f"training data path not found: {train_data_path}")

    background_tasks.add_task(retrain_model_task, train_data_path, epochs)

    return {
        "status": "retraining initiated",
        "train_data_path": train_data_path,
        "epochs": epochs,
        "message": "retraining running in background"
    }

@app.get("/metrics")
def get_metrics():
    recent_latencies = prediction_times[-100:]

    return {
        "total_predictions": prediction_count,
        "average_latency_ms": round(sum(recent_latencies) / len(recent_latencies) * 1000, 2) if recent_latencies else 0,
        "min_latency_ms": round(min(recent_latencies) * 1000, 2) if recent_latencies else 0,
        "max_latency_ms": round(max(recent_latencies) * 1000, 2) if recent_latencies else 0,
        "uptime_hours": round((time.time() - start_time) / 3600, 2)
    }

@app.get("/training-logs")
def get_training_logs():
    return {
        "status": training_status,
        "logs": training_logs,
        "progress": training_progress
    }
