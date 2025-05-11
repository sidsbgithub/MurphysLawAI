# Murphy's Law of AI - Web App

Welcome to **Murphy's Law of AI**! This web application takes your brilliant (or not-so-brilliant) AI ideas and, with the help of Google's Gemini API, points out potential flaws, pitfalls, and even some surprising strengths. Think of it as a constructive pre-mortem for your AI concepts.

## ✨ Live Demo ✨

**You can try out the live application here:**
[**https://murphyslawai.onrender.com/**](https://murphyslawai.onrender.com/)

## 📄 Source Code

The source code for this project is available on GitHub:
[**https://github.com/sidsbgithub/MurphysLawAI**](https://github.com/sidsbgithub/MurphysLawAI)

## Features

*   **Single Idea Analysis:** Submit an AI idea and get a detailed breakdown including:
    *   Idea Exploration
    *   Potential Pros
    *   Objective Flaws (with severity)
    *   Targeted Mitigation Strategies for specific flaws (Interactive!)
    *   Overall Rating
*   **Compare Ideas:** Input two AI ideas and receive a comparative analysis.
*   **Fun Meter:** Adjust the AI's personality from strictly objective to wildly creative for the analysis.
*   **Analysis History:** Save your analyses locally in your browser and revisit them.
*   **Share & Export:** Copy analysis summaries to your clipboard or export them as text files.
*   **Modern UI:** A sleek, futuristic dark theme with animations.

## Tech Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript
*   **Backend:** Node.js, Express.js
*   **AI Integration:** Google Gemini API (via `@google/generative-ai` SDK)
*   **Styling:** Custom CSS with CSS Variables for theming.
*   **Deployment:** Render.com (Static Site for Frontend, Web Service for Backend)
*   **Version Control:** Git & GitHub

## Project Structure

murphys-law-ai/
├── .gitignore # Specifies intentionally untracked files that Git should ignore
├── backend/ # Node.js backend server and API logic
│ ├── .env # Environment variables (GEMINI_API_KEY - NOT COMMITTED)
│ ├── node_modules/ # Backend dependencies (NOT COMMITTED)
│ ├── package.json # Lists backend dependencies and scripts
│ ├── package-lock.json # Exact versions of backend dependencies
│ ├── README.md # Backend-specific setup and information
│ └── server.js # Main backend server file
├── index.html # Main HTML file for the frontend
├── README.md # This file - Overall project information
├── script.js # Frontend JavaScript for UI, API calls, and logic
└── style.css # CSS styles for the frontend


## Accessing the Application

The application is deployed and accessible live at:
[**https://murphyslawai.onrender.com/**](https://murphyslawai.onrender.com/)

For local development or to run your own instance, follow the setup instructions below.

## Setup and Running Locally (for Development)

### Prerequisites

*   [Node.js](https://nodejs.org/) (which includes npm) installed on your system.
*   A Google Gemini API Key.
*   [Git](https://git-scm.com/) for version control (optional for just running, but recommended).

### Instructions

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/sidsbgithub/MurphysLawAI.git
    cd MurphysLawAI
    ```
2.  **Backend Setup:**
    *   Navigate to the `backend` directory:
        ```bash
        cd backend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Create a `.env` file in the `backend` directory and add your Gemini API key:
        ```
        GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
        ```
    *   Start the backend server:
        ```bash
        node server.js
        ```
        The backend should now be running, typically on `http://localhost:3000`.

3.  **Frontend Access (for Local Development):**
    *   Once the backend server is running (it also serves the frontend files from the root project directory):
    *   Open your web browser and navigate to:
        ```
        http://localhost:3000
        ```
    *   *(Note: The `script.js` in the repository is configured for the deployed backend. For local development against your local backend, you would temporarily change the `fetch` URLs in `script.js` back to `http://localhost:3000/api/...`)*

## How to Use

1.  **Analyze Single Idea:**
    *   Go to the "Analyze Single Idea" tab.
    *   Describe your AI idea in the textarea.
    *   Adjust the "AI Personality" fun meter if desired.
    *   Click "Analyze Idea!".
    *   View the results in the accordion sections. Click on flaw items for more details and mitigations.
    *   Use the "Save to History", "Share Analysis", or "Export Report" buttons as needed.
2.  **Compare Ideas:**
    *   Go to the "Compare Ideas" tab.
    *   Enter two different AI ideas.
    *   Adjust the fun meter.
    *   Click "Compare Ideas!".
    *   View the comparative analysis.
3.  **View History:**
    *   Go to the "View History" tab to see previously saved analyses.
    *   Click on a history item to reload its details in the "Single Idea" analysis view.
    *   Use "Clear All History" to remove all saved items.

## Future Scope (Ideas for Improvement)

*   Perfecting the smooth scroll animation when flaw details expand/collapse within the main accordion.
*   User accounts for cloud-saved history and personalized experiences.
*   More advanced export options (e.g., formatted Markdown, PDF).
*   Allowing users to edit and re-analyze ideas from history.
*   Implementing a visual Risk Matrix for flaws.

---

Built by Siddhant Singh Bisht
([sidsbgithub on GitHub](https://github.com/sidsbgithub))