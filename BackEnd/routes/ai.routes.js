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

module.exports = router;
