const AiClient = require("../services/ai/aiClient");

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
    console.error("[aiController - generateResponse] ERROR: failed to retrieve ai response.");
    next(error);
  }
};

module.exports = { generateResponse };
