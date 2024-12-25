import * as CryptoJS from 'crypto-js';

export const generateHashSHA256 = (text: string): string => {
  const hash = CryptoJS.HmacSHA256(text, process.env.HASH_SECRET_KEY as string);

  return hash.toString(CryptoJS.enc.Hex);
};
