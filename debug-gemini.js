
import { GoogleGenerativeAI } from "@google/generative-ai";

async function test25Flash() {
    const apiKey = process.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
        console.error("No API Key");
        return;
    }

    // Testing the newest model found in the list
    const modelName = "gemini-2.5-flash";
    console.log(`Testing specific model: ${modelName}...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    try {
        const result = await model.generateContent("Hi, are you working?");
        const response = await result.response;
        console.log(`✅ SUCCESS! ${modelName} responded: "${response.text()}"`);
    } catch (error) {
        console.error(`❌ FAILED ${modelName}:`, error.message);
    }
}

test25Flash();
