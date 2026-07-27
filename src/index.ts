/**
 * AetherTech Hermes Integration
 *
 * This package integrates Hermes Agent with AetherTech AI ecosystem
 * to provide AI-powered CLI, Desktop, and Mobile experiences.
 *
 * @module @aethertech/hermes-integration
 */

export * from './aether-models';
export * from './nebula-gateway';
export * from './skills';
export * from './mcp-bridge';
export * from './desktop';
export * from './mobile';
export * from './cli';

// Re-export types
export type { AetherModel, AetherChatMessage, AetherChatCompletion } from './aether-models';
export type { LLMProvider, LLMProviderConfig } from './nebula-gateway';
export type { CLIConfig, CLI_COMMANDS } from './cli';
export type { DesktopAppConfig, ChatMessage } from './desktop';
export type { MobileConfig, MobileChatMessage } from './mobile';
export type { MCPServerType, MCPConfig, MCPTool, MCPToolResult } from './mcp-bridge';
export type { AetherTechSkill, SkillContext } from './skills';
