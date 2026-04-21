import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import { SandboxState } from "../../../state/SandboxState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

export default {
  name: "sandbox provider get",
  description: "Show current provider",
  help: `Display the currently active sandbox provider.

## Example

/sandbox provider get`,
  inputSchema,
  execute: async ({ agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> =>
    `Current provider: ${agent.getState(SandboxState).provider ?? "(none)"}`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
