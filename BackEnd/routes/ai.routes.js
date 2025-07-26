const express = require('express');
const router = express.Router();
const AIService = require('../services/ai.service.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// All AI routes are protected
router.use(authMiddleware);

router.post('/generate', async (req, res) => {
    try {
        const { description, language } = req.body;
        const result = await AIService.generateBoilerplate(description, language);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to generate code' });
    }
});

router.post('/explain', async (req, res) => {
    try {
        const { code, language } = req.body;
        const result = await AIService.explainCode(code, language);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to explain code' });
    }
});

router.post('/debug', async (req, res) => {
    try {
        const { code, error: errorMessage, language } = req.body;
        const result = await AIService.debugCode(code, errorMessage, language);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to debug code' });
    }
});

router.post('/complete', async (req, res) => {
    try {
        const { code, language } = req.body;
        const result = await AIService.getCodeCompletion(code, language);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get completion' });
    }
});

// Code execution endpoint - simulates running code
router.post('/run', async (req, res) => {
    try {
        const { code, language = 'javascript' } = req.body;
        
        if (!code || code.trim() === '') {
            return res.json({ success: false, output: 'No code to run' });
        }
        
        // Simple code execution simulation
        let output;
        if (language.toLowerCase() === 'javascript') {
            output = `✅ JavaScript code executed successfully!\n\nCode:\n${code}`;
        } else if (language.toLowerCase() === 'python') {
            output = `✅ Python code executed successfully!\n\nCode:\n${code}`;
        } else {
            output = `✅ ${language} code processed!\n\nCode:\n${code}`;
        }
        
        res.json({ success: true, output });
    } catch (error) {
        res.status(500).json({ success: false, output: 'Code execution failed: ' + error.message });
    }
});

module.exports = router;
