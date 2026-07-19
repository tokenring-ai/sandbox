import type { ConfigFieldMeta } from "@tokenring-ai/app/config/metadata";
import { z } from "zod";

export const SandboxAgentConfigSchema = z
  .object({
    provider: z.string().exactOptional(),
  })
  .default({});

export const SandboxServiceConfigSchema = z
  .object({
    agentDefaults: z
      .object({
        provider: z.string().meta({ description: "Sandbox provider new agents use by default" } satisfies ConfigFieldMeta),
      })
      .meta({ label: "Agent Defaults" } satisfies ConfigFieldMeta),
  })
  .meta({ label: "Sandbox", description: "Isolated execution environment settings" } satisfies ConfigFieldMeta);
