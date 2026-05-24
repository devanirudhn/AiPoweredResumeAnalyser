import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

console.log("Using API KEY:", process.env.GROQ_API_KEY);

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

async function main() {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: "Hello! Reply with a one-word greeting."
        }
      ]
    });
    console.log("Success! Response:", completion.choices[0].message.content);
  } catch (error) {
    console.error("Groq Error:", error.message);
    if (error.response) {
      console.error("Response body:", error.response.body);
    }
  }
}

main();
