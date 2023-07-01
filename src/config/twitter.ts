import { TwitterApi } from 'twitter-api-v2';
import { environment as config } from './environment';

const client = new TwitterApi({
  appKey: config.twitter.apiKey,
  appSecret: config.twitter.apiSecret,
  accessToken: config.twitter.accessToken,
  accessSecret: config.twitter.accessTokenSecret,
});

const rwClient = client.readWrite;

export default rwClient;
