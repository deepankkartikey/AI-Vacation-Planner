// Test script to verify Gemini API setup
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiAPI() {
    try {
        console.log('🧪 Testing Gemini API...');
        
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        console.log('API Key format:', apiKey ? apiKey.substring(0, 10) + '...' : 'Missing');
        
        if (!apiKey) {
            throw new Error('API key not found');
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Test different models
        const modelsToTest = [
            'gemini-1.5-flash',
            'gemini-1.5-pro', 
            'gemini-pro'
        ];
        
        for (const modelName of modelsToTest) {
            try {
                console.log(`\n🔍 Testing model: ${modelName}`);
                
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say hello in JSON format');
                
                console.log(`✅ ${modelName} works!`);
                console.log('Response:', result.response.text());
                break;
                
            } catch (error) {
                console.log(`❌ ${modelName} failed:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testGeminiAPI();