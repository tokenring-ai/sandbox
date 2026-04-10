import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand,} from "@tokenring-ai/agent/types";
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
  name: "sandbox logs",
  description: "Get container logs",
  help: `Retrieve logs from a container. Uses the active container if no label is specified.

## Example

/sandbox logs
/sandbox logs myapp`,
  inputSchema,
  execute: async ({
                    positionals,
                    agent,
                  }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const sandbox = agent.requireServiceByType(SandboxService);
    const label = positionals.label || sandbox.getActiveContainer(agent);
    if (!label)
      throw new CommandFailedError(
        "No container specified and no active container",
      );
    const result = await sandbox.getLogs(label, agent);
    return `Logs:\n${result.logs}`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
