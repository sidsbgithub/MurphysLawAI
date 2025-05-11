# Murphy's Law of AI - Backend

This directory contains the Node.js backend server for the "Murphy's Law of AI" application. Its primary responsibilities are:

1.  Securely managing the Google Gemini API key.
2.  Providing API endpoints for the frontend to:
    *   Analyze a single AI idea.
    *   Compare two AI ideas.
    *   Get detailed explanations and mitigations for specific flaws.
3.  Serving the static frontend files (`index.html`, `style.css`, `script.js`).

## Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **API Communication:** Google Gemini API (via `@google/generative-ai` SDK)
*   **Environment Variables:** `dotenv` package

## Setup

1.  **Prerequisites:**
    *   Ensure [Node.js](https://nodejs.org/) and npm are installed globally.
    *   You must have a `GEMINI_API_KEY` from Google AI Studio.

2.  **Install Dependencies:**
    From within this `backend` directory, run:
    ```bash
    npm install
    ```
    This will install `express`, `dotenv`, `@google/generative-ai`, and `cors`.

3.  **Environment Variables:**
    *   Create a file named `.env` in this `backend` directory.
    *   Add your Gemini API key to the `.env` file:
        ```env
        GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
        ```
    *   **Important:** The `.env` file is (and should be) listed in the root `.gitignore` file and will not be committed to version control.

## Running the Backend Server

1.  From within this `backend` directory, run:
    ```bash
    node server.js
    ```
2.  The server will typically start on `http://localhost:3000`.
3.  Console logs will indicate if the server started successfully and on which port it's listening.
4.  The server also serves the frontend files from the parent directory, so accessing `http://localhost:3000` in a browser should load the application.

## API Endpoints

*   **`GET /api-status`**: Checks if the backend is running.
*   **`POST /api/analyze`**:
    *   **Body (JSON):** `{ "idea": "Your AI idea text", "funMeter": "50" }`
    *   **Returns:** `{ "analysis": "Formatted analysis text from Gemini" }` or an error object.
*   **`POST /api/compare`**:
    *   **Body (JSON):** `{ "idea1": "Text for idea 1", "idea2": "Text for idea 2", "funMeter": "50" }`
    *   **Returns:** `{ "comparison": "Formatted comparison text from Gemini" }` or an error object.
*   **`POST /api/flaw-detail`**:
    *   **Body (JSON):** `{ "ideaSummary": "Original idea text", "flawTitle": "Title of the flaw", "flawDescription": "(Optional) Description of the flaw", "funMeter": "50" }`
    *   **Returns:** `{ "flawDetails": "Detailed explanation and mitigations from Gemini" }` or an error object.

## Prompts
The prompts sent to the Gemini API are constructed within `server.js` for each endpoint to guide the AI in generating structured and relevant responses.