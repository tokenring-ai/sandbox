import Agent from "@tokenring-ai/agent/Agent";
import SandboxService from "../../../SandboxService.ts";
import {SandboxState} from "../../../state/SandboxState.ts";

export async function reset(_remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const initialProvider = agent.getState(SandboxState).initialConfig.provider;
  
  if (initialProvider) {
    sandbox.setActiveProvider(initialProvider, agent);
    agent.infoMessage(`Provider reset to ${initialProvider}`);
  } else {
    agent.errorMessage("No initial provider configured");
  }
}
