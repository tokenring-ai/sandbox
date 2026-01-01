import Agent from "@tokenring-ai/agent/Agent";
import SandboxService from "../../SandboxService.ts";
import {SandboxState} from "../../state/SandboxState.ts";

export async function status(_remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const state = agent.getState(SandboxState);
  
  agent.infoLine(`Active container: ${state.activeContainer || "none"}`);
  agent.infoLine(`Active provider: ${state.provider || "none"}`);
}
