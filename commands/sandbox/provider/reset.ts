import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import SandboxService from "../../../SandboxService.ts";
import {SandboxState} from "../../../state/SandboxState.ts";

async function execute(_remainder: string, agent: Agent): Promise<string> {
  const initialProvider = agent.getState(SandboxState).initialConfig.provider;
  if (!initialProvider) throw new CommandFailedError("No initial provider configured");
  agent.requireServiceByType(SandboxService).setActiveProvider(initialProvider, agent);
  return `Provider reset to ${initialProvider}`;
}

export default {
  name: "sandbox provider reset", description: "Reset to initial provider", help: `# /sandbox provider reset

Reset the active sandbox provider to the initial configured value.

## Example

/sandbox provider reset`, execute } satisfies TokenRingAgentCommand;
