import os
from fastapi import FastAPI, HTTPException # No necesitamos Request si usamos BaseModel
from pydantic import BaseModel # <-- ¡Importante! Asegúrate de que esta línea esté
import uvicorn
import cloudinary
import cloudinary.uploader

# Cloudinary config
cloudinary.config( 
  cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME'), 
  api_key = os.environ.get('CLOUDINARY_API_KEY'), 
  api_secret = os.environ.get('CLOUDINARY_API_SECRET'),
  secure = True
)

app = FastAPI()

# --- Definición del Modelo de Entrada (BaseModel) ---
# Esto le dice a FastAPI cómo debe ser el JSON que esperas recibir en el cuerpo.
class VideoRequest(BaseModel):
    prompt: str
    maxIterations: int
# ----------------------------------------------------

# --- ENDPOINT PARA PRUEBA BÁSICA (GET) ---
# Solo para verificar que el servidor está vivo y respondiendo a la raíz.
@app.get("/")
async def root():
    return {"message": "Hello from Render FastAPI!"}
# -----------------------------------------

# --- ENDPOINT PRINCIPAL (POST) ---
# FastAPI ahora usará VideoRequest para parsear el cuerpo JSON automáticamente.
@app.post("/process-video/") # <--- ¡CAMBIO DE RUTA!# <--- Ruta con barra final.
async def generate_video_endpoint(request_data: VideoRequest): # <-- ¡Aquí usamos el BaseModel!
    try:
        # Accedemos a los datos directamente desde el objeto request_data
        prompt = request_data.prompt
        max_iterations = request_data.maxIterations

        print(f"▶️ Solicitud recibida para: '{prompt}' con {max_iterations} iteraciones.")
        
        # Simulación (esto lo reemplazarás con tu lógica real de generación de video)
        video_filename = "video_generado.mp4"
        video_path = f"./{video_filename}"
        with open(video_path, "w") as f:
            f.write(f"Video de prueba para: {prompt} y {max_iterations} iteraciones.")
        
        # Subir a Cloudinary
        print("☁️ Subiendo video a Cloudinary...")
        upload_result = cloudinary.uploader.upload(video_path, resource_type="video")
        public_url = upload_result['secure_url']
        print(f"✔️ Subida completada. URL: {public_url}")
        
        os.remove(video_path) # Limpiar el archivo local
        
        return {"videoUrl": public_url} # Devolvemos la URL del video
    except Exception as e:
        print(f"❌ Ocurrió un error grave en el endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Inicio del servidor Uvicorn (Sin indentación) ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)