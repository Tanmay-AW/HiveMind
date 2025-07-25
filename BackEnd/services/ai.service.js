const { GoogleGenerativeAI } = require("@google/generative-ai");

let model = null;
const isAIEnabled = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '';

if (isAIEnabled) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        console.log('[AI Service] Google Gemini initialized successfully');
    } catch (error) {
        console.error('[AI Service] Failed to initialize Google Gemini:', error.message);
    }
} else {
    console.log('[AI Service] Google Gemini API key not found. AI features disabled.');
}

const callGemini = async (prompt) => {
    if (!isAIEnabled || !model) {
        return { success: false, error: 'AI features are disabled. Please configure GEMINI_API_KEY.' };
    }
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        if (response.promptFeedback?.blockReason) {
            return { success: false, error: `Request was blocked: ${response.promptFeedback.blockReason}` };
        }
        const text = response.text();
        return { success: true, text: text.trim().replace(/```/g, '') };
    } catch (error) {
        console.error('Google Gemini API Error:', error);
        return { success: false, error: error.message };
    }
};

class AIService {
    static async generateBoilerplate(description, language = 'javascript') {
        const prompt = `Generate ${language} boilerplate code for: "${description}". Provide only raw code, no explanations or markdown.`;
        const result = await callGemini(prompt);
        return result.success ? { success: true, code: result.text } : result;
    }

    static async explainCode(code, language = 'javascript') {
        const prompt = `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
        const result = await callGemini(prompt);
        return result.success ? { success: true, explanation: result.text } : result;
    }

    static async getCodeCompletion(code, language = 'javascript') {
        const prompt = `Complete the following ${language} code. Provide only the code that comes next.\n\n${code}`;
        const result = await callGemini(prompt);
        return result.success ? { success: true, completion: result.text } : result;
    }

    static async debugCode(code, error, language = 'javascript') {
        const prompt = `Debug this ${language} code which produced an error.\n\nError:\n${error}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nExplain the bug and provide the corrected code.`;
        const result = await callGemini(prompt);
        return result.success ? { success: true, debug_info: result.text } : result;
    }
}

module.exports = AIService;
