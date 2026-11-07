export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Método no permitido." },
      { status: 405 }
    );
  }

  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return Response.json(
      { error: "No se encontró GEMINI_API_KEY en Netlify." },
      { status: 500 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Solicitud inválida." },
      { status: 400 }
    );
  }

  const messages = (
    Array.isArray(body.messages) ? body.messages : []
  )
    .filter(
      m =>
        m &&
        ["user", "assistant"].includes(m.role) &&
        typeof m.content === "string"
    )
    .slice(-12)
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content.slice(0, 4000) }]
    }));

  if (!messages.some(m => m.role === "user")) {
    return Response.json(
      { error: "Escriba un mensaje." },
      { status: 400 }
    );
  }

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "Eres JARVIS, asistente personal en español. Sé formal, preciso y educado. Dirígete al usuario como Señor. No afirmes controlar el teléfono ni otras aplicaciones si no tienes herramientas para hacerlo."
            }]
          },
          contents: messages,
          generationConfig: {
            maxOutputTokens: 700
          }
        })
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return Response.json(
        {
          error:
            data?.error?.message ||
            "Google Gemini rechazó la solicitud."
        },
        { status: r.status }
      );
    }

    const reply = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("\n")
      .trim();

    return Response.json({
      reply: reply || "No recibí respuesta de texto."
    });

  } catch {
    return Response.json(
      { error: "No se pudo contactar con Google Gemini." },
      { status: 502 }
    );
  }
};
