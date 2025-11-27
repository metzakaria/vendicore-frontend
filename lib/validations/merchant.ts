import { z } from "zod";

export const createMerchantSchema = z.object({
  // Business Information
  business_name: z.string().min(1, "Business name is required").max(200, "Business name must be less than 200 characters"),
  business_description: z.string().optional(),
  account_type: z.string().min(1, "Account type is required"),
  
  // Location
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  
  // User Account
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
  
  // Balance
  initial_balance: z.string().default("0"),
  
  // API Settings
  api_access_ip: z.string().optional(),
  daily_tranx_limit: z.string().optional(),
  
  // Status
  is_active: z.boolean().default(true),
});

export type CreateMerchantFormData = z.infer<typeof createMerchantSchema>;

export const updateMerchantSchema = z.object({
  // Business Information
  business_name: z.string().min(1, "Business name is required").max(200, "Business name must be less than 200 characters"),
  business_description: z.string().optional(),
  account_type: z.string().min(1, "Account type is required"),
  
  // Location
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  
  // User Account
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
  
  // API Settings
  api_access_ip: z.string().optional(),
  daily_tranx_limit: z.string().optional(),
  
  // Status
  is_active: z.boolean().default(true),
});

export type UpdateMerchantFormData = z.infer<typeof updateMerchantSchema>;
