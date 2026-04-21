import { CommandFailedError } from "@tokenring-ai/agent/AgentError";
import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import SandboxService from "../../SandboxService.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "label",
      description: "Container label (uses active container if omitted)",
      required: false,
    },
  ],
} as const satisfies AgentCommandInputSchema;

export default {
  name: "sandbox remove",
  description: "Remove a container",
  help: `Remove a container. Uses the active container if no label is specified.

## Example

/sandbox remove
/sandbox remove myapp`,
  inputSchema,
  execute: async ({ positionals, agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const sandbox = agent.requireServiceByType(SandboxService);
    const label = positionals.label || sandbox.getActiveContainer(agent);
    if (!label) throw new CommandFailedError("No container specified and no active container");
    await sandbox.removeContainer(label, agent);
    return `Container removed: ${label}`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
