const OpenAI = require("openai");
const logger = require("../../config/logger");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AiClient {
  async getResponse(userInput) {
    logger.info("[AiClient - getResponse] Sending request to OpenAI API.", { userInput });
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
      logger.info("[AiClient - getResponse] Response received from OpenAI.", { aiResponse });
      return aiResponse;
    } catch (error) {
      this._handleError(error);
      throw new Error("Failed to get response from AI.");
    }
  }

  _handleError(error) {
    if (error.response) {
      logger.error("[AiClient - Error] OpenAI API error.", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      logger.error("[AiClient - Error] No response received from OpenAI API.", {
        request: error.request,
      });
    } else {
      logger.error("[AiClient - Error] Unexpected error occurred.", { message: error.message });
    }
  }
}

module.exports = AiClient;
