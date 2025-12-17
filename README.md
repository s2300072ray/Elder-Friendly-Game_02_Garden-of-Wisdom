
# Garden of Wisdom - Senior Friendly Serious Game

A gentle cognitive and motor skill training game designed for seniors, featuring soothing aesthetics and encouraging feedback.

## 🛡️ Security & API Key Safety (READ FIRST)

To run this application with AI features, you need a Google Gemini API Key. However, to keep your key safe and avoid unexpected costs:

### 1. Never Commit Your Key
*   **DO NOT** paste your API key directly into the code files.
*   **DO NOT** commit your `.env` file to GitHub (The provided `.gitignore` file prevents this).

### 2. How to Run Locally
1.  Create a file named `.env` in the root directory.
2.  Add your key: `API_KEY=your_google_api_key_here`
3.  The application handles the key injection.

### 3. Publishing to the Web (Production Safety)
Since this is a client-side application, your API key will be visible to browsers. To prevent theft:

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Find your API Key.
3.  Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**.
4.  Add the URL where you are hosting your game (e.g., `https://my-garden-game.vercel.app/*`).
5.  Under **"API restrictions"**, select **"Restrict key"** and only check **"Gemini API"**.

This ensures that even if someone steals your key, they cannot use it from their own computer.

## Features
*   **Pattern Petals**: Sequence memory training.
*   **Leaf Pairs**: Gentle memory card matching.
*   **Seed Sorting**: Fine motor skill drag-and-drop.
*   **Offline Mode**: The game works perfectly without an API key, using built-in encouragement messages.
