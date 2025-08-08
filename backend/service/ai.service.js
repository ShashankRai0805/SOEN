import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if API key is provided
if (!process.env.GOOGLE_AI_KEY) {
  throw new Error("GOOGLE_AI_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"  // Pro model has higher free tier limits
});

export const generateResult = async(prompt, retries = 2) => {
  try {
    if (!prompt) {
      throw new Error("Prompt is required");
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;

    console.log("----------------------------RESPONSE---------------------------------", response);
    
    // Call the text() method to get the actual text content
    const textContent = response.text();
    console.log("----------------------------TEXT CONTENT-----------------------------", textContent);
    
    return textContent;
  } catch (error) {
    console.error("Error generating AI result:", error);
    
    // Handle service unavailable errors with retry
    if (error.status === 503 && retries > 0) {
      console.log(`Model overloaded, retrying in 2 seconds... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateResult(prompt, retries - 1);
    }
    
    // Handle quota exceeded errors
    if (error.status === 429) {
      throw new Error("API quota exceeded. Please wait and try again later. Consider upgrading to a paid plan for higher limits.");
    }
    
    // Handle service unavailable errors (final)
    if (error.status === 503) {
      throw new Error("AI service is currently overloaded. Please try again in a few minutes.");
    }
    
    // Handle model not found errors
    if (error.status === 404 && error.message.includes('not found')) {
      throw new Error("The AI model is not available. This might be a temporary issue or the model name is incorrect.");
    }
    
    throw new Error(`AI generation failed: ${error.message}`);
  }
};

// Simple function to check if the service is working
export const checkServiceHealth = async () => {
  try {
    const testResult = await model.generateContent("Hello");
    return { status: "healthy", message: "AI service is working" };
  } catch (error) {
    return { 
      status: "error", 
      message: error.status === 429 ? "Quota exceeded" : error.message 
    };
  }
};
