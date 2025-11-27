from locust import HttpUser, task, between
import os
import random

class LandCoverUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        self.test_images = []
        test_dir = "data/test"
        if os.path.exists(test_dir):
            self.test_images = [
                os.path.join(test_dir, f)
                for f in os.listdir(test_dir)
                if f.endswith(('.jpg', '.jpeg', '.png'))
            ]

    @task(3)
    def health_check(self):
        self.client.get("/health")

    @task(2)
    def get_metrics(self):
        self.client.get("/metrics")

    @task(5)
    def predict_image(self):
        if not self.test_images:
            return

        image_path = random.choice(self.test_images)

        try:
            with open(image_path, "rb") as f:
                files = {"file": (os.path.basename(image_path), f, "image/jpeg")}
                self.client.post("/predict", files=files)
        except Exception as e:
            print(f"error predicting image: {e}")
