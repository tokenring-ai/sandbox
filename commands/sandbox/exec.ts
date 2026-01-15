import Agent from "@tokenring-ai/agent/Agent";
import SandboxService from "../../SandboxService.ts";

export async function exec(remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const command = remainder.trim();
  
  if (!command) {
    agent.errorMessage("Usage: /sandbox exec <command>");
    return;
  }
  
  const activeContainer = sandbox.getActiveContainer(agent);
  if (!activeContainer) {
    agent.errorMessage("No active container. Create one first with /sandbox create");
    return;
  }
  
  const result = await sandbox.executeCommand(activeContainer, command, agent);
  if (result.stdout) agent.infoMessage(`stdout: ${result.stdout}`);
  if (result.stderr) agent.errorMessage(`stderr: ${result.stderr}`);
  agent.infoMessage(`Exit code: ${result.exitCode}`);
}
