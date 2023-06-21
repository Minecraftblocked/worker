export const parseServerListAddress = async (
  serverAddress: string,
): Promise<{
  address: string;
  port: number;
}> => {
  const address_parts = serverAddress.split(':');
  const address = address_parts[0];
  const port = address_parts.length > 1 ? parseInt(address_parts[1]) : 25565;
  return {
    address,
    port,
  };
};
