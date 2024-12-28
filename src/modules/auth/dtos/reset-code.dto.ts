import { z } from 'zod';

export const resetCodeSchema = z.object({
  email: z.string().nonempty().email(),
});

export type ResetCodeDto = z.infer<typeof resetCodeSchema>;
