import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, maxIterations } = body; 

    if (!prompt) {
      throw new Error("El 'prompt' es requerido en el cuerpo de la solicitud.");
    }

    const colabUrl = process.env.COLAB_SERVER_URL;

    if (!colabUrl) {
      throw new Error('La variable de entorno COLAB_SERVER_URL no está configurada en Vercel.');
    }

    const requestBodyForColab = {
      prompt: prompt,
      maxIterations: maxIterations 
    };
    
    // Llamamos a la API de Render con la ruta correcta y solo las cabeceras estándar.
    
    const response = await fetch(`${colabUrl}/process-video/`, { // <-- ¡CAMBIO DE RUTA!// <-- ¡IMPORTANTE! AÑADIMOS LA BARRA FINAL AQUÍ
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Solo esta cabecera es necesaria
      },
      body: JSON.stringify(requestBodyForColab),
    });

    if (!response.ok) {
      const errorData = await response.text();
      try {
          const jsonError = JSON.parse(errorData);
          throw new Error(`Error del servidor de Render: ${jsonError.detail || errorData}`);
      } catch (e) {
          throw new Error(`Error del servidor de Render: ${errorData}`);
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