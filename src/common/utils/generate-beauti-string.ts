const capitializeString = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const generateBeautiString = (
  str: string,
  separator: string | RegExp = /[-]/gi,
): string => {
  const words = str.split(separator).filter((word) => word.length > 0);
  const beautiString = words.map((word) => capitializeString(word)).join(' ');

  return beautiString;
};
