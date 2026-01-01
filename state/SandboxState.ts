import {Agent} from "@tokenring-ai/agent";
import type {ResetWhat} from "@tokenring-ai/agent/AgentEvents";
import type {AgentStateSlice} from "@tokenring-ai/agent/types";
import {z} from "zod";
import {SandboxAgentConfigSchema} from "../schema.ts";

export class SandboxState implements AgentStateSlice {
  name = "SandboxState";
  provider: string | null;
  activeContainer: string | null = null;
  labelToContainerId: Map<string, string> = new Map();

  constructor(readonly initialConfig: z.output<typeof SandboxAgentConfigSchema>) {
    this.provider = initialConfig.provider ?? null;
  }

  transferStateFromParent(parent: Agent): void {
    const parentState = parent.getState(SandboxState);
    this.provider = parentState.provider;
    this.activeContainer = parentState.activeContainer;
    this.labelToContainerId = new Map(parentState.labelToContainerId);
  }

  reset(what: ResetWhat[]): void {}

  serialize(): object {
    return {
      provider: this.provider,
      activeContainer: this.activeContainer,
      labelToContainerId: Array.from(this.labelToContainerId.entries()),
    };
  }

  deserialize(data: any): void {
    this.provider = data.provider;
    this.activeContainer = data.activeContainer;
    this.labelToContainerId = new Map(data.labelToContainerId);
  }

  show(): string[] {
    return [
      `Active Provider: ${this.provider}`,
      `Active Container: ${this.activeContainer ?? "(none)"}`,
    ];
  }
}
