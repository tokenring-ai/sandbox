import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import DockerSandboxProvider from "@tokenring-ai/docker/DockerSandboxProvider";
import {z} from "zod";
import * as chatCommands from "./chatCommands.ts";
import packageJSON from './package.json' with {type: 'json'};
import SandboxService from "./SandboxService.ts";
import * as tools from "./tools.ts";

export const SandboxConfigSchema = z.object({
  providers: z.record(z.string(), z.any()),
  default: z.object({
    provider: z.string()
  }).optional()
}).optional();

export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    const config = agentTeam.getConfigSlice('sandbox', SandboxConfigSchema);
    if (config) {
      agentTeam.addTools(packageInfo, tools);
      agentTeam.addChatCommands(chatCommands);
      const sandboxService = new SandboxService();
      agentTeam.addServices(sandboxService);

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
};

export {default as SandboxService} from "./SandboxService.ts";
export {default as SandboxResource} from "./SandboxProvider.ts";