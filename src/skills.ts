/**
 * AetherTech Skills
 *
 * Custom skills for Hermes Agent that integrate with Nebula services
 */

import type { AetherModel } from './aether-models';
import type { LLMProvider } from './nebula-gateway';
import { createGateway } from './nebula-gateway';

export interface SkillContext {
  model?: AetherModel;
  provider?: LLMProvider;
  apiUrl?: string;
  apiKey?: string;
  data?: Record<string, any>;
}

/**
 * Base skill class for AetherTech
 */
export abstract class AetherTechSkill {
  name: string;
  description: string;
  examples: string[];

  constructor(name: string, description: string, examples: string[] = []) {
    this.name = name;
    this.description = description;
    this.examples = examples;
  }

  abstract execute(input: string, context: SkillContext): Promise<string>;
}

/**
 * Revenue monitoring skill
 */
export class RevenueSkill extends AetherTechSkill {
  constructor() {
    super('revenue-monitor', 'Monitor and analyze revenue streams', [
      'show revenue',
      'what is our revenue',
      'revenue breakdown',
    ]);
  }

  async execute(input: string, context: SkillContext): Promise<string> {
    const gateway = createGateway({
      provider: context.provider || 'aether',
      model: context.model || 'hunter',
      apiUrl: context.apiUrl,
      apiKey: context.apiKey,
    });

    // In production, this would call the revenue API
    const response = await gateway.chat([
      { role: 'system', content: 'You are a revenue analyst. Provide concise revenue metrics.' },
      { role: 'user', content: input },
    ]);

    return response.choices?.[0]?.message?.content || response.message?.content || '';
  }
}

/**
 * Deployment skill
 */
export class DeploySkill extends AetherTechSkill {
  constructor() {
    super('deploy', 'Deploy services and applications', [
      'deploy the app',
      'start service',
      'deploy to production',
    ]);
  }

  async execute(input: string, context: SkillContext): Promise<string> {
    // Parse deployment request
    const isProduction = input.toLowerCase().includes('production');
    const serviceName = this.extractServiceName(input);

    return `Deploying ${serviceName} to ${isProduction ? 'production' : 'staging'}...\n\nService: ${serviceName}\nStatus: Starting\n\nUse \`docker compose up -d\` to complete deployment.`;
  }

  private extractServiceName(input: string): string {
    const match = input.match(/(?:deploy|start)\s+(?:the\s+)?(\w+)/i);
    return match?.[1] || 'unknown';
  }
}

/**
 * VPN management skill
 */
export class VPNSkill extends AetherTechSkill {
  constructor() {
    super('vpn-manager', 'Manage VPN connections and configurations', [
      'connect to vpn',
      'show vpn status',
      'list vpn servers',
    ]);
  }

  async execute(input: string, context: SkillContext): Promise<string> {
    const action = input.toLowerCase();

    if (action.includes('status')) {
      return 'VPN Status: Connected\nServer: us-east-1.nebulahq.work\nIP: 10.0.0.45\nProtocol: WireGuard\n\nUse `docker ps` to check VPN container status.';
    }

    if (action.includes('list') || action.includes('servers')) {
      return 'Available VPN Servers:\n\n🌍 US East - us-east.nebulahq.work\n🌍 US West - us-west.nebulahq.work\n🌍 EU - eu.nebulahq.work\n🌍 Asia - asia.nebulahq.work\n\nUse `nebula-vpn connect <server>` to connect.';
    }

    return 'VPN Manager\n- status: Check connection status\n- list: Show available servers\n- connect <server>: Connect to a server';
  }
}

/**
 * Model selection skill
 */
export class ModelSkill extends AetherTechSkill {
  constructor() {
    super('model-selector', 'Switch between Aether AI models', [
      'use orion',
      'switch to hunter',
      'healer mode',
    ]);
  }

  async execute(input: string, context: SkillContext): Promise<string> {
    const model = this.extractModel(input);

    if (!model) {
      return 'Available models:\n- Orion: Conversational AI ($0.001/1K tokens)\n- Hunter: Deep reasoning (FREE)\n- Healer: Multimodal (FREE)\n\nSay "use [model name]" to switch.';
    }

    return `Switched to ${model.toUpperCase()}.\n\n${this.getModelDescription(model)}`;
  }

  private extractModel(input: string): AetherModel | null {
    const lower = input.toLowerCase();
    if (lower.includes('orion')) return 'orion';
    if (lower.includes('hunter')) return 'hunter';
    if (lower.includes('healer')) return 'healer';
    return null;
  }

  private getModelDescription(model: string): string {
    const descriptions: Record<string, string> = {
      orion: 'Conversation, code generation, creative writing. $0.001/1K tokens.',
      hunter: 'Deep reasoning, analysis, strategy. 100% FREE.',
      healer: 'Vision, audio, multimodal tasks. 100% FREE.',
    };
    return descriptions[model] || '';
  }
}

/**
 * Registry of all AetherTech skills
 */
export const AETHER_SKILLS = [
  new RevenueSkill(),
  new DeploySkill(),
  new VPNSkill(),
  new ModelSkill(),
];

/**
 * Get skill by name
 */
export function getSkill(name: string): AetherTechSkill | undefined {
  return AETHER_SKILLS.find((s) => s.name === name);
}

/**
 * Find skill by input
 */
export function findSkill(input: string): AetherTechSkill | undefined {
  const lower = input.toLowerCase();
  return AETHER_SKILLS.find((s) => s.examples.some((e) => lower.includes(e.toLowerCase())));
}
