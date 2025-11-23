import {Agent} from "@tokenring-ai/agent";

import {TokenRingService} from "@tokenring-ai/app/types";
import SandboxProvider, {
  type ExecuteResult,
  type LogsResult,
  type SandboxOptions,
  type SandboxResult
} from "./SandboxProvider.js";

export default class SandboxService implements TokenRingService {
  name = "Sandbox";
  description = "Abstract interface for sandbox operations";
  protected agent!: Agent;

  private sandboxProviders: Record<string, SandboxProvider> = {};
  private activeSandboxProvider: string | null = null;
  private activeContainer: string | null = null;

  registerSandboxProvider(name: string, resource: SandboxProvider) {
    this.sandboxProviders[name] = resource;
    if (!this.activeSandboxProvider) {
      this.activeSandboxProvider = name;
    }
  }

  getActiveSandboxProviderName(): string | null {
    return this.activeSandboxProvider;
  }

  setActiveSandboxProviderName(name: string): void {
    if (!this.sandboxProviders[name]) {
      throw new Error(`Sandbox resource ${name} not found`);
    }
    this.activeSandboxProvider = name;
  }

  getAvailableSandboxProviders(): string[] {
    return Object.keys(this.sandboxProviders);
  }

  getActiveContainer(): string | null {
    return this.activeContainer;
  }

  setActiveContainer(containerId: string): void {
    this.activeContainer = containerId;
  }

  async createContainer(options?: SandboxOptions): Promise<SandboxResult> {
    const result = await this.getActiveSandboxProvider().createContainer(options);
    this.activeContainer = result.containerId;
    return result;
  }

  async executeCommand(containerId: string, command: string): Promise<ExecuteResult> {
    return this.getActiveSandboxProvider().executeCommand(containerId, command);
  }

  async stopContainer(containerId: string): Promise<void> {
    await this.getActiveSandboxProvider().stopContainer(containerId);
    if (this.activeContainer === containerId) {
      this.activeContainer = null;
    }
  }

  async getLogs(containerId: string): Promise<LogsResult> {
    return this.getActiveSandboxProvider().getLogs(containerId);
  }

  async removeContainer(containerId: string): Promise<void> {
    await this.getActiveSandboxProvider().removeContainer(containerId);
    if (this.activeContainer === containerId) {
      this.activeContainer = null;
    }
  }

  private getActiveSandboxProvider(): SandboxProvider {
    if (!this.activeSandboxProvider || !this.sandboxProviders[this.activeSandboxProvider]) {
      throw new Error("No active sandbox provider available");
    }
    return this.sandboxProviders[this.activeSandboxProvider];
  }
}