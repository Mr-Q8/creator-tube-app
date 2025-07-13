import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Obtenemos el cuerpo de la solicitud que envía el frontend.
    const body = await req.json();
    const { prompt, maxIterations } = body; // Extraemos los datos que nos interesan.

    // 2. Verificamos que el prompt exista.
    if (!prompt) {
      throw new Error("El 'prompt' es requerido en el cuerpo de la solicitud.");
    }

    // 3. Obtenemos la URL de nuestro servidor de Colab desde Vercel.
    const colabUrl = process.env.COLAB_SERVER_URL;

    if (!colabUrl) {
      throw new Error('La variable de entorno COLAB_SERVER_URL no está configurada en Vercel.');
    }

    // 4. Preparamos el cuerpo de la solicitud para que coincida con lo que espera FastAPI.
    // FastAPI espera un JSON con una clave "prompt".
    const requestBodyForColab = {
      prompt: prompt,
      // Opcional: si tu API de Colab también usa maxIterations, puedes añadirlo aquí.
      // max_iterations: maxIterations 
    };
    
    // 5. Llamamos a la API de Colab con la ruta correcta y el cuerpo correcto.
    const response = await fetch(`${colabUrl}/generate-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBodyForColab), // Enviamos el cuerpo formateado.
    });

    // 6. Manejamos la respuesta como antes.
    if (!response.ok) {
      const errorData = await response.text();
      // Intentamos parsear el error por si es un JSON de FastAPI
      try {
          const jsonError = JSON.parse(errorData);
          throw new Error(`Error del servidor de Colab: ${jsonError.detail || errorData}`);
      } catch (e) {
          throw new Error(`Error del servidor de Colab: ${errorData}`);
      }
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error en la API Route /api/generateVideo:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}