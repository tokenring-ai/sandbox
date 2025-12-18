import {z} from "zod";

export const SandboxConfigSchema = z.object({
  providers: z.record(z.string(), z.any()),
  default: z.object({
    provider: z.string()
  }).optional()
}).optional();



export {default as SandboxService} from "./SandboxService.ts";
export {default as SandboxResource} from "./SandboxProvider.ts";