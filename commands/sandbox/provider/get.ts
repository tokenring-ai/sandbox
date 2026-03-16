import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {SandboxState} from "../../../state/SandboxState.ts";

export default {
  name: "sandbox provider get",
  description: "Show current provider",
  help: `# /sandbox provider get

Display the currently active sandbox provider.

## Example

/sandbox provider get`,
  execute: async (_remainder: string, agent: Agent): Promise<string> =>
    `Current provider: ${agent.getState(SandboxState).provider ?? "(none)"}`,
} satisfies TokenRingAgentCommand;
