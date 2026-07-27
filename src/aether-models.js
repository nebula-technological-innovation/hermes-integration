/**
 * Aether Models Integration
 *
 * Connects Hermes Agent to Aether AI models (Orion, Hunter, Healer)
 */
// Model pricing (per 1K tokens)
export const MODEL_PRICING = {
  orion: {
    input: 0.001, // $0.001 per 1K input tokens
    output: 0.001, // $0.001 per 1K output tokens
  },
  hunter: {
    input: 0, // Free
    output: 0, // Free
  },
  healer: {
    input: 0, // Free
    output: 0, // Free
  },
};
/**
 * AetherChat - Main class for interacting with Aether models
 */
export class AetherChat {
  config;
  constructor(config) {
    this.config = {
      maxTokens: 2048,
      temperature: 0.7,
      ...config,
    };
  }
  /**
   * Send a chat message to Aether model
   */
  async chat(messages) {
    const response = await fetch(`${this.config.apiUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });
    if (!response.ok) {
      throw new Error(`Aether API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
  /**
   * Get model pricing info
   */
  getPricing() {
    return MODEL_PRICING[this.config.model];
  }
  /**
   * Estimate cost for a request
   */
  estimateCost(promptTokens, completionTokens) {
    const pricing = this.getPricing();
    return (promptTokens / 1000) * pricing.input + (completionTokens / 1000) * pricing.output;
  }
}
/**
 * Factory to create AetherChat instances
 */
export function createAetherChat(model, apiUrl) {
  return new AetherChat({
    model,
    apiUrl: apiUrl || process.env.AETHER_API_URL || 'http://localhost:4011',
    apiKey: process.env.AETHER_API_KEY,
  });
}
// Export model names
export const AETHER_MODELS = ['orion', 'hunter', 'healer'];
