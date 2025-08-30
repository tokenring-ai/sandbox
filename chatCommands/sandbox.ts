import {HumanInterfaceService} from "@token-ring/chat";
import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import SandboxService from "../SandboxService.js";

export const description = "/sandbox [action] - Sandbox container operations";

export function help(): Array<string> {
  return [
    "/sandbox [action] - Sandbox container operations",
    "  Actions:",
    "    create [image]     - Create new container",
    "    exec <command>     - Execute command in active container",
    "    stop [containerId] - Stop container",
    "    logs [containerId] - Get container logs",
    "    remove [containerId] - Remove container",
    "    status             - Show active container and provider",
    "    provider [name]    - Show/set active provider",
    "",
    "  Examples:",
    "    /sandbox create ubuntu:latest",
    "    /sandbox exec ls -la",
    "    /sandbox logs",
    "    /sandbox stop",
    "    /sandbox provider docker",
  ];
}

export async function execute(remainder: string, registry: Registry): Promise<void> {
  const chat = registry.requireFirstServiceByType(ChatService);
  registry.requireFirstServiceByType(HumanInterfaceService);
  const sandbox = registry.requireFirstServiceByType(SandboxService);

  const [action, ...args] = remainder.trim().split(/\s+/);
  if (!action) {
    help().forEach((l) => chat.systemLine(l));
    return;
  }

  if (action === "create") {
    const image = args[0];
    const result = await sandbox.createContainer({ image });
    chat.systemLine(`Container created: ${result.containerId} (${result.status})`);
  } else if (action === "exec") {
    const command = args.join(" ");
    if (!command) {
      chat.errorLine("Usage: /sandbox exec <command>");
      return;
    }
    const activeContainer = sandbox.getActiveContainer();
    if (!activeContainer) {
      chat.errorLine("No active container. Create one first with /sandbox create");
      return;
    }
    const result = await sandbox.executeCommand(activeContainer, command);
    if (result.stdout) chat.systemLine(`stdout: ${result.stdout}`);
    if (result.stderr) chat.errorLine(`stderr: ${result.stderr}`);
    chat.systemLine(`Exit code: ${result.exitCode}`);
  } else if (action === "stop") {
    const containerId = args[0] || sandbox.getActiveContainer();
    if (!containerId) {
      chat.errorLine("No container specified and no active container");
      return;
    }
    await sandbox.stopContainer(containerId);
    chat.systemLine(`Container stopped: ${containerId}`);
  } else if (action === "logs") {
    const containerId = args[0] || sandbox.getActiveContainer();
    if (!containerId) {
      chat.errorLine("No container specified and no active container");
      return;
    }
    const result = await sandbox.getLogs(containerId);
    chat.systemLine(`Logs:\n${result.logs}`);
  } else if (action === "remove") {
    const containerId = args[0] || sandbox.getActiveContainer();
    if (!containerId) {
      chat.errorLine("No container specified and no active container");
      return;
    }
    await sandbox.removeContainer(containerId);
    chat.systemLine(`Container removed: ${containerId}`);
  } else if (action === "status") {
    const activeContainer = sandbox.getActiveContainer();
    const activeProvider = sandbox.getActiveSandboxProviderName();
    chat.systemLine(`Active container: ${activeContainer || "none"}`);
    chat.systemLine(`Active provider: ${activeProvider || "none"}`);
  } else if (action === "provider") {
    if (args[0]) {
      sandbox.setActiveSandboxProviderName(args[0]);
      chat.systemLine(`Active provider set to: ${args[0]}`);
    } else {
      const active = sandbox.getActiveSandboxProviderName();
      const available = sandbox.getAvailableSandboxProviders();
      chat.systemLine(`Active provider: ${active || "none"}`);
      chat.systemLine(`Available providers: ${available.join(", ")}`);
    }
  } else {
    chat.systemLine("Unknown action. Use: create, exec, stop, logs, remove, status, provider");
  }
}