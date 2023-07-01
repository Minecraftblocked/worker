export const getTimeDifference = (targetTimestamp: Date): string => {
  const currentTimestamp: Date = new Date();
  const timeDifferenceInSeconds: number = Math.floor((currentTimestamp.getTime() - targetTimestamp.getTime()) / 1000);
  const seconds: number = Math.abs(timeDifferenceInSeconds % 60);
  const minutes: number = Math.abs(Math.floor(timeDifferenceInSeconds / 60) % 60);
  const hours: number = Math.abs(Math.floor(timeDifferenceInSeconds / 3600) % 24);
  const days: number = Math.abs(Math.floor(timeDifferenceInSeconds / 86400));

  const timeUnits: string[] = [];
  if (days > 0) {
    timeUnits.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    timeUnits.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    timeUnits.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }
  if (seconds > 0) {
    timeUnits.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
  }

  const formattedTimeDifference: string = timeUnits.join(', ');

  return formattedTimeDifference;
};
