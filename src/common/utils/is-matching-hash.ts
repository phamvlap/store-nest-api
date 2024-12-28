import * as bcrypt from 'bcryptjs';

export const isMatchingHash = (plainText: string, hash: string) => {
  return bcrypt.compareSync(plainText, hash);
};
