# VoxSummary Live

VoxSummary Live turns audio into structured summaries with Whisper transcription and Qwen‑powered insights. It includes:

- **Backend (Express + MongoDB)** for uploads, live sessions, and storage
- **Frontend (React + Tailwind)** to upload audio and browse history
- **Chrome Extension** for live meeting capture and downloads

## Project structure

```
Server/     # Express API, transcription, summaries, MongoDB
Client/     # React + Tailwind web app
Extension/  # Chrome extension for live capture
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB running locally
- Ollama running locally (optional; falls back to heuristic summary)

## Backend setup

```powershell
cd "Server"
npm install
```

Create a `Server/.env` file if needed:

```
PORT=3000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b-instruct-q4_K_M
SUMMARIZE_MODE=
```

Install Python dependencies:

```powershell
cd "Server"
pip install -r requirements.txt
```

Start the backend:

```powershell
node app.js
```

## Frontend setup

```powershell
cd "Client"
npm install
npm run dev
```

Optional frontend env file (`Client/.env`):

```
VITE_API_BASE_URL=http://localhost:3000
```

## Chrome extension setup

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the `Extension/` folder.
3. Click the extension icon to start live capture.

## Usage

- **Upload**: Use the web app or extension upload to process an audio file.
- **Live capture**: Start/Stop in the extension to create a live session.
- **Downloads**: Use the extension or web download page to get transcript/summary `.txt` files.

## Notes

- Transcription is forced to **English** for consistency.
- If Ollama is not running, summaries fall back to heuristic mode.

## License

MIT
