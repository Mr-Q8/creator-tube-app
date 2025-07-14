import os
from fastapi import FastAPI, HTTPException, Request # Import Request
import uvicorn
import cloudinary
import cloudinary.uploader
# from pydantic import BaseModel # Comentado porque no la usamos en esta versión

# --- Configuración de Cloudinary ---
# Render leerá estas variables de entorno
cloudinary.config( 
  cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME'), 
  api_key = os.environ.get('CLOUDINARY_API_KEY'), 
  api_secret = os.environ.get('CLOUDINARY_API_SECRET'),
  secure = True
)

app = FastAPI()

# --- NUEVO ENDPOINT PARA PRUEBA BÁSICA (GET) ---
# Este endpoint es solo para verificar que el servidor está vivo.
@app.get("/")
async def root():
    return {"message": "Hello from Render FastAPI!"}
# ------------------------------------------------

# @app.post("/generate-video") <-- Esta es la ruta que tu Vercel debería llamar
# Si en tu Vercel lo llamas a /generate-video/ con barra al final, esta también debe tenerla:
@app.post("/generate-video/") # <--- ¡IMPORTANTE! Hemos añadido la barra final aquí. Asegúrate que tu Vercel llame también con ella.
async def generate_video_endpoint(request: Request): # Esperamos un objeto Request
    try:
        body = await request.json() # Leemos el cuerpo de la solicitud como JSON
        prompt = body.get("prompt", "No prompt provided") # Extraemos el prompt
        max_iterations = body.get("maxIterations", 3) # Extraemos maxIterations

        print(f"▶️ Solicitud recibida para: '{prompt}' con {max_iterations} iteraciones.")
        
        # Simulación de la generación del video
        video_filename = "video_generado.mp4"
        video_path = f"./{video_filename}" # Guarda en la carpeta actual del servicio
        with open(video_path, "w") as f:
            f.write(f"Este es un video de prueba para el prompt: {prompt} y {max_iterations} iteraciones.")
        
        # Subir a Cloudinary
        print("☁️ Subiendo video a Cloudinary...")
        upload_result = cloudinary.uploader.upload(video_path, resource_type="video")
        public_url = upload_result['secure_url']
        print(f"✔️ Subida completada. URL: {public_url}")
        
        os.remove(video_path) # Limpiar el archivo local después de subir
        
        return {"videoUrl": public_url} # Devolvemos la URL del video
    
    except Exception as e:
        print(f"❌ Ocurrió un error grave en el endpoint: {e}")
        # Se lanza una HTTPException para que FastAPI la maneje y devuelva un error 500 al cliente
        raise HTTPException(status_code=500, detail=str(e))

# =================================================================================
# ¡ESTE BLOQUE DEBE ESTAR SIN NINGUNA INDENTACIÓN (a la izquierda del todo)!
# =================================================================================
if __name__ == "__main__":
    # Render asigna un puerto a tu aplicación a través de la variable de entorno 'PORT'
    port = int(os.environ.get("PORT", 8000)) # Se usa el puerto de Render o 8000 por defecto
    uvicorn.run(app, host="0.0.0.0", port=port)