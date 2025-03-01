const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompts = "Explain how AI works";

async function generateContent() {
  const result = await model.generateContent(prompts);
  console.log(result.response.text());
}

generateContent();

export {};