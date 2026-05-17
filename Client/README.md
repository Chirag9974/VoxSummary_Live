# VoxSummary Frontend

Modern React + Tailwind frontend for the VoxSummary pipeline. It connects to the Express backend, uploads audio, and renders the transcription, AI summary, and action items.

## Features

- Audio upload workflow with progress state
- Qwen 2.5 summary + Whisper transcription display
- Structured UI split into reusable components

## Getting started

Install dependencies and start the Vite dev server:

```bash
npm install
npm run dev
```

## Environment variables

Create a `.env` file in the `Client` folder if you need a different backend URL:

```
VITE_API_BASE_URL=http://localhost:3000
```

## Build

```bash
npm run build
```
