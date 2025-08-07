import * as ai from "../service/ai.service.js";

export const getResult = async (req, res) => {
    try {
        const {prompt} = req.query;
        const result = await ai.generateResult(prompt);
        res.send(result);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}

export const listModels = async (req, res) => {
    try {
        const health = await ai.checkServiceHealth();
        res.status(200).json({ 
            message: "Model listing not available in this API version",
            serviceHealth: health,
            availableEndpoints: ["/ai/get-result", "/ai/health"]
        });
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}

export const healthCheck = async (req, res) => {
    try {
        const health = await ai.checkServiceHealth();
        res.status(health.status === "healthy" ? 200 : 503).json(health);
    } catch (error) {
        console.error("Health check error:", error);
        res.status(503).json({ status: "error", message: "Health check failed" });
    }
}

export default {
    getResult,
    listModels,
    healthCheck
};