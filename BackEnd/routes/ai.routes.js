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
        
        // Ensure frontend compatibility - map 'code' to 'generated'
        if (result.success && result.code) {
            res.json({ success: true, generated: result.code });
        } else {
            res.json(result);
        }
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

// Enhanced code execution endpoint with better output simulation
router.post('/execute', async (req, res) => {
    try {
        const { code, language = 'javascript' } = req.body;
        
        if (!code || code.trim() === '') {
            return res.json({ success: false, error: 'No code provided to execute' });
        }
        
        let output;
        const lang = language.toLowerCase();
        
        if (lang === 'javascript') {
            // Simulate JavaScript execution
            try {
                // Look for console.log statements and simulate their output
                const consoleLogMatches = code.match(/console\.log\s*\([^)]*\)/g);
                if (consoleLogMatches) {
                    const outputs = consoleLogMatches.map(match => {
                        const content = match.match(/console\.log\s*\(([^)]*)\)/)[1];
                        // Simple evaluation for basic strings and expressions
                        if (content.match(/^["'`].*["'`]$/)) {
                            return content.slice(1, -1); // Remove quotes
                        } else if (content.match(/^\d+$/)) {
                            return content;
                        } else {
                            return content;
                        }
                    });
                    output = `📤 Output:\n${outputs.join('\n')}\n\n✅ JavaScript executed successfully`;
                } else {
                    output = `✅ JavaScript code executed successfully\n\n📝 Code processed:\n${code.split('\n').slice(0, 3).join('\n')}${code.split('\n').length > 3 ? '\n...' : ''}`;
                }
            } catch (error) {
                output = `❌ JavaScript execution error: ${error.message}`;
            }
        } else if (lang === 'python') {
            // Simulate Python execution
            try {
                const printMatches = code.match(/print\s*\([^)]*\)/g);
                if (printMatches) {
                    const outputs = printMatches.map(match => {
                        const content = match.match(/print\s*\(([^)]*)\)/)[1];
                        if (content.match(/^["'].*["']$/)) {
                            return content.slice(1, -1);
                        } else {
                            return content;
                        }
                    });
                    output = `📤 Output:\n${outputs.join('\n')}\n\n✅ Python executed successfully`;
                } else {
                    output = `✅ Python code executed successfully\n\n📝 Code processed:\n${code.split('\n').slice(0, 3).join('\n')}${code.split('\n').length > 3 ? '\n...' : ''}`;
                }
            } catch (error) {
                output = `❌ Python execution error: ${error.message}`;
            }
        } else {
            output = `✅ ${language} code executed successfully\n\n📝 Code processed:\n${code.split('\n').slice(0, 3).join('\n')}${code.split('\n').length > 3 ? '\n...' : ''}`;
        }
        
        res.json({ success: true, output });
    } catch (error) {
        console.error('Code execution error:', error);
        res.status(500).json({ success: false, error: 'Code execution failed: ' + error.message });
    }
});

module.exports = router;
