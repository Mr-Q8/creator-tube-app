import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import cloudinary
import cloudinary.uploader

# --- Configuración de Cloudinary ---
# Render leerá estas variables de entorno, igual que Vercel
cloudinary.config( 
  cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME'), 
  api_key = os.environ.get('CLOUDINARY_API_KEY'), 
  api_secret = os.environ.get('CLOUDINARY_API_SECRET'),
  secure = True
)

app = FastAPI()

class VideoRequest(BaseModel):
    prompt: str
    maxIterations: int

@app.post("/generate-video")
async def generate_video_endpoint(request: VideoRequest):
    try:
        print(f"▶️ Solicitud recibida para: '{request.prompt}'")
        
        # Simulación (esto lo reemplazarás con tu lógica real)
        video_filename = "video_generado.mp4"
        video_path = f"./{video_filename}" # Guarda en la carpeta actual
        with open(video_path, "w") as f:
            f.write(f"Video de prueba para: {request.prompt}")
        
        # Subir a Cloudinary
        upload_result = cloudinary.uploader.upload(video_path, resource_type="video")
        public_url = upload_result['secure_url']
        
        os.remove(video_path)
        
        return {"videoUrl": public_url}
    except Exception as e:
        print(f"❌ Error en el endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Esta línea permite que Render sepa cómo iniciar tu app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))