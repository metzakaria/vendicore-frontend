import { z } from "zod";

export const createProductSchema = z.object({
  product_name: z.string().min(1, "Product name is required").max(200, "Product name must be less than 200 characters"),
  product_code: z.string().min(1, "Product code is required").max(50, "Product code must be less than 50 characters"),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().min(1, "Category is required"),
  preferred_provider_account_id: z.string().optional(),
  backup_provider_account_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  product_name: z.string().min(1, "Product name is required").max(200, "Product name must be less than 200 characters"),
  product_code: z.string().min(1, "Product code is required").max(50, "Product code must be less than 50 characters"),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().min(1, "Category is required"),
  preferred_provider_account_id: z.string().optional(),
  backup_provider_account_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

