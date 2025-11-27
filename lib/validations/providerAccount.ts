import { z } from "zod";

export const createProviderAccountSchema = z.object({
  account_name: z.string().min(1, "Account name is required").max(50, "Account name must be less than 50 characters"),
  provider_id: z.string().min(1, "Provider is required"),
  available_balance: z.string().default("0"),
  balance_at_provider: z.string().default("0"),
  vending_sim: z.string().optional(),
  config: z.any().optional(), // Dynamic config fields based on provider schema
});

export type CreateProviderAccountFormData = z.infer<typeof createProviderAccountSchema>;

export const updateProviderAccountSchema = z.object({
  account_name: z.string().min(1, "Account name is required").max(50, "Account name must be less than 50 characters"),
  provider_id: z.string().min(1, "Provider is required"),
  available_balance: z.string().default("0"),
  balance_at_provider: z.string().default("0"),
  vending_sim: z.string().optional(),
  config: z.any().optional(), // Dynamic config fields based on provider schema
});

export type UpdateProviderAccountFormData = z.infer<typeof updateProviderAccountSchema>;

