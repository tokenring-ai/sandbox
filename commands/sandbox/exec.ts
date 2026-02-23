import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import SandboxService from "../../SandboxService.ts";

export async function exec(remainder: string, agent: Agent): Promise<string> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const command = remainder.trim();
  
  if (!command) {
    throw new CommandFailedError("Usage: /sandbox exec <command>");
  }
  
  const activeContainer = sandbox.getActiveContainer(agent);
  if (!activeContainer) {
    throw new CommandFailedError("No active container. Create one first with /sandbox create");
  }
  
  const result = await sandbox.executeCommand(activeContainer, command, agent);
  const lines: string[] = [];
  if (result.stdout) lines.push(`stdout: ${result.stdout}`);
  if (result.stderr) lines.push(`stderr: ${result.stderr}`);
  lines.push(`Exit code: ${result.exitCode}`);
  return lines.join("\n");
}
