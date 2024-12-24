import { existsSync, lstatSync } from 'fs';

export const isDirectory = (path: string): boolean => {
  if (!existsSync(path)) {
    return false;
  }
  return lstatSync(path) ? lstatSync(path).isDirectory() : false;
};
