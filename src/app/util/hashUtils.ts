import crypto from 'crypto';

export const hashHostname = async (hostname: string) => {
  // Convert the hostname to lower case
  const lowercaseHostname = hostname.toLowerCase();

  // Remove any trailing periods
  const finalHostname = lowercaseHostname.endsWith('.') ? lowercaseHostname.slice(0, -1) : lowercaseHostname;

  // Create the SHA-1 hash
  const hash = await crypto.createHash('sha1');
  await hash.update(finalHostname);

  return await hash.digest('hex');
};
