import { z } from "zod";

export const createDataPackageSchema = z.object({
  data_code: z.string().min(1, "Data code is required").max(100, "Data code must be less than 100 characters"),
  tariff_id: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.string().min(1, "Duration is required").max(50, "Duration must be less than 50 characters"),
  value: z.string().min(1, "Value is required").max(50, "Value must be less than 50 characters"),
  product_id: z.string().min(1, "Product is required"),
  creditswitch_code: z.string().min(1, "Product is required"),
  payvantage_code: z.string().min(1, "Product is required"),
  network: z.string().min(1, "Product is required"),
  plan_name: z.string().min(1, "Product is required"),
  short_desc: z.string().min(1, "Product is required"),
  is_active: z.boolean().default(true),
});

export type CreateDataPackageFormData = z.infer<typeof createDataPackageSchema>;

export const updateDataPackageSchema = z.object({
  data_code: z.string().min(1, "Data code is required").max(100, "Data code must be less than 100 characters"),
  tariff_id: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.string().min(1, "Duration is required").max(50, "Duration must be less than 50 characters"),
  value: z.string().min(1, "Value is required").max(50, "Value must be less than 50 characters"),
  product_id: z.string().min(1, "Product is required"),
  creditswitch_code: z.string().min(1, "Product is required"),
  payvantage_code: z.string().min(1, "Product is required"),
  network: z.string().min(1, "Product is required"),
  plan_name: z.string().min(1, "Product is required"),
  short_desc: z.string().min(1, "Product is required"),
  is_active: z.boolean().default(true),
});

export type UpdateDataPackageFormData = z.infer<typeof updateDataPackageSchema>;

