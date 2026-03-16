import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import SandboxService from "../../SandboxService.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "label",
      description: "Container label",
      required: true,
    },
    {
      name: "image",
      description: "Optional container image",
      required: false,
    },
  ],
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "sandbox create",
  description: "Create a container",
  help: `Create a new sandbox container with an optional image.

## Example

/sandbox create myapp
/sandbox create myapp ubuntu:22.04`,
  inputSchema,
  execute: async ({positionals: { label, image }, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const result = await agent.requireServiceByType(SandboxService).createContainer({label, image}, agent);
    return `Container created: ${result.containerId} (${result.status})`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
