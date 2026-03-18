import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import SandboxService from "../../SandboxService.ts";

const inputSchema = {
  args: {},
  remainder: {name: "command", description: "Command to execute", required: true}
} as const satisfies AgentCommandInputSchema;

export default {
  name: "sandbox exec",
  description: "Execute a command in the active container",
  help: `Execute a command in the active container. Requires an active container to exist.

## Example

/sandbox exec ls -la /app`,
  inputSchema,
  execute: async ({remainder, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const sandbox = agent.requireServiceByType(SandboxService);

    const active = sandbox.getActiveContainer(agent);
    if (!active) throw new CommandFailedError("No active container. Create one first with /sandbox create");
    const result = await sandbox.executeCommand(active, remainder, agent);
    const lines: string[] = [];
    if (result.stdout) lines.push(`stdout: ${result.stdout}`);
    if (result.stderr) lines.push(`stderr: ${result.stderr}`);
    lines.push(`Exit code: ${result.exitCode}`);
    return lines.join("\n");
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
