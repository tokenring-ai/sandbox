import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {SandboxState} from "../../state/SandboxState.ts";

export default {
  name: "sandbox status",
  description: "Show sandbox status",
  help: `# /sandbox status

Show the current sandbox status including active container and provider.

## Example

/sandbox status`,
  execute: async (_remainder: string, agent: Agent): Promise<string> => {
    const state = agent.getState(SandboxState);
    return `Active container: ${state.activeContainer || "none"}\nActive provider: ${state.provider || "none"}`;
  },
} satisfies TokenRingAgentCommand;
