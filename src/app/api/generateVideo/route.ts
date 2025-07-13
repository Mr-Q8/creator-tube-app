import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Obtener los datos (prompt, etc.) que envía el frontend.
    const body = await req.json();

    // 2. Obtener la URL del servidor de Colab desde las variables de entorno de Vercel.
    const colabUrl = process.env.COLAB_SERVER_URL;

    if (!colabUrl) {
      // Si la variable de entorno no está, devolvemos un error claro.
      throw new Error('La variable de entorno COLAB_SERVER_URL no está configurada en Vercel.');
    }

    // 3. Reenviar la solicitud al servidor FastAPI en Colab.
    // ¡IMPORTANTE! Asegúrate de que la ruta (ej. /generate) coincida con la de tu API en FastAPI.
    const response = await fetch(`${colabUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 4. Si Colab da un error, pasarlo al frontend.
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor de Colab: ${errorData}`);
    }

    // 5. Devolver la respuesta de Colab al frontend.
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    // Manejar cualquier error que ocurra en el proceso.
    console.error("Error en la API Route /api/generateVideo:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}