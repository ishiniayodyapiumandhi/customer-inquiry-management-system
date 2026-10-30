import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const inquirySchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  contact: z.string().trim().min(3).max(120),
  subject: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(2000)
});

export const statusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved'])
});