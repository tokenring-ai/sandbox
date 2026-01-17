import Agent from "@tokenring-ai/agent/Agent";
import type {TreeLeaf} from "@tokenring-ai/agent/question";
import SandboxService from "../../../SandboxService.ts";
import {SandboxState} from "../../../state/SandboxState.ts";

export async function select(_remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const available = sandbox.getAvailableProviders();

  if (available.length === 0) {
    agent.infoMessage("No sandbox providers are registered.");
    return;
  }

  if (available.length === 1) {
    sandbox.setActiveProvider(available[0], agent);
    agent.infoMessage(`Only one provider configured, auto-selecting: ${available[0]}`);
    return;
  }

  const activeProvider = agent.getState(SandboxState).provider;
  const formattedProviders: TreeLeaf[] = available.map(name => ({
    name: `${name}${name === activeProvider ? " (current)" : ""}`,
    value: name,
  }));

  const selection = await agent.askQuestion({
    title: "Sandbox Provider Selection",
    message: "Select an active sandbox provider",
    question: {
      type: 'treeSelect',
      label: "Provider",
      key: "result",
      defaultValue: activeProvider ? [activeProvider] : undefined,
      minimumSelections: 1,
      maximumSelections: 1,
      tree: formattedProviders
    }
  });

  if (selection) {
    const selectedValue = selection[0];
    sandbox.setActiveProvider(selectedValue, agent);
    agent.infoMessage(`Active provider set to: ${selectedValue}`);
  } else {
    agent.infoMessage("Provider selection cancelled.");
  }
}
