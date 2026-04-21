import { AgentCommandService } from "@tokenring-ai/agent";
import type { TokenRingPlugin } from "@tokenring-ai/app";
import { ChatService } from "@tokenring-ai/chat";
import { z } from "zod";
import agentCommands from "./commands.ts";
import packageJSON from "./package.json" with { type: "json" };
import SandboxService from "./SandboxService.ts";
import { SandboxServiceConfigSchema } from "./schema.ts";
import tools from "./tools.ts";

const packageConfigSchema = z.object({
  sandbox: SandboxServiceConfigSchema,
});

export default {
  name: packageJSON.name,
  displayName: "Execution Sandbox",
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    if (!config.sandbox) return;

    app.waitForService(ChatService, chatService => chatService.addTools(...tools));
    app.waitForService(AgentCommandService, agentCommandService => agentCommandService.addAgentCommands([...agentCommands]));

    app.addServices(new SandboxService(config.sandbox));
  },
  config: packageConfigSchema,
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
