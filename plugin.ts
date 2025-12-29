import {AgentCommandService} from "@tokenring-ai/agent";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {DockerSandboxProvider} from "@tokenring-ai/docker";
import {z} from "zod";
import chatCommands from "./chatCommands.ts";
import {SandboxConfigSchema} from "./index.ts";
import packageJSON from './package.json' with {type: 'json'};
import SandboxService from "./SandboxService.ts";
import tools from "./tools.ts";

const packageConfigSchema = z.object({
  sandbox: SandboxConfigSchema,
});


export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    if (config.sandbox) {
      app.waitForService(ChatService, chatService =>
        chatService.addTools(packageJSON.name, tools)
      );
      app.waitForService(AgentCommandService, agentCommandService =>
        agentCommandService.addAgentCommands(chatCommands)
      );

      const sandboxService = new SandboxService();
      app.addServices(sandboxService);

      if (config.sandbox.providers) {
        for (const name in config.sandbox.providers) {
          const sandboxConfig = config.sandbox.providers[name];
          switch (sandboxConfig.type) {
            case "docker":
              sandboxService.registerSandboxProvider(name, new DockerSandboxProvider(sandboxConfig));
              break;
            default:
              throw new Error(`Unknown sandbox provider type: ${sandboxConfig.type}`);
          }
        }
      }
      if (config.sandbox.default?.provider) {
        sandboxService.setActiveSandboxProviderName(config.sandbox.default.provider);
      }
    }
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
