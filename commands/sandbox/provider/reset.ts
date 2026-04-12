import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import SandboxService from "../../../SandboxService.ts";
import {SandboxState} from "../../../state/SandboxState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

export default {
  name: "sandbox provider reset",
  description: "Reset to initial provider",
  help: `Reset the active sandbox provider to the initial configured value.

## Example

/sandbox provider reset`,
  inputSchema,
  execute: ({
              agent,
            }: AgentCommandInputType<typeof inputSchema>): string => {
    const initialProvider = agent.getState(SandboxState).initialConfig.provider;
    if (!initialProvider)
      throw new CommandFailedError("No initial provider configured");
    agent
      .requireServiceByType(SandboxService)
      .setActiveProvider(initialProvider, agent);
    return `Provider reset to ${initialProvider}`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
