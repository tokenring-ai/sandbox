import {Agent} from "@tokenring-ai/agent";
import {TokenRingService} from "@tokenring-ai/app/types";
import deepMerge from "@tokenring-ai/utility/object/deepMerge";
import KeyedRegistry from "@tokenring-ai/utility/registry/KeyedRegistry";
import {z} from "zod";
import {type ExecuteResult, type LogsResult, type SandboxOptions, type SandboxProvider, type SandboxResult} from "./SandboxProvider.js";
import {SandboxAgentConfigSchema, SandboxServiceConfigSchema} from "./schema.ts";
import {SandboxState} from "./state/SandboxState.ts";

export default class SandboxService implements TokenRingService {
  name = "SandboxService";
  description = "Abstract interface for sandbox operations";

  private providerRegistry = new KeyedRegistry<SandboxProvider>();

  registerProvider = this.providerRegistry.register;
  getAvailableProviders = this.providerRegistry.getAllItemNames;

  constructor(readonly options: z.output<typeof SandboxServiceConfigSchema>) {}

  attach(agent: Agent): void {
    const config = deepMerge(this.options.agentDefaults, agent.getAgentConfigSlice('sandbox', SandboxAgentConfigSchema));
    agent.initializeState(SandboxState, config);
  }

  requireActiveProvider(agent: Agent): SandboxProvider {
    const provider = this.getActiveProvider(agent);
    if (!provider) throw new Error(`[${this.name}] No active provider set`);
    return provider;
  }

  getActiveProvider(agent: Agent): SandboxProvider | null {
    const providerName = agent.getState(SandboxState).provider;
    if (!providerName) return null;
    return this.providerRegistry.requireItemByName(providerName);
  }

  setActiveProvider(name: string, agent: Agent): void {
    agent.mutateState(SandboxState, (state) => {
      state.provider = name;
    });
  }

  getActiveContainer(agent: Agent): string | null {
    return agent.getState(SandboxState).activeContainer;
  }

  setActiveContainer(containerId: string, agent: Agent): void {
    agent.mutateState(SandboxState, (state) => {
      state.activeContainer = containerId;
    });
  }

  async createContainer(options: SandboxOptions | undefined, agent: Agent): Promise<SandboxResult> {
    const result = await this.requireActiveProvider(agent).createContainer(options);
    const label = options?.label || result.containerId;
    agent.mutateState(SandboxState, (state) => {
      state.labelToContainerId.set(label, result.containerId);
      state.activeContainer = label;
    });
    return { containerId: label, status: result.status };
  }

  async executeCommand(label: string, command: string, agent: Agent): Promise<ExecuteResult> {
    const containerId = agent.getState(SandboxState).labelToContainerId.get(label) || label;
    return this.requireActiveProvider(agent).executeCommand(containerId, command);
  }

  async stopContainer(label: string, agent: Agent): Promise<void> {
    const containerId = agent.getState(SandboxState).labelToContainerId.get(label) || label;
    await this.requireActiveProvider(agent).stopContainer(containerId);
    agent.mutateState(SandboxState, (state) => {
      if (state.activeContainer === label) {
        state.activeContainer = null;
      }
    });
  }

  async getLogs(label: string, agent: Agent): Promise<LogsResult> {
    const containerId = agent.getState(SandboxState).labelToContainerId.get(label) || label;
    return this.requireActiveProvider(agent).getLogs(containerId);
  }

  async removeContainer(label: string, agent: Agent): Promise<void> {
    const containerId = agent.getState(SandboxState).labelToContainerId.get(label) || label;
    await this.requireActiveProvider(agent).removeContainer(containerId);
    agent.mutateState(SandboxState, (state) => {
      state.labelToContainerId.delete(label);
      if (state.activeContainer === label) {
        state.activeContainer = null;
      }
    });
  }
}