import { z } from "zod";

export const chefFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  speciality: z.string().optional(),
  experience_years: z.string().transform(Number).optional(),
  phone: z.string().optional(),
});

export type ChefFormData = z.infer<typeof chefFormSchema>;