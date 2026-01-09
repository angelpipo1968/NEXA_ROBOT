import urllib.request
import os

MODELS_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/"
LIB_URL = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"

FILES = [
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    "ssd_mobilenetv1_model-shard2",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
]

DEST_DIR = "deploy/models"

def download_file(url, dest):
    print(f"Downloading {url}...")
    try:
        urllib.request.urlretrieve(url, dest)
        print(f"Saved to {dest}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

# Download library
download_file(LIB_URL, "deploy/face-api.min.js")

# Download models
for file in FILES:
    download_file(MODELS_URL + file, os.path.join(DEST_DIR, file))

print("Downloads complete.")
