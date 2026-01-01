import {AgentCommandService} from "@tokenring-ai/agent";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {DockerSandboxProvider} from "@tokenring-ai/docker";
import {z} from "zod";
import chatCommands from "./chatCommands.ts";
import packageJSON from './package.json' with {type: 'json'};
import SandboxService from "./SandboxService.ts";
import {SandboxServiceConfigSchema} from "./schema.ts";
import tools from "./tools.ts";

const packageConfigSchema = z.object({
  sandbox: SandboxServiceConfigSchema
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

      const sandboxService = new SandboxService(config.sandbox);
      app.addServices(sandboxService);

      if (config.sandbox.providers) {
        for (const name in config.sandbox.providers) {
          const sandboxConfig = config.sandbox.providers[name];
          switch (sandboxConfig.type) {
            case "docker":
              sandboxService.registerProvider(name, new DockerSandboxProvider(sandboxConfig));
              break;
            default:
              throw new Error(`Unknown sandbox provider type: ${sandboxConfig.type}`);
          }
        }
      }
    }
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
