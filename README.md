
## Setup and Running Locally

### Prerequisites

*   [Node.js](https://nodejs.org/) (which includes npm) installed on your system.
*   A Google Gemini API Key.

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory and add your Gemini API key:
    ```
    GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
    ```
4.  Start the backend server:
    ```bash
    node server.js
    ```
    The backend should now be running, typically on `http://localhost:3000`.

### Frontend Access

1.  Once the backend server is running (it also serves the frontend files):
2.  Open your web browser and navigate to:
    ```
    http://localhost:3000
    ```
    (This should load `index.html` from the root project directory).

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

*   Perfecting the smooth scroll animation when flaw details expand/collapse.
*   User accounts for cloud-saved history and personalized experiences.
*   More advanced export options (e.g., formatted Markdown, PDF).
*   Directly plotting flaws on a visual Risk Matrix.
*   Allowing users to edit and re-analyze ideas from history.

---

Built by Siddhant Singh Bisht