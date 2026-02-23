import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import SandboxService from "../../../SandboxService.ts";
import {SandboxState} from "../../../state/SandboxState.ts";

export async function reset(_remainder: string, agent: Agent): Promise<string> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const initialProvider = agent.getState(SandboxState).initialConfig.provider;
  
  if (!initialProvider) {
    throw new CommandFailedError("No initial provider configured");
  }
  
  sandbox.setActiveProvider(initialProvider, agent);
  return `Provider reset to ${initialProvider}`;
}
