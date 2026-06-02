import OpenAI from "openpipe/openai";

const client = new OpenAI({
  openpipe: {
    apiKey: process.env.OPENPIPE_API_KEY,
  },
});

export default client;
