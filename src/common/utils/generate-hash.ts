import { BcryptConsts } from '#common/constants';
import * as bcrypt from 'bcryptjs';

export const generateHash = (text: string): string => {
  const salt = bcrypt.genSaltSync(BcryptConsts.SALT_ROUNDS);
  const hash = bcrypt.hashSync(text, salt);

  return hash;
};
