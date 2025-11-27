import { z } from "zod";

export const createProviderSchema = z.object({
  name: z.string().min(1, "Provider name is required").max(200, "Provider name must be less than 200 characters"),
  provider_code: z.string().min(1, "Provider code is required").max(50, "Provider code must be less than 50 characters"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type CreateProviderFormData = z.infer<typeof createProviderSchema>;

export const updateProviderSchema = z.object({
  name: z.string().min(1, "Provider name is required").max(200, "Provider name must be less than 200 characters"),
  provider_code: z.string().min(1, "Provider code is required").max(50, "Provider code must be less than 50 characters"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type UpdateProviderFormData = z.infer<typeof updateProviderSchema>;

