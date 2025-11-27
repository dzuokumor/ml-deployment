import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from datetime import datetime

tf.config.run_functions_eagerly(True)

MODEL_PATH = 'models/model_rgb.h5'
MAPPING_PATH = 'models/reverse_mapping_rgb.npy'

class LandCoverModel:
    def __init__(self):
        self.model = None
        self.reverse_mapping = None
        self.code_to_name = {
            10: 'trees',
            20: 'shrubland',
            30: 'grassland',
            40: 'cropland',
            50: 'built-up',
            60: 'bare_sparse',
            80: 'water',
            90: 'wetland',
            95: 'mangroves'
        }
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            self.model = keras.models.load_model(MODEL_PATH)
            print(f"model loaded from {MODEL_PATH}")
        else:
            print(f"model not found at {MODEL_PATH}")
            raise FileNotFoundError(f"model file missing: {MODEL_PATH}")

        if os.path.exists(MAPPING_PATH):
            self.reverse_mapping = np.load(MAPPING_PATH, allow_pickle=True).item()
            print(f"mapping loaded from {MAPPING_PATH}")
        else:
            print(f"mapping not found at {MAPPING_PATH}")
            raise FileNotFoundError(f"mapping file missing: {MAPPING_PATH}")

    def predict(self, image_array):
        predictions = self.model.predict(image_array, verbose=0)
        class_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][class_idx])
        
        class_code = self.reverse_mapping.get(class_idx, f"unknown_{class_idx}")
        if hasattr(class_code, 'item'):
            class_code = int(class_code.item())
        elif isinstance(class_code, np.generic):
            class_code = int(class_code)

        top_3_indices = np.argsort(predictions[0])[-3:][::-1]
        top_3 = []
        for idx in top_3_indices:
            idx = int(idx)
            class_val = self.reverse_mapping.get(idx, f"unknown_{idx}")
            if hasattr(class_val, 'item'):
                class_val = int(class_val.item())
            elif isinstance(class_val, np.generic):
                class_val = int(class_val)
            
            top_3.append({
                'class': class_val,
                'confidence': float(predictions[0][idx])
            })

        class_name = self.code_to_name.get(class_code, f"unknown_{class_code}")
        
        top_3_with_names = []
        for item in top_3:
            top_3_with_names.append({
                'class': self.code_to_name.get(item['class'], f"unknown_{item['class']}"),
                'confidence': item['confidence']
            })
        
        return {
            'predicted_class': class_code,
            'predicted_class_name': class_name,
            'confidence': confidence,
            'top_3': top_3_with_names
        }

    def retrain(self, train_data_path, epochs=10, batch_size=8, log_callback=None, progress_callback=None):
        def log(msg):
            print(msg)
            if log_callback:
                log_callback(msg)

        log(f"Starting retraining...")
        log(f"Data path: {train_data_path}")
        log(f"Epochs: {epochs}, Batch size: {batch_size}")

        try:
            from tensorflow.keras.preprocessing.image import ImageDataGenerator
            from tensorflow.keras.callbacks import Callback

            class LoggingCallback(Callback):
                def __init__(self, log_fn, progress_fn, total_epochs):
                    super().__init__()
                    self.log_fn = log_fn
                    self.progress_fn = progress_fn
                    self.total_epochs = total_epochs

                def on_epoch_begin(self, epoch, logs=None):
                    self.log_fn(f"Epoch {epoch + 1}/{epochs} started")

                def on_epoch_end(self, epoch, logs=None):
                    loss = logs.get('loss', 0)
                    acc = logs.get('accuracy', 0)
                    if 'val_loss' in logs:
                        val_loss = logs.get('val_loss', 0)
                        val_acc = logs.get('val_accuracy', 0)
                        self.log_fn(f"Epoch {epoch + 1}/{self.total_epochs} - loss: {loss:.4f}, val_loss: {val_loss:.4f}, accuracy: {acc:.4f}, val_accuracy: {val_acc:.4f}")
                    else:
                        self.log_fn(f"Epoch {epoch + 1}/{self.total_epochs} - loss: {loss:.4f}, accuracy: {acc:.4f}")
                    
                    if self.progress_fn:
                        self.progress_fn(epoch + 1, self.total_epochs)

            datagen = ImageDataGenerator(
                rescale=1./255,
                validation_split=0.2
            )

            log("Loading training data...")
            log(f"Training path: {train_data_path}")
            log(f"Checking directory exists: {os.path.exists(train_data_path)}")
            if os.path.exists(train_data_path):
                subdirs = [d for d in os.listdir(train_data_path) if os.path.isdir(os.path.join(train_data_path, d))]
                log(f"Found subdirectories: {subdirs}")
            
            train_generator = datagen.flow_from_directory(
                train_data_path,
                target_size=(64, 64),
                batch_size=batch_size,
                class_mode='sparse',
                subset='training',
                shuffle=True
            )
            log(f"Found {train_generator.samples} training samples")
            log(f"Class indices: {train_generator.class_indices}")
            
            if train_generator.samples == 0:
                raise ValueError(f"No training samples found. Directory: {train_data_path}, Subdirs: {subdirs if 'subdirs' in locals() else 'unknown'}")
            
            actual_batch_size = min(batch_size, train_generator.samples)
            train_generator.batch_size = actual_batch_size
            log(f"Using batch size: {actual_batch_size}")
            log(f"Found {len(train_generator.class_indices)} classes: {list(train_generator.class_indices.keys())}")

            if len(train_generator.class_indices) < 2:
                raise ValueError(f"Need at least 2 classes for training. Found only {len(train_generator.class_indices)}")

            num_classes_in_data = len(train_generator.class_indices)
            num_classes_in_model = self.model.output_shape[-1]

            if num_classes_in_data != num_classes_in_model:
                log(f"Warning: Data has {num_classes_in_data} classes but model expects {num_classes_in_model}")
                log("Model will be retrained on available classes only")

            log("Loading validation data...")
            val_generator = datagen.flow_from_directory(
                train_data_path,
                target_size=(64, 64),
                batch_size=batch_size,
                class_mode='sparse',
                subset='validation'
            )
            log(f"Found {val_generator.samples} validation samples")
            
            validation_data = None
            if val_generator.samples > 0:
                val_generator.batch_size = min(batch_size, val_generator.samples)
                log(f"Validation batch size: {val_generator.batch_size}")
                validation_data = val_generator
            else:
                log("Warning: No validation samples, training without validation")

            log("Recompiling model with fresh optimizer...")
            self.model.compile(
                optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                loss='sparse_categorical_crossentropy',
                metrics=['accuracy']
            )

            log("Starting model training...")
            history = self.model.fit(
                train_generator,
                epochs=epochs,
                validation_data=validation_data,
                verbose=0,
                callbacks=[LoggingCallback(log, progress_callback, epochs)]
            )

            backup_path = f"models/model_rgb_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.h5"
            if os.path.exists(MODEL_PATH):
                os.rename(MODEL_PATH, backup_path)
                log(f"Previous model backed up to {backup_path}")

            self.model.save(MODEL_PATH)
            log(f"Retrained model saved successfully!")
            
            log("Reloading model into memory...")
            self.model = keras.models.load_model(MODEL_PATH)
            log("Model reloaded successfully!")

            final_loss = history.history['loss'][-1]
            final_acc = history.history.get('accuracy', [0])[-1]
            
            result = {
                'status': 'success',
                'final_loss': float(final_loss) if hasattr(final_loss, 'numpy') else final_loss,
                'final_accuracy': float(final_acc) if hasattr(final_acc, 'numpy') else final_acc
            }
            
            if 'val_loss' in history.history:
                final_val_loss = history.history['val_loss'][-1]
                final_val_acc = history.history.get('val_accuracy', [0])[-1]
                result['final_val_loss'] = float(final_val_loss) if hasattr(final_val_loss, 'numpy') else final_val_loss
                result['final_val_accuracy'] = float(final_val_acc) if hasattr(final_val_acc, 'numpy') else final_val_acc
            
            return result

        except Exception as e:
            log(f"Error during retraining: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e)
            }

model_instance = LandCoverModel()
