import { z } from "zod";

export const agentIdentitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Agent name is required")
    .max(100, "Agent name must be less than 100 characters"),
  agentId: z
    .string()
    .trim()
    .min(1, "Agent ID is required")
    .max(100, "Agent ID must be less than 100 characters"),
});

export const coreTruthSchema = z.object({
  truth: z
    .string()
    .trim()
    .min(1, "Truth statement is required")
    .max(1000, "Truth must be less than 1000 characters"),
  category: z
    .enum(["foundation", "principle", "covenant"])
    .default("foundation"),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required")
    .max(500, "Reason must be less than 500 characters"),
});

export const principleSchema = z.object({
  principleKey: z
    .string()
    .trim()
    .min(1, "Principle key is required")
    .max(100, "Principle key must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Principle key can only contain letters, numbers, hyphens, and underscores"
    ),
  principleValue: z
    .string()
    .trim()
    .min(1, "Principle value is required")
    .max(500, "Principle value must be less than 500 characters"),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required")
    .max(500, "Reason must be less than 500 characters"),
});

export const memoryAnchorSchema = z.object({
  type: z.enum([
    "genesis_conversation",
    "foundational_decision",
    "key_learning",
  ]),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description must be less than 1000 characters"),
});
