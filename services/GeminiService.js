/**
 * Gemini AI Service
 * Handles all interactions with Google's Gemini AI API
 */

class GeminiService {
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    this.models = [
      'gemini-2.5-flash-lite',  // Fastest, lightweight
      'gemini-2.5-flash',       // Balanced speed and quality
      'gemini-2.5-pro',         // Most capable
    ];
    this.generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 16384,
    };
  }

  /**
   * Validate API key
   */
  validateApiKey() {
    if (!this.apiKey) {
      throw new Error('Gemini API key not found. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file');
    }

    if (!this.apiKey.startsWith('AIza')) {
      console.warn('⚠️ Gemini API key format may be incorrect. Expected format: AIza...');
    }

    console.log('🔍 Gemini API Key validated:', {
      hasKey: true,
      keyFormat: this.apiKey.substring(0, 10) + '...',
      isCorrectFormat: this.apiKey.startsWith('AIza') ? '✅' : '❌'
    });
  }

  /**
   * Create a fresh chat session
   * Returns an object with sendMessage method
   */
  async createChatSession() {
    try {
      console.log('🔧 Creating fresh Gemini chat session...');
      
      this.validateApiKey();
      
      return {
        sendMessage: async (prompt) => {
          return await this.sendMessage(prompt);
        }
      };
    } catch (error) {
      console.error('❌ Error creating chat session:', error);
      throw error;
    }
  }

  /**
   * Send a message to Gemini API with automatic model fallback
   */
  async sendMessage(prompt) {
    let lastError = null;
    
    for (const modelName of this.models) {
      try {
        console.log(`🔄 Trying with model: ${modelName}`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: this.generationConfig
            })
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Successfully used model: ${modelName}`);
          
          // Check if response was truncated
          if (data.candidates?.[0]?.finishReason === "MAX_TOKENS") {
            console.warn(`⚠️ Response truncated due to token limit for ${modelName}`);
          }
          
          // Extract response text
          const responseText = this.extractResponseText(data);
          
          // Validate response
          if (!responseText) {
            console.error('❌ Unexpected response structure:', data);
            lastError = new Error(`Unexpected API response structure from ${modelName}`);
            continue;
          }
          
          console.log('📝 Response text length:', responseText.length);
          
          // If response is too short, try next model
          if (responseText.length < 500) {
            console.warn(`⚠️ Response too short (${responseText.length} chars). Trying next model...`);
            lastError = new Error(`Response too short for ${modelName}`);
            continue;
          }
          
          return {
            response: {
              text: () => responseText
            }
          };
        } else {
          const errorText = await response.text();
          lastError = new Error(`API Error with ${modelName}: ${response.status} - ${errorText}`);
          console.warn(`❌ Model ${modelName} failed:`, lastError.message);
          continue;
        }
      } catch (modelError) {
        lastError = modelError;
        console.warn(`❌ Model ${modelName} failed:`, modelError.message);
        continue;
      }
    }
    
    // If we get here, all models failed
    throw lastError || new Error('All Gemini models failed');
  }

  /**
   * Extract response text from API response with multiple fallback strategies
   */
  extractResponseText(data) {
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else if (typeof data.candidates?.[0]?.content === 'string') {
      return data.candidates[0].content;
    } else if (data.text) {
      return data.text;
    } else if (data.response) {
      return data.response;
    }
    return null;
  }

  /**
   * Clean and parse JSON response from AI
   */
  cleanAndParseJSON(responseText) {
    // Clean the response text
    let cleanText = responseText.trim();
    
    // Remove markdown code blocks
    cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleanText = cleanText.trim();
    
    // Extract JSON object
    const jsonStart = cleanText.indexOf('{');
    if (jsonStart !== -1) {
      let jsonCandidate = cleanText.substring(jsonStart);
      
      // Find matching closing brace
      let braceCount = 0;
      let jsonEnd = -1;
      
      for (let i = 0; i < jsonCandidate.length; i++) {
        if (jsonCandidate[i] === '{') {
          braceCount++;
        } else if (jsonCandidate[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
      }
      
      if (jsonEnd !== -1) {
        cleanText = jsonCandidate.substring(0, jsonEnd + 1);
      } else {
        cleanText = jsonCandidate;
      }
    }
    
    console.log('🧹 Cleaned JSON length:', cleanText.length);
    
    // Validate and fix truncated JSON if needed
    if (!cleanText.startsWith('{')) {
      throw new Error('Invalid JSON format');
    }
    
    if (!cleanText.endsWith('}')) {
      console.warn('⚠️ JSON truncated, attempting to fix...');
      cleanText = this.fixTruncatedJSON(cleanText);
    }
    
    // Parse and return
    try {
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError.message);
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }
  }

  /**
   * Fix truncated JSON by closing unclosed structures
   */
  fixTruncatedJSON(text) {
    let fixedText = text;
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < fixedText.length; i++) {
      const char = fixedText[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
        else if (char === '[') bracketCount++;
        else if (char === ']') bracketCount--;
      }
    }
    
    // Close unclosed structures
    if (inString) fixedText += '"';
    for (let i = 0; i < bracketCount; i++) fixedText += ']';
    for (let i = 0; i < braceCount; i++) fixedText += '}';
    
    return fixedText;
  }

  /**
   * Handle generation errors and return user-friendly messages
   */
  getErrorMessage(error) {
    if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('quota')) {
      return 'API quota exceeded. Please try again later.';
    } else if (error.message.includes('API_KEY') || error.message.includes('API key')) {
      return 'Invalid API key. Please check configuration.';
    } else if (error.message.includes('not found')) {
      return 'AI model temporarily unavailable. Please try again.';
    } else if (error.name === 'SyntaxError' || error.message.includes('JSON')) {
      return 'Received invalid response from AI. Please try again.';
    } else {
      return 'Failed to generate content. Please check your internet connection and try again.';
    }
  }
}

// Export singleton instance
export default new GeminiService();
