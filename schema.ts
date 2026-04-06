import {z} from "zod";

export const SandboxAgentConfigSchema = z.object({
  provider: z.string().optional(),
}).default({});

export const SandboxServiceConfigSchema = z.object({
  agentDefaults: z.object({
    provider: z.string()
  })
});
