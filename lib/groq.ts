import Groq from "groq-sdk";

/**
 * Returns an instance of the Groq Client.
 * Since this is instantiated on the server side (via Next.js Server Actions),
 * it reads the private GROQ_API_KEY environment variable.
 */
export const getGroqClient = (): Groq | null => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("GROQ_API_KEY is not defined in environment variables. Falling back to test mock modes.");
    return null;
  }
  return new Groq({ apiKey });
};
