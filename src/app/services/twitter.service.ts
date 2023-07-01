import twitter from '../../config/twitter';

export const postTweet = async (message: string) => {
  try {
    await twitter.v2.tweet(message);
  } catch (err) {
    console.error(err);
  }
};

export const createTwitterMessage = (lines: string[]) => {
  const message = lines.join('\n');
  return message;
};
