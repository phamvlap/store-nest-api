import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().optional(),
  sku: z.string().nonempty(),
  price: z.number().positive(),
  features: z.array(z.string()).optional(),
  specifications: z.string().nonempty(),
  images: z.array(z.string()).nonempty(),
  warranty: z.string().optional(),
  deliveryInformation: z.string().optional(),
  categoryId: z.string().nonempty(),
  brandId: z.string().optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
