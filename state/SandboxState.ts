import type { Agent } from "@tokenring-ai/agent";
import { AgentStateSlice } from "@tokenring-ai/agent/types";
import { z } from "zod";
import type { SandboxAgentConfigSchema } from "../schema.ts";

const serializationSchema = z.object({
  provider: z.string().nullable(),
  activeContainer: z.string().nullable(),
  labelToContainerId: z.array(z.tuple([z.string(), z.string()])),
});

export class SandboxState extends AgentStateSlice<typeof serializationSchema> {
  provider: string | null;
  activeContainer: string | null = null;
  labelToContainerId: Map<string, string> = new Map();

  constructor(readonly initialConfig: z.output<typeof SandboxAgentConfigSchema>) {
    super("SandboxState", serializationSchema);
    this.provider = initialConfig.provider ?? null;
  }

  transferStateFromParent(parent: Agent): void {
    const parentState = parent.getState(SandboxState);
    this.provider = parentState.provider;
    this.activeContainer = parentState.activeContainer;
    this.labelToContainerId = new Map(parentState.labelToContainerId);
  }

  serialize(): z.output<typeof serializationSchema> {
    return {
      provider: this.provider,
      activeContainer: this.activeContainer,
      labelToContainerId: Array.from(this.labelToContainerId.entries()),
    };
  }

  deserialize(data: z.output<typeof serializationSchema>): void {
    this.provider = data.provider;
    this.activeContainer = data.activeContainer;
    this.labelToContainerId = new Map(data.labelToContainerId);
  }

  show(): string {
    return `Active Provider: ${this.provider}
Active Container: ${this.activeContainer ?? "(none)"}`;
  }
}
