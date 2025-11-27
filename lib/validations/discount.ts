import { z } from "zod";

export const createDiscountSchema = z.object({
  merchant_id: z.string().min(1, "Merchant is required"),
  product_id: z.string().min(1, "Product is required"),
  discount_type: z.enum(["percentage", "flat"], {
    required_error: "Discount type is required",
  }),
  discount_value: z.string().min(1, "Discount value is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Discount value must be a positive number"
  ),
  is_active: z.boolean().default(true),
});

export type CreateDiscountFormData = z.infer<typeof createDiscountSchema>;

export const updateDiscountSchema = z.object({
  merchant_id: z.string().min(1, "Merchant is required"),
  product_id: z.string().min(1, "Product is required"),
  discount_type: z.enum(["percentage", "flat"], {
    required_error: "Discount type is required",
  }),
  discount_value: z.string().min(1, "Discount value is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Discount value must be a positive number"
  ),
  is_active: z.boolean().default(true),
});

export type UpdateDiscountFormData = z.infer<typeof updateDiscountSchema>;

