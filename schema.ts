import {z} from "zod";

export const SandboxAgentConfigSchema = z.object({
  provider: z.string().optional(),
}).default({});

export const SandboxServiceConfigSchema = z.object({
  providers: z.record(z.string(), z.any()).optional(),
  agentDefaults: z.object({
    provider: z.string()
  })
});
