import Agent from "@tokenring-ai/agent/Agent";
import {SandboxState} from "../../../state/SandboxState.ts";

export async function get(_remainder: string, agent: Agent): Promise<string> {
  const activeProvider = agent.getState(SandboxState).provider;
  return `Current provider: ${activeProvider ?? "(none)"}`;
}
