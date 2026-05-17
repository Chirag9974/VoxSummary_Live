# VoxSummary Live Extension

This Chrome extension records live meeting audio and streams it to the VoxSummary backend for real-time transcription and summaries.

## Setup

1. Ensure the backend is running at `http://localhost:3000` and Ollama is running.
2. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `Extension` folder
3. Click the VoxSummary Live icon, enter a meeting title, and hit **Start**.

## Notes

- The extension uses the microphone, so Chrome will prompt you for permission.
- Each session is stored in `Server/uploads/live` and summarized into `Server/uploads/notes`.
