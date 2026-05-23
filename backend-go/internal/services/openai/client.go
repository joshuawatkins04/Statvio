// Package openai wraps the OpenAI chat completions API. It reproduces the three
// prompt flows from the Node AiClient: a generic responder, a 6-song
// recommendation, and a playlist statistics summary.
package openai

import (
	"context"
	"fmt"
	"strings"

	goopenai "github.com/sashabaranov/go-openai"

	"statvio/backend/internal/models"
)

const model = goopenai.GPT4oMini

// Client talks to the OpenAI chat completions API.
type Client struct {
	api *goopenai.Client
}

// New builds a client from an API key.
func New(apiKey string) *Client {
	return &Client{api: goopenai.NewClient(apiKey)}
}

const recommendSystemPrompt = `
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
            `

const analysisSystemPrompt = `
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
            `

// Recommend returns 6 song recommendations based on a track list (getResponse1).
func (c *Client) Recommend(ctx context.Context, tracks []models.PlaylistTrack) (string, error) {
	return c.complete(ctx, recommendSystemPrompt, formatTracks(tracks), completionParams{
		MaxTokens:        200,
		Temperature:      0.7,
		FrequencyPenalty: 0,
		PresencePenalty:  0.5,
	})
}

// Analyse returns a statistics summary of a track list (getResponse2).
func (c *Client) Analyse(ctx context.Context, tracks []models.PlaylistTrack) (string, error) {
	return c.complete(ctx, analysisSystemPrompt, formatTracks(tracks), completionParams{
		MaxTokens:        250,
		Temperature:      0.5,
		FrequencyPenalty: 0,
		PresencePenalty:  0.3,
	})
}

// Generic answers a free-form prompt. The Node controller called a
// non-existent AiClient.getResponse for this route (so it always errored); this
// implements it as a plain assistant completion.
func (c *Client) Generic(ctx context.Context, input string) (string, error) {
	resp, err := c.api.CreateChatCompletion(ctx, goopenai.ChatCompletionRequest{
		Model: model,
		Messages: []goopenai.ChatCompletionMessage{
			{Role: goopenai.ChatMessageRoleUser, Content: input},
		},
	})
	if err != nil {
		return "", err
	}
	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("openai: empty response")
	}
	return strings.TrimSpace(resp.Choices[0].Message.Content), nil
}

type completionParams struct {
	MaxTokens        int
	Temperature      float32
	FrequencyPenalty float32
	PresencePenalty  float32
}

func (c *Client) complete(ctx context.Context, systemPrompt, userContent string, p completionParams) (string, error) {
	resp, err := c.api.CreateChatCompletion(ctx, goopenai.ChatCompletionRequest{
		Model: model,
		Messages: []goopenai.ChatCompletionMessage{
			{Role: goopenai.ChatMessageRoleSystem, Content: systemPrompt},
			{Role: goopenai.ChatMessageRoleUser, Content: "Song List:\n" + userContent},
		},
		MaxCompletionTokens: p.MaxTokens,
		Temperature:         p.Temperature,
		FrequencyPenalty:    p.FrequencyPenalty,
		PresencePenalty:     p.PresencePenalty,
	})
	if err != nil {
		return "", err
	}
	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("openai: empty response")
	}
	return strings.TrimSpace(resp.Choices[0].Message.Content), nil
}

// formatTracks renders the numbered "N. \"name\" - artists" list the prompts
// expect.
func formatTracks(tracks []models.PlaylistTrack) string {
	var b strings.Builder
	for i, t := range tracks {
		fmt.Fprintf(&b, "%d. \"%s\" - %s", i+1, t.Name, t.Artists)
		if i < len(tracks)-1 {
			b.WriteByte('\n')
		}
	}
	return b.String()
}
