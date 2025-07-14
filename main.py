import os
from fastapi import FastAPI, HTTPException, Request # Import Request
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

# --- NUEVO ENDPOINT PARA PRUEBA BÁSICA (GET) ---
@app.get("/")
async def root():
    return {"message": "Hello from Render FastAPI!"}
# ------------------------------------------------

@app.post("/generate-video/") # <--- ¡IMPORTANTE! AÑADIMOS LA BARRA FINAL AQUÍ
async def generate_video_endpoint(request: Request): # Expecting Request
    try:
        body = await request.json()
        prompt = body.get("prompt", "No prompt provided") 

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
    port = int(os.environ.get("PORT", 8000)) # Aseguramos que sea un entero
    uvicorn.run(app, host="0.0.0.0", port=port)