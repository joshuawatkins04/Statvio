const AiClient = require("../services/ai/aiClient");
const logger = require("../config/logger");

const generateResponse = async (req, res, next) => {
  const userInput = req.body.input;

  if (!userInput || typeof userInput !== "string") {
    return res.status(400).json({ error: "Invalid input provided" });
  }

  try {
    const client = new AiClient();
    const response = await client.getResponse(userInput);
    res.json({ response });
  } catch (error) {
    logger.error("[aiController - generateResponse] ERROR: failed to retrieve ai response.");
    next(error);
  }
};

const generateAnalysis = async (data) => {
  try {
    const client = new AiClient();
    const response = await client.getResponse(data);
    return response;
  } catch (error) {
    logger.error("[aiController - generateResponse] ERROR: failed to retrieve ai response.");
  }
};

module.exports = { generateResponse, generateAnalysis };
