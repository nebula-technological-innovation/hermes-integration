/**
 * AetherTech Desktop App Integration
 *
 * Electron/Tauri desktop app with Hermes integration
 * macOS, Windows, Linux support
 */
import { createGateway } from './nebula-gateway';
/**
 * Desktop App Controller
 */
export class AetherTechDesktop {
  config;
  messages = [];
  constructor(config) {
    this.config = {
      theme: config.theme || 'dark',
      model: config.model || 'orion',
      provider: config.provider || 'aether',
      ...config,
    };
  }
  /**
   * Send a message and get response
   */
  async sendMessage(content) {
    const gateway = createGateway({
      provider: this.config.provider || 'aether',
      model: this.config.model || 'orion',
      apiUrl: this.config.apiUrl,
      apiKey: this.config.apiKey,
    });
    // Add user message
    const userMessage = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);
    // Get AI response
    const response = await gateway.chat(
      this.messages.map((m) => ({ role: m.role, content: m.content })),
    );
    const assistantMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: response.choices?.[0]?.message?.content || response.message?.content || '',
      timestamp: new Date(),
      model: this.config.model,
    };
    this.messages.push(assistantMessage);
    return assistantMessage;
  }
  /**
   * Clear chat history
   */
  clearHistory() {
    this.messages = [];
  }
  /**
   * Get chat history
   */
  getHistory() {
    return [...this.messages];
  }
  /**
   * Update configuration
   */
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
  }
  /**
   * Get configuration
   */
  getConfig() {
    return { ...this.config };
  }
  generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
/**
 * Desktop Shortcuts
 */
export const DEFAULT_SHORTCUTS = {
  'CmdOrCtrl+K': 'Quick command palette',
  'CmdOrCtrl+Enter': 'Send message',
  'CmdOrCtrl+Shift+C': 'Copy last response',
  'CmdOrCtrl+L': 'Clear chat',
  'CmdOrCtrl+1': 'Switch to Orion',
  'CmdOrCtrl+2': 'Switch to Hunter',
  'CmdOrCtrl+3': 'Switch to Healer',
};
/**
 * App menu structure
 */
export const APP_MENU = {
  file: [
    { label: 'New Chat', shortcut: 'CmdOrCtrl+N' },
    { label: 'Open Chat History', shortcut: 'CmdOrCtrl+O' },
    { type: 'separator' },
    { label: 'Export Chat', shortcut: 'CmdOrCtrl+E' },
    { type: 'separator' },
    { label: 'Settings', shortcut: ',' },
    { type: 'separator' },
    { label: 'Quit', shortcut: 'CmdOrCtrl+Q' },
  ],
  edit: [
    { label: 'Undo', shortcut: 'CmdOrCtrl+Z' },
    { label: 'Redo', shortcut: 'CmdOrCtrl+Shift+Z' },
    { type: 'separator' },
    { label: 'Cut', shortcut: 'CmdOrCtrl+X' },
    { label: 'Copy', shortcut: 'CmdOrCtrl+C' },
    { label: 'Paste', shortcut: 'CmdOrCtrl+V' },
    { label: 'Select All', shortcut: 'CmdOrCtrl+A' },
  ],
  view: [
    { label: 'Toggle Sidebar', shortcut: 'CmdOrCtrl+B' },
    { label: 'Toggle Full Screen', shortcut: 'Ctrl+Cmd+F' },
    { type: 'separator' },
    { label: 'Zoom In', shortcut: 'CmdOrCtrl+' },
    { label: 'Zoom Out', shortcut: 'CmdOrCtrl-' },
    { label: 'Reset Zoom', shortcut: 'CmdOrCtrl+0' },
  ],
  model: [
    { label: 'Orion (Chat)', shortcut: 'CmdOrCtrl+1' },
    { label: 'Hunter (Reasoning)', shortcut: 'CmdOrCtrl+2' },
    { label: 'Healer (Multimodal)', shortcut: 'CmdOrCtrl+3' },
  ],
  help: [
    { label: 'Documentation', shortcut: 'F1' },
    { label: 'Keyboard Shortcuts', shortcut: 'CmdOrCtrl+/' },
    { type: 'separator' },
    { label: 'About AetherTech' },
  ],
};
/**
 * Factory to create desktop app
 */
export function createAetherTechDesktop(config = {}) {
  return new AetherTechDesktop(config);
}
