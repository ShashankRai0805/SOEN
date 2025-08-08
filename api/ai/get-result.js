import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { prompt } = req.query;
        
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        if (!process.env.GOOGLE_AI_KEY) {
            return res.status(500).json({ error: "AI service not configured" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ result: text });
    } catch (error) {
        console.error("AI API error:", error);
        
        // Handle specific Google AI errors
        if (error.status === 503) {
            return res.status(503).json({ 
                error: "AI service is currently overloaded. Please try again in a few minutes." 
            });
        }
        
        if (error.status === 429) {
            return res.status(429).json({ 
                error: "API quota exceeded. Please wait and try again later." 
            });
        }

        res.status(500).json({ 
            error: error.message || "AI generation failed" 
        });
    }
}
