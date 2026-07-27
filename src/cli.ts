/**
 * AetherTech CLI Commands
 *
 * CLI commands for Hermes integration
 */

import { AetherModel } from './aether-models';
import type { LLMProvider } from './nebula-gateway';
import { createGateway, DEFAULT_GATEWAYS } from './nebula-gateway';

export interface CLIConfig {
  provider: LLMProvider;
  model?: string;
  apiUrl?: string;
  apiKey?: string;
}

/**
 * Main CLI handler for AetherTech
 */
export class AetherTechCLI {
  private config: CLIConfig;

  constructor(config: CLIConfig) {
    this.config = config;
  }

  /**
   * Run a chat interaction
   */
  async chat(prompt: string): Promise<string> {
    const gateway = createGateway({
      provider: this.config.provider,
      model: this.config.model,
      apiUrl: this.config.apiUrl || this.getDefaultUrl(),
      apiKey: this.config.apiKey,
    });

    const response = await gateway.chat([{ role: 'user', content: prompt }]);

    // Extract response based on provider format
    if (this.config.provider === 'ollama') {
      return response.message?.content || '';
    }
    return response.choices?.[0]?.message?.content || '';
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    const gateway = createGateway({
      provider: this.config.provider,
      model: this.config.model,
      apiUrl: this.config.apiUrl || this.getDefaultUrl(),
      apiKey: this.config.apiKey,
    });

    return gateway.listModels();
  }

  /**
   * Get current configuration
   */
  getConfig(): CLIConfig {
    return { ...this.config };
  }

  private getDefaultUrl(): string {
    switch (this.config.provider) {
      case 'aether':
        return process.env.AETHER_API_URL || 'http://localhost:4011';
      case 'openrouter':
        return 'https://openrouter.ai/api/v1';
      case 'ollama':
        return process.env.OLLAMA_URL || 'http://localhost:11434';
      default:
        return 'http://localhost:4011';
    }
  }
}

/**
 * CLI Command definitions for Hermes
 */
export const CLI_COMMANDS = {
  'aether:chat': {
    description: 'Chat with Aether AI models',
    usage: 'aether:chat <prompt>',
    examples: [
      'aether:chat "Hello, help me write code"',
      'aether:chat --model hunter "Analyze this data"',
    ],
  },
  'aether:models': {
    description: 'List available Aether models',
    usage: 'aether:models',
  },
  'aether:set-model': {
    description: 'Set default Aether model',
    usage: 'aether:set-model <model-name>',
    examples: ['aether:set-model orion', 'aether:set-model hunter', 'aether:set-model healer'],
  },
  'nebula:status': {
    description: 'Check Nebula Gateway status',
    usage: 'nebula:status',
  },
  'openrouter:chat': {
    description: 'Chat with OpenRouter models',
    usage: 'openrouter:chat <prompt>',
  },
  'ollama:chat': {
    description: 'Chat with local Ollama models',
    usage: 'ollama:chat <prompt>',
  },
};

/**
 * Factory to create CLI instance
 */
export function createAetherTechCLI(config: Partial<CLIConfig> = {}): AetherTechCLI {
  return new AetherTechCLI({
    provider: (config.provider as LLMProvider) || 'aether',
    model: config.model || 'orion',
    apiUrl: config.apiUrl,
    apiKey: config.apiKey,
  });
}
