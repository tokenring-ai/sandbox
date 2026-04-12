import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {SandboxState} from "../../state/SandboxState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

export default {
  name: "sandbox status",
  description: "Show sandbox status",
  help: `Show the current sandbox status including active container and provider.

## Example

/sandbox status`,
  inputSchema,
  execute: ({
              agent,
            }: AgentCommandInputType<typeof inputSchema>): string => {
    const state = agent.getState(SandboxState);
    return `Active container: ${state.activeContainer || "none"}\nActive provider: ${state.provider || "none"}`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
