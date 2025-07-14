import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, maxIterations } = body;

    if (!prompt) {
      throw new Error("El 'prompt' es requerido en el cuerpo de la solicitud.");
    }

    const colabUrl = process.env.COLAB_SERVER_URL;
    console.log("DEBUG: COLAB_SERVER_URL que está usando Vercel:", colabUrl);

    if (!colabUrl) {
      throw new Error('La variable de entorno COLAB_SERVER_URL no está configurada en Vercel.');
    }

    const requestBodyForColab = {
      prompt: prompt,
      maxIterations: maxIterations 
    };
    
    const response = await fetch(`${colabUrl}/generate-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // La primera cabecera para ngrok
        'User-Agent': 'Vercel-Function/1.0',   // LA CABECERA ADICIONAL Y MÁS IMPORTANTE
      },
      body: JSON.stringify(requestBodyForColab),
    });

    if (!response.ok) {
      const errorData = await response.text();
      try {
          const jsonError = JSON.parse(errorData);
          throw new Error(`Error del servidor de Colab: ${jsonError.detail || errorData}`);
      } catch (e) {
          throw new Error(`Error del servidor de Colab/Ngrok: ${errorData}`);
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