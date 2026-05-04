export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    // Use the non-exposed GEMINI_API_KEY from the server environment
    const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: { message: "Server is missing Gemini API key" } });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error && parsed.error.message) errorMsg = parsed.error.message;
      } catch(e) {}
      return res.status(response.status).json({ error: { message: errorMsg } });
    }

    const result = await response.json();
    return res.status(200).json(result);

  } catch (error) {
    console.error("Server API Error:", error);
    return res.status(500).json({ error: { message: error.message || "Internal server error" } });
  }
}
