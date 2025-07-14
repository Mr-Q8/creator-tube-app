import os
from fastapi import FastAPI, HTTPException, Request
import uvicorn
import cloudinary
import cloudinary.uploader
# from pydantic import BaseModel # <-- ¡No la necesitamos para esta prueba!

# --- Configuración de Cloudinary ---
cloudinary.config( 
  cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME'), 
  api_key = os.environ.get('CLOUDINARY_API_KEY'), 
  api_secret = os.environ.get('CLOUDINARY_API_SECRET'),
  secure = True
)

app = FastAPI()

# class VideoRequest(BaseModel): # <-- ¡No la necesitamos para esta prueba!
#     prompt: str
#     maxIterations: int

@app.post("/generate-video") # Ruta simple
async def generate_video_endpoint(request: Request): # Recibe la request directamente
    try:
        body = await request.json() # Lee el JSON del cuerpo
        prompt = body.get("prompt", "No prompt provided") # Extrae el prompt

        print(f"▶️ Solicitud recibida para: '{prompt}'")
        
        # Simulación
        video_filename = "video_generado.mp4"
        video_path = f"./{video_filename}"
        with open(video_path, "w") as f:
            f.write(f"Video de prueba para: {prompt}")
        
        # Subir a Cloudinary
        upload_result = cloudinary.uploader.upload(video_path, resource_type="video")
        public_url = upload_result['secure_url']
        
        os.remove(video_path)
        
        return {"videoUrl": public_url}
    except Exception as e:
        print(f"❌ Error en el endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))