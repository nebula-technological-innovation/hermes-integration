/**
 * Nebula Gateway Integration
 *
 * Connects Hermes to Nebula Gateway for routing to Aether models,
 * OpenRouter, and Ollama
 */
import { AetherChat, MODEL_PRICING } from './aether-models';
/**
 * Unified LLM Gateway - routes to any supported provider
 */
export class NebulaGateway {
  aetherChat = null;
  config;
  constructor(config) {
    this.config = config;
    if (config.provider === 'aether') {
      this.aetherChat = new AetherChat({
        model: config.model || 'orion',
        apiUrl: config.apiUrl,
        apiKey: config.apiKey,
      });
    }
  }
  /**
   * Send chat completion request
   */
  async chat(messages) {
    switch (this.config.provider) {
      case 'aether':
        return this.aetherChat.chat(messages);
      case 'openrouter':
        return this.chatOpenRouter(messages);
      case 'ollama':
        return this.chatOllama(messages);
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }
  }
  /**
   * Chat with OpenRouter
   */
  async chatOpenRouter(messages) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': 'https://aethertech.ai',
        'X-Title': 'AetherTech Hermes',
      },
      body: JSON.stringify({
        model: this.config.model || 'openchat/openchat-7b',
        messages,
      }),
    });
    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }
    return response.json();
  }
  /**
   * Chat with Ollama (local)
   */
  async chatOllama(messages) {
    const response = await fetch(`${this.config.apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'llama3.2:3b',
        messages,
        stream: false,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }
    return response.json();
  }
  /**
   * List available models for provider
   */
  async listModels() {
    switch (this.config.provider) {
      case 'aether':
        return ['orion', 'hunter', 'healer'];
      case 'openrouter':
        // Would need to call OpenRouter API for full list
        return ['openchat/openchat-7b', 'meta-llama/llama-3.2-1b', 'qwen/qwen2.5-1.5b'];
      case 'ollama':
        const response = await fetch(`${this.config.apiUrl}/api/tags`);
        const data = await response.json();
        return data.models?.map((m) => m.name) || [];
      default:
        return [];
    }
  }
  /**
   * Get pricing for current provider/model
   */
  getPricing() {
    if (this.config.provider === 'aether' && this.config.model) {
      return MODEL_PRICING[this.config.model] || { input: 0, output: 0 };
    }
    return { input: 0, output: 0 }; // OpenRouter/Ollama handled separately
  }
}
/**
 * Factory to create gateway instances
 */
export function createGateway(config) {
  return new NebulaGateway(config);
}
// Default configurations
export const DEFAULT_GATEWAYS = {
  aether: (apiUrl = 'http://localhost:4011') =>
    createGateway({
      provider: 'aether',
      model: 'orion',
      apiUrl,
    }),
  openrouter: (apiKey) =>
    createGateway({
      provider: 'openrouter',
      model: 'openchat/openchat-7b',
      apiUrl: 'https://openrouter.ai/api/v1',
      apiKey,
    }),
  ollama: (apiUrl = 'http://localhost:11434') =>
    createGateway({
      provider: 'ollama',
      model: 'llama3.2:3b',
      apiUrl,
    }),
};
