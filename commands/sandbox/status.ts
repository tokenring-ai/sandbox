import Agent from "@tokenring-ai/agent/Agent";
import {SandboxState} from "../../state/SandboxState.ts";

export async function status(_remainder: string, agent: Agent): Promise<string> {
  const state = agent.getState(SandboxState);
  
  return `Active container: ${state.activeContainer || "none"}\nActive provider: ${state.provider || "none"}`;
}
