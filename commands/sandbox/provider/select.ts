import type {TreeLeaf} from "@tokenring-ai/agent/question";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand,} from "@tokenring-ai/agent/types";
import SandboxService from "../../../SandboxService.ts";
import {SandboxState} from "../../../state/SandboxState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

export default {
  name: "sandbox provider select",
  description: "Interactively select a provider",
  help: `Interactively select the active sandbox provider. Auto-selects if only one provider is configured.

## Example

/sandbox provider select`,
  inputSchema,
  execute: async ({
                    agent,
                  }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const sandbox = agent.requireServiceByType(SandboxService);
    const available = sandbox.getAvailableProviders();
    if (available.length === 0) return "No sandbox providers are registered.";
    if (available.length === 1) {
      sandbox.setActiveProvider(available[0], agent);
      return `Only one provider configured, auto-selecting: ${available[0]}`;
    }
    const activeProvider = agent.getState(SandboxState).provider;
    const tree: TreeLeaf[] = available.map((name) => ({
      name: `${name}${name === activeProvider ? " (current)" : ""}`,
      value: name,
    }));
    const selection = await agent.askQuestion({
      title: "Sandbox Provider Selection",
      message: "Select an active sandbox provider",
      question: {
        type: "treeSelect",
        label: "Provider",
        key: "result",
        defaultValue: activeProvider ? [activeProvider] : undefined,
        minimumSelections: 1,
        maximumSelections: 1,
        tree,
      },
    });
    if (selection) {
      sandbox.setActiveProvider(selection[0], agent);
      return `Active provider set to: ${selection[0]}`;
    }
    return "Provider selection cancelled.";
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
