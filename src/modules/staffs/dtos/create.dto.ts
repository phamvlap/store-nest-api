import validator from 'validator';
import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().nonempty().email(),
  phoneNumber: z
    .string()
    .nonempty()
    .max(17)
    .refine((value) => validator.isMobilePhone(value, 'any'), {
      message: 'Invalid phone number',
    }),
  password: z.string().nonempty().min(8),
});

export type CreateStaffDto = z.infer<typeof createStaffSchema>;
