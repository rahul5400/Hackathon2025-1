import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { useState } from 'react';

dotenv.config();

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY is not defined');
}
let hazards = ["Tsunami", "Earthquake", "Flood", "Hurricane/Tornado", "Landslide", "Wildfire", "Drought", "Heatwave", "Blizzard", "Manmade Disaster"];

export async function AIResponse(prompt: string) {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const [answer, setAnswer] = useState<string>("");

    const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompts = "Based on the given hazard, list emergency response actions, preventions, ";

    const result = await model.generateContent(prompts);
    console.log(result.response.text());

    return (
        <div>

        </div>
    )
}

