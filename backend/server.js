// backend/server.js

// Load environment variables from .env file (for GEMINI_API_KEY)
require('dotenv').config();

// Import necessary modules
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const path = require('path'); // For serving static files

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000; // Use environment port or default to 3000

// --- Middleware Setup ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for all routes
app.use(express.json()); // Enable parsing of JSON request bodies

// Serve static frontend files (index.html, style.css, script.js)
// Assumes these files are in the parent directory of this 'backend' folder
app.use(express.static(path.join(__dirname, '..')));


// --- Initialize Google Generative AI SDK ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set in the .env file. The application cannot start.");
    process.exit(1); // Exit if API key is crucial and missing
}
const genAI = new GoogleGenerativeAI(apiKey);
// Define the Gemini model to be used. 'gemini-1.5-flash-latest' is fast and capable.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// --- API Routes ---

/**
 * @route GET /api-status
 * @description Checks if the backend server is running.
 */
app.get('/api-status', (req, res) => {
    res.send("Murphy's Law AI Backend is running successfully!");
});

/**
 * @route POST /api/analyze
 * @description Analyzes a single AI idea for flaws, pros, mitigations, etc.
 * @param {string} req.body.idea - The AI idea text to analyze.
 * @param {string|number} req.body.funMeter - The 'fun meter' value to adjust AI's tone.
 * @returns {object} JSON object with 'analysis' text or 'error' message.
 */
app.post('/api/analyze', async (req, res) => {
    console.log("Received request to /api/analyze");
    try {
        const { idea, funMeter } = req.body;
        if (!idea) {
            return res.status(400).json({ error: "Idea text is required for analysis." });
        }

        // Construct the detailed prompt for Gemini AI
        let prompt = `You are an AI designed to find flaws in ideas, in the spirit of "Murphy's Law."
        Your task is to analyze the following AI idea: "${idea}"

        Please provide the analysis in the following structured Markdown format. Be very specific and detailed in each section:

        ## Idea Exploration:
        [Provide a concise **Main Title for the Exploration** followed by a hyphen ' - ' and then a detailed multi-sentence paragraph exploring the idea, its context, core value, and what it aims to achieve.]
        Example:
        **Understanding the Core Concept** - This AI idea centers around [explain core concept]. It aims to solve [problem] by [method/approach]. The primary value proposition lies in its potential to [key benefit or innovation] for [target audience/domain]... (continue with more details)

        ## Pros:
        [List 2-4 potential pros or strengths of this idea. Each pro MUST be a separate bullet point.
        Format each pro as: - **Pro Title** - Detailed explanation of this pro, elaborating on why it's a strength or its potential positive impact.]
        Example:
        - **Enhanced User Engagement** - By deeply personalizing content and interactions, the AI can make the user experience significantly more relevant and enjoyable, leading to users spending more time with the application and fostering loyalty.
        - **Novelty Factor** - The uniqueness of the approach could attract early adopters and generate significant buzz, providing a competitive edge in a crowded market.

        ## Objective Flaws (Murphy's Law in Action!):
        [List 3-5 objective flaws. Each distinct flaw MUST be a separate bullet point.
        For each flaw, provide:
        1. A short, bolded title for the flaw (e.g., **Creative Limitations**).
        2. Follow this title immediately with a hyphen ' - '.
        3. After the hyphen, provide a 1-2 sentence detailed description explaining the flaw.
        4. Finally, after the description, include its severity in parentheses, like (Severity: High).

        Example:
        - **Accuracy of Personalization** - The AI might struggle to truly understand individual nuances if the input data is too generic, leading to outputs that feel impersonal. (Severity: High)
        ]

        ## Mitigation Strategies:
        [Suggest 1-2 actionable mitigation strategies for some critical identified flaws. Each strategy MUST be a separate bullet point.
        Format each strategy as: - **Strategy Title** - Detailed explanation of how this strategy can help address a specific flaw or reduce its impact.]
        Example:
        - **Iterative Feedback Loop** - Implement a system for users to provide explicit and implicit feedback on the AI's outputs, allowing the model to continuously learn and refine its understanding of individual preferences.
        - **Hybrid Approach** - Combine rule-based systems for common scenarios with machine learning for more nuanced personalization, ensuring a baseline level of quality while still allowing for adaptive learning.

        ## Overall Rating (out of 10):
        [Provide an estimated overall rating (1-10) and a brief justification.]
        Rating: [Score]/10 - Justification.

        ---
        `;

        // Adjust the prompt's tone based on the funMeter value
        if (funMeter !== undefined) {
            const funLevel = parseInt(funMeter, 10);
            if (funLevel <= 20) {
                prompt += "\nMaintain a strictly objective, formal, and highly critical tone. Focus on worst-case scenarios.";
            } else if (funLevel >= 80) {
                prompt += "\nFeel free to be very creative, humorous, or even wildly sarcastic. Exaggerate potential problems.";
            } else {
                prompt += "\nMaintain a balanced, constructive, yet critical tone."
            }
        }

        console.log("Sending analysis prompt to Gemini (first 300 chars):", prompt.substring(0, 300) + "...");
        
        // Generate content using the Gemini model
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text(); // Extract the generated text

        console.log("Received analysis response from Gemini.");
        res.json({ analysis: text }); // Send the analysis back to the client

    } catch (error) {
        console.error("Error in /api/analyze route:", error.message); // Log the error message
        let statusCode = 500;
        let errorMessage = "Failed to analyze idea due to an unexpected server error.";
        // Specific error handling based on common Gemini API issues
        if (error.message) {
            if (error.message.includes('API key not valid')) {
                statusCode = 401;
                errorMessage = "Gemini API key not valid. Please check server configuration.";
            } else if (error.message.toLowerCase().includes('quota')) {
                statusCode = 429;
                errorMessage = "API quota exceeded. Please try again later.";
            } else if (error.message.toLowerCase().includes('candidate was blocked')) {
                statusCode = 400; // Or 503 Service Unavailable if it's a temporary safety block
                errorMessage = "The AI's response was blocked, possibly due to safety settings or a problematic prompt. Please try rephrasing your idea or adjusting the fun meter.";
            } else {
                // Keep the generic server error for other cases but include original message
                errorMessage = "Failed to analyze idea: " + error.message;
            }
        }
        res.status(statusCode).json({ error: errorMessage });
    }
});

/**
 * @route POST /api/compare
 * @description Compares two AI ideas.
 * @param {string} req.body.idea1 - The first AI idea text.
 * @param {string} req.body.idea2 - The second AI idea text.
 * @param {string|number} req.body.funMeter - The 'fun meter' value for tone.
 * @returns {object} JSON object with 'comparison' text or 'error' message.
 */
app.post('/api/compare', async (req, res) => {
    console.log("Received request to /api/compare");
    try {
        const { idea1, idea2, funMeter } = req.body;
        if (!idea1 || !idea2) {
            return res.status(400).json({ error: "Two ideas are required for comparison." });
        }

        // Construct the prompt for comparing two ideas
        let comparisonPrompt = `You are an AI designed to critically compare two AI ideas.
        Please compare the following two AI ideas:

        Idea 1: "${idea1}"
        
        Idea 2: "${idea2}"

        Provide a structured comparison using Markdown. Consider the following aspects for each idea where applicable, and then provide an overall comparative summary:
        
        ## Comparative Analysis:

        ### Idea 1: "${idea1.substring(0, 50)}${idea1.length > 50 ? '...' : ''}"
        *   **Potential Strengths:** [Briefly list key strengths of Idea 1. Use bullet points if multiple.]
        *   **Potential Weaknesses/Flaws:** [Briefly list key weaknesses or flaws of Idea 1. Use bullet points if multiple.]
        *   **Unique Selling Proposition (USP):** [What makes Idea 1 stand out, if anything?]
        *   **Viability/Feasibility Score (1-10):** [Score Idea 1 and briefly justify]

        ### Idea 2: "${idea2.substring(0, 50)}${idea2.length > 50 ? '...' : ''}"
        *   **Potential Strengths:** [Briefly list key strengths of Idea 2. Use bullet points if multiple.]
        *   **Potential Weaknesses/Flaws:** [Briefly list key weaknesses or flaws of Idea 2. Use bullet points if multiple.]
        *   **Unique Selling Proposition (USP):** [What makes Idea 2 stand out, if anything?]
        *   **Viability/Feasibility Score (1-10):** [Score Idea 2 and briefly justify]

        ### Head-to-Head Comparison:
        *   **Innovation:** [Which idea is more innovative and why?]
        *   **Potential Impact:** [Which idea has a greater potential impact and why?]
        *   **Ease of Implementation:** [Which idea seems easier to implement and why?]
        *   **Market Attractiveness (if applicable):** [Which idea might be more attractive to a market/users?]

        ### Overall Recommendation:
        [Based on the comparison, which idea seems more promising or has a better chance of success? Or are they equally viable in different ways? Provide a concluding thought.]

        ---
        `;

        // Adjust tone based on funMeter
        if (funMeter !== undefined) {
            const funLevel = parseInt(funMeter, 10);
            if (funLevel <= 20) {
                comparisonPrompt += "\nMaintain a strictly objective and analytical tone for the comparison.";
            } else if (funLevel >= 80) {
                comparisonPrompt += "\nFeel free to be more opinionated, and even a bit playful or provocative in your comparison, while still providing insights.";
            } else {
                comparisonPrompt += "\nProvide a balanced and insightful comparison."
            }
        }
        
        console.log("Sending comparison prompt to Gemini (first 300 chars):", comparisonPrompt.substring(0, 300) + "...");
        const result = await model.generateContent(comparisonPrompt);
        const response = result.response;
        const text = response.text();

        console.log("Received comparison response from Gemini.");
        res.json({ comparison: text });

    } catch (error) {
        console.error("Error in /api/compare route:", error.message);
        let statusCode = 500;
        let errorMessage = "Failed to compare ideas due to an unexpected server error.";
        if (error.message) { 
            if (error.message.includes('API key not valid')) { statusCode = 401; errorMessage = "Gemini API key not valid."; }
            else if (error.message.toLowerCase().includes('quota')) { statusCode = 429; errorMessage = "API quota exceeded."; }
            else if (error.message.toLowerCase().includes('candidate was blocked')) { statusCode = 400; errorMessage = "Response blocked due to safety settings. Try rephrasing."; }
            else { errorMessage = "Failed to compare ideas: " + error.message; }
        }
        res.status(statusCode).json({ error: errorMessage });
    }
});

/**
 * @route POST /api/flaw-detail
 * @description Gets detailed explanation and mitigations for a specific flaw.
 * @param {string} req.body.ideaSummary - The original AI idea summary.
 * @param {string} req.body.flawTitle - The title of the specific flaw.
 * @param {string} [req.body.flawDescription] - Optional description of the flaw for more context.
 * @param {string|number} req.body.funMeter - The 'fun meter' value for tone.
 * @returns {object} JSON object with 'flawDetails' text or 'error' message.
 */
app.post('/api/flaw-detail', async (req, res) => {
    console.log("Received request to /api/flaw-detail");
    try {
        const { ideaSummary, flawTitle, flawDescription, funMeter } = req.body; 
        if (!ideaSummary || !flawTitle) {
            return res.status(400).json({ error: "Original idea summary and flaw title are required." });
        }
        
        const fullFlawContext = flawDescription ? `${flawTitle} - ${flawDescription}` : flawTitle;

        let detailPrompt = `
        You are an AI assistant specializing in detailed risk analysis and mitigation.
        The user is analyzing the following AI idea: "${ideaSummary}"
        They have identified a specific flaw and want more details about it: "${fullFlawContext}"

        Please provide a detailed breakdown for this specific flaw using Markdown:

        ### In-Depth Flaw Explanation:
        [Elaborate on why "${fullFlawContext}" is a significant concern for the idea "${ideaSummary}". 
        What are the potential root causes or contributing factors? What are the specific negative consequences or impacts if this flaw materializes? 
        Provide 2-3 sentences of detailed explanation. Use clear paragraph structure.]

        ### Targeted Mitigation Strategies:
        [Suggest 2-3 specific, actionable, and detailed mitigation strategies to address ONLY the flaw: "${fullFlawContext}" in the context of the idea "${ideaSummary}". 
        Each strategy should be a separate bullet point. Explain HOW each strategy helps.
        Format each strategy as: - **Strategy Title:** Detailed explanation of how this strategy mitigates the specific flaw.]
        
        ---
        `;

        if (funMeter !== undefined) {
            const funLevel = parseInt(funMeter, 10);
            if (funLevel <= 30) { detailPrompt += "\nMaintain a very analytical and direct tone for these details."; }
            else if (funLevel >= 70) { detailPrompt += "\nBe particularly insightful and creative with the mitigation strategies."; }
        }

        console.log("Sending flaw detail prompt to Gemini (first 300 chars):", detailPrompt.substring(0, 300) + "...");
        const result = await model.generateContent(detailPrompt);
        const response = result.response;
        const text = response.text();

        console.log("Received flaw detail response from Gemini.");
        res.json({ flawDetails: text });

    } catch (error) {
        console.error("Error in /api/flaw-detail route:", error.message);
        let statusCode = 500;
        let errorMessage = "Failed to get flaw details due to an unexpected server error.";
        if (error.message) { 
            if (error.message.includes('API key not valid')) { statusCode = 401; errorMessage = "Gemini API key not valid."; }
            else if (error.message.toLowerCase().includes('quota')) { statusCode = 429; errorMessage = "API quota exceeded."; }
            else if (error.message.toLowerCase().includes('candidate was blocked')) { statusCode = 400; errorMessage = "Response blocked due to safety settings. Try rephrasing."; }
            else { errorMessage = "Failed to get flaw details: " + error.message; }
        }
        res.status(statusCode).json({ error: errorMessage });
    }
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log(`Frontend accessible at http://localhost:${port}/index.html (or just http://localhost:${port})`);
});