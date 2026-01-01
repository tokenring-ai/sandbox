import Agent from "@tokenring-ai/agent/Agent";
import SandboxService from "../../SandboxService.ts";

export async function exec(remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const command = remainder.trim();
  
  if (!command) {
    agent.errorLine("Usage: /sandbox exec <command>");
    return;
  }
  
  const activeContainer = sandbox.getActiveContainer(agent);
  if (!activeContainer) {
    agent.errorLine("No active container. Create one first with /sandbox create");
    return;
  }
  
  const result = await sandbox.executeCommand(activeContainer, command, agent);
  if (result.stdout) agent.infoLine(`stdout: ${result.stdout}`);
  if (result.stderr) agent.errorLine(`stderr: ${result.stderr}`);
  agent.infoLine(`Exit code: ${result.exitCode}`);
}
