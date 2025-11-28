import TokenRingApp from "@tokenring-ai/app"; 
import {AgentCommandService} from "@tokenring-ai/agent";
import {ChatService} from "@tokenring-ai/chat";
import DockerSandboxProvider from "@tokenring-ai/docker/DockerSandboxProvider";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {z} from "zod";
import chatCommands from "./chatCommands.ts";
import packageJSON from './package.json' with {type: 'json'};
import SandboxService from "./SandboxService.ts";
import tools from "./tools.ts";

export const SandboxConfigSchema = z.object({
  providers: z.record(z.string(), z.any()),
  default: z.object({
    provider: z.string()
  }).optional()
}).optional();

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app: TokenRingApp) {
    const config = app.getConfigSlice('sandbox', SandboxConfigSchema);
    if (config) {
      app.waitForService(ChatService, chatService =>
        chatService.addTools(packageJSON.name, tools)
      );
      app.waitForService(AgentCommandService, agentCommandService =>
        agentCommandService.addAgentCommands(chatCommands)
      );
      const sandboxService = new SandboxService();
      app.addServices(sandboxService);

      if (config.providers) {
        for (const name in config.providers) {
          const sandboxConfig = config.providers[name];
          switch (sandboxConfig.type) {
            case "docker":
              sandboxService.registerSandboxProvider(name, new DockerSandboxProvider(sandboxConfig));
              break;
          }
        }
      }
      if (config.default?.provider) {
        sandboxService.setActiveSandboxProviderName(config.default.provider);
      }
    }
  }
} as TokenRingPlugin;

export {default as SandboxService} from "./SandboxService.ts";
export {default as SandboxResource} from "./SandboxProvider.ts";