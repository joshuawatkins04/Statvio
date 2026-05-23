const OpenAI = require("openai");
const logger = require("../../config/logger");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AiClient {
  async getResponse1(userInput) {
    logger.info("[AiClient - getResponse] Sending request to OpenAI API.");

    const formattedInput = userInput
      .map((song, index) => `${index + 1}. "${song.name}" - ${song.artists}`)
      .join("\n");

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
              You are a highly skilled music expert.
              You will receive a list of songs, including their names and artists.
              Your task is to:
              - Analyse the provided list and identify the common vibe or theme.
              - Recommend exactly **6** new songs (no more, no less) that fit the theme but are **not already included**.
              - Provide each recommendation in the following format:
        
              1. **Song Name** - Artist: (very short description)

              - The description must be **concise**, no longer than **8-10 words**.
              - Do not include any extra commentary before or after the list.
              - Ensure the list is **always exactly 6 songs**.
        
              Example output:
        
              1. **Blinding Lights** - The Weeknd: Upbeat synth-pop with retro vibes.
              2. **Take Me Out** - Franz Ferdinand: Indie rock with danceable energy.
              3. **Levitating** - Dua Lipa: Catchy disco-pop with funky grooves.
              4. **R U Mine?** - Arctic Monkeys: Gritty rock with hypnotic riffs.
              5. **Go Your Own Way** - Fleetwood Mac: Classic rock anthem of independence.
              6. **Electric Feel** - MGMT: Psychedelic electro-pop with a groovy beat.

              Only return the **6-song list** and nothing else.
            `,
          },
          { role: "user", content: `Song List:\n${formattedInput}` },
        ],
        max_completion_tokens: 200,
        temperature: 0.7,
        frequency_penalty: 0,
        presence_penalty: 0.5,
      });

      const aiResponse = response.choices[0].message.content.trim();
      return aiResponse;
    } catch (error) {
      this._handleError(error);
      throw new Error("Failed to get response from AI.");
    }
  }

  async getResponse2(userInput) {
    logger.info("[AiClient - getResponse] Sending request to OpenAI API.");

    const formattedInput = userInput
      .map((song, index) => `${index + 1}. "${song.name}" - ${song.artists}`)
      .join("\n");

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
              You are a highly skilled music analyst.
              You will receive a list of songs, including their names, artists, durations, and BPMs.
              Your task is to **analyze** the list and provide a summary of key statistics:
                        
              - Count the **total number of songs** in the list.
              - Identify **which artist appears most frequently** and how many times.
              - Calculate the **total duration of all songs combined** (in minutes).
              - Find the **average BPM** of the songs (rounded to the nearest whole number).
              - Identify **the most common genre** if possible (if genres are provided).
              - Identify if any **duplicates** exist in the list.
                        
              **Output Format:**
              - **Total Songs:** X
              - **Most Frequent Artist:** Artist (Y songs)
              - **Total Duration:** X minutes
              - **Average BPM:** X BPM
              - **Most Common Genre:** Genre (if available)
              - **Duplicate Songs Found:** Yes/No

              Only return the statistics in the format above and nothing else.
            `,
          },
          { role: "user", content: `Song List:\n${formattedInput}` },
        ],
        max_completion_tokens: 250,
        temperature: 0.5,
        frequency_penalty: 0,
        presence_penalty: 0.3,
      });

      const aiResponse = response.choices[0].message.content.trim();
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
