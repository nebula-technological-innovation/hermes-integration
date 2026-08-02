/**
 * AetherTech Mobile App Integration
 *
 * React Native mobile app (iOS/Android) with Hermes integration
 */

import type { AetherModel } from './aether-models';
import type { LLMProvider } from './nebula-gateway';
import { createGateway } from './nebula-gateway';

// Mobile types
export interface MobileConfig {
  model?: AetherModel;
  provider?: LLMProvider;
  apiUrl?: string;
  apiKey?: string;
  offlineMode?: boolean;
}

export interface MobileChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'error';
}

/**
 * Mobile App Controller
 */
export class AetherTechMobile {
  private config: MobileConfig;
  private messages: MobileChatMessage[] = [];
  private offlineQueue: string[] = [];

  constructor(config: MobileConfig) {
    this.config = {
      model: config.model || 'orion',
      provider: config.provider || 'aether',
      offlineMode: config.offlineMode || false,
      ...config,
    };
  }

  /**
   * Send message - handles offline queue
   */
  async sendMessage(content: string): Promise<MobileChatMessage> {
    const tempId = `temp_${Date.now()}`;

    // Add pending message
    const pendingMsg: MobileChatMessage = {
      id: tempId,
      role: 'user',
      content,
      timestamp: Date.now(),
      status: 'sending',
    };
    this.messages.push(pendingMsg);

    // If offline, queue for later
    if (this.config.offlineMode) {
      this.offlineQueue.push(content);
      pendingMsg.status = 'error';
      return pendingMsg;
    }

    try {
      const gateway = createGateway({
        provider: this.config.provider || 'aether',
        model: this.config.model || 'orion',
        apiUrl: this.config.apiUrl,
        apiKey: this.config.apiKey,
      });

      // Convert messages for API
      const apiMessages = this.messages
        .filter((m) => m.status !== 'error')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await gateway.chat([...apiMessages, { role: 'user', content }]);

      // Extract response
      const assistantContent =
        this.config.provider === 'ollama'
          ? response.message?.content
          : response.choices?.[0]?.message?.content || '';

      const responseMsg: MobileChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
        status: 'sent',
      };

      this.messages.push(responseMsg);
      pendingMsg.status = 'sent';

      return responseMsg;
    } catch (error) {
      pendingMsg.status = 'error';
      this.offlineQueue.push(content);
      throw error;
    }
  }

  /**
   * Process offline queue when back online
   */
  async processOfflineQueue(): Promise<void> {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const content of queue) {
      try {
        await this.sendMessage(content);
      } catch {
        // Keep failed messages in queue
      }
    }
  }

  /**
   * Get messages
   */
  getMessages(): MobileChatMessage[] {
    return [...this.messages];
  }

  /**
   * Clear messages
   */
  clearMessages(): void {
    this.messages = [];
  }

  /**
   * Switch model
   */
  setModel(model: AetherModel): void {
    this.config.model = model;
  }

  /**
   * Toggle offline mode
   */
  setOfflineMode(offline: boolean): void {
    this.config.offlineMode = offline;
    if (!offline) {
      this.processOfflineQueue();
    }
  }
}

/**
 * Mobile navigation routes
 */
export const MOBILE_ROUTES = {
  home: '/',
  chat: '/chat',
  models: '/models',
  settings: '/settings',
  profile: '/profile',
};

/**
 * Bottom tab navigation
 */
export const MOBILE_TABS = [
  { name: 'Chat', route: '/chat', icon: 'chat' },
  { name: 'Models', route: '/models', icon: 'brain' },
  { name: 'Skills', route: '/skills', icon: 'extension' },
  { name: 'Settings', route: '/settings', icon: 'settings' },
];

/**
 * Theme colors
 */
export const MOBILE_THEME = {
  dark: {
    background: '#020617',
    surface: '#0f172a',
    primary: '#c084fc',
    secondary: '#7dd3fc',
    text: '#eef4ff',
    muted: '#9fb1d4',
  },
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    primary: '#7c3aed',
    secondary: '#0284c7',
    text: '#1e293b',
    muted: '#64748b',
  },
};

/**
 * Factory
 */
export function createAetherTechMobile(config: Partial<MobileConfig> = {}): AetherTechMobile {
  return new AetherTechMobile(config);
}
