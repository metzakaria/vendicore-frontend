import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(1, "Username is required").max(150, "Username must be less than 150 characters"),
  email: z.string().email("Invalid email address").max(254, "Email must be less than 254 characters"),
  first_name: z.string().max(150, "First name must be less than 150 characters").optional(),
  last_name: z.string().max(150, "Last name must be less than 150 characters").optional(),
  phone_number: z.string().max(15, "Phone number must be less than 15 characters").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  is_superuser: z.boolean().default(false),
  is_staff: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  username: z.string().min(1, "Username is required").max(150, "Username must be less than 150 characters"),
  email: z.string().email("Invalid email address").max(254, "Email must be less than 254 characters"),
  first_name: z.string().max(150, "First name must be less than 150 characters").optional(),
  last_name: z.string().max(150, "Last name must be less than 150 characters").optional(),
  phone_number: z.string().max(15, "Phone number must be less than 15 characters").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  is_superuser: z.boolean().default(false),
  is_staff: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

