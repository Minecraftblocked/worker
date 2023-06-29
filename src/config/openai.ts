import { environment as config } from './environment';
import { Configuration, OpenAIApi } from 'openai';

const openaiConfig = new Configuration({
  apiKey: config.openai.key,
});

export const openai = new OpenAIApi(openaiConfig);
