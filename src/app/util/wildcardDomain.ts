export const parseWildcardDomain = (address: string): string | null => {
  const parts = address.split('.');
  if (parts.length > 2) {
    parts[0] = '*';
    return parts.join('.');
  } else {
    return null;
  }
};
