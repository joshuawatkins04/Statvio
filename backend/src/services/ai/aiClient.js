const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AiClient {
  async getResponse(userInput) {
    console.log("[AiClient - getResponse] Getting response from openAi...");
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [ 
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userInput },
         ],
         response_format: {
          "type": "text"
         },
         max_completion_tokens: 2048,
         temperature: 1,
         frequency_penalty: 0,
         presence_penalty: 0
      });

      const aiResponse = response.choices[0].message.content.trim();
      console.log("[AiClient - getResponse] Received response from OpenAi.");
      return aiResponse;
    } catch (error) {
      this._handleError(error);
      throw new Error("Failed to get response from AI.");
    }
  }

  _handleError(error) {
    if (error.response) {
      console.error(`OpenAi API error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error("[AiClient - Error] No response received from OpenAi:", error.request);
    } else {
      console.error("[AiClient - Error]", error.message);
    }
  }
}

module.exports = AiClient;
