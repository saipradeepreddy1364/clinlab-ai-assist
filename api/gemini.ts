export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const prompt = body.prompt;

    // @ts-ignore - Vercel injects process.env at runtime, but frontend tsconfig doesn't know about it
    const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: { message: "Server is missing Gemini API key" } }), { status: 500 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error && parsed.error.message) errorMsg = parsed.error.message;
      } catch(e) {}
      return new Response(JSON.stringify({ error: { message: errorMsg } }), { status: response.status });
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("Server API Error:", error);
    return new Response(JSON.stringify({ error: { message: error.message || "Internal server error" } }), { status: 500 });
  }
}
