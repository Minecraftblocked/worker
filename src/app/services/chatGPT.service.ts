import { openai } from '../../config/openai';

export const completeServerNameFromHostname = async (serverHostname: string) => {
  const PROMPT = `
    Hello ChatGPT 3.5,

    I kindly request your assistance in generating a human-readable Minecraft server name as a data processor.

    Please accept the following input:
    {
        "serverHostname": "${serverHostname}",
    }

    Based on the given information, please generate a human-readable Minecraft server name. If any part of the name suggests content that is generally considered restricted or inappropriate, only then replace it with asterisks (****). Otherwise, keep the words intact.

    The desired output format should be:
    {
        "serverName": ""
    }

    In case the serverHostname cannot be interpreted or understood, please output "unknown" instead of generating random names.

    ONLY produce the output.
  `;
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: PROMPT }],
    });

    if (
      response &&
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0 &&
      response.data.choices[0].message
    ) {
      const messageContent = response.data.choices[0].message.content;
      if (typeof messageContent === 'string') {
        const parsedResponse = JSON.parse(messageContent);
        if (parsedResponse && typeof parsedResponse.serverName === 'string') {
          return parsedResponse.serverName;
        }
      }
    }
  } catch (error) {
    return 'unknown';
  }
  return 'unknown';
};
