import Agent from "@tokenring-ai/agent/Agent";
import SandboxService from "../../../SandboxService.ts";
import {SandboxState} from "../../../state/SandboxState.ts";

export async function select(_remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const available = sandbox.getAvailableProviders();

  if (available.length === 0) {
    agent.infoLine("No sandbox providers are registered.");
    return;
  }

  if (available.length === 1) {
    sandbox.setActiveProvider(available[0], agent);
    agent.infoLine(`Only one provider configured, auto-selecting: ${available[0]}`);
    return;
  }

  const activeProvider = agent.getState(SandboxState).provider;
  const formattedProviders = available.map(name => ({
    name: `${name}${name === activeProvider ? " (current)" : ""}`,
    value: name,
  }));

  const selectedValue = await agent.askHuman({
    type: "askForSingleTreeSelection",
    title: "Sandbox Provider Selection",
    message: "Select an active sandbox provider",
    tree: {name: "Available Providers", children: formattedProviders}
  });

  if (selectedValue) {
    sandbox.setActiveProvider(selectedValue, agent);
    agent.infoLine(`Active provider set to: ${selectedValue}`);
  } else {
    agent.infoLine("Provider selection cancelled.");
  }
}
