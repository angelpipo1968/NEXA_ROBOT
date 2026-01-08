from PIL import Image
import os

path = "face.png"
if os.path.exists(path):
    try:
        img = Image.open(path)
        img.show()
        print("✅ Imagen abierta correctamente.")
    except Exception as e:
        print(f"❌ Error abriendo imagen: {e}")
else:
    print("❌ No encuentro el archivo face.png")
