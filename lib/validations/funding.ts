import { z } from "zod";

export const createFundingSchema = z.object({
  merchant_id: z.string().min(1, "Merchant is required"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Amount must be a positive number"
  ),
  description: z.string().min(1, "Description is required"),
  source: z.string().min(1, "Source is required").max(100, "Source must be less than 100 characters"),
});

export type CreateFundingFormData = z.infer<typeof createFundingSchema>;

