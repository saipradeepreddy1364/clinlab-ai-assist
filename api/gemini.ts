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

    // Use GROQ_API_KEY from environment
    // @ts-ignore
    const API_KEY = process.env.GROQ_API_KEY;

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: { message: "Server is missing Groq API key" } }), { status: 500 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a clinical AI assistant for dental professionals. You must respond strictly in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 2048
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ error: { message: errorData.error?.message || "Groq API error" } }), { status: response.status });
    }

    const result = await response.json();
    
    // Transform Groq's OpenAI-style response back to the format the frontend expects (Gemini style)
    const normalizedResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: result.choices[0].message.content
              }
            ]
          }
        }
      ]
    };

    return new Response(JSON.stringify(normalizedResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Server API Error:", error);
    return new Response(JSON.stringify({ error: { message: error.message || "Internal server error" } }), { status: 500 });
  }
}
