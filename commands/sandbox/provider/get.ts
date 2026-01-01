import Agent from "@tokenring-ai/agent/Agent";
import {SandboxState} from "../../../state/SandboxState.ts";

export async function get(_remainder: string, agent: Agent): Promise<void> {
  const activeProvider = agent.getState(SandboxState).provider;
  agent.infoLine(`Current provider: ${activeProvider ?? "(none)"}`);
}
