const VoiceNote = require("../models/VoiceNote");
const LiveSession = require("../models/LiveSession");
const transcribeWithPython = require("../services/whisper_service");
const summarizeText = require("../services/summarize");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const NOTES_DIR = path.join(__dirname, "..", "uploads", "notes");
const LIVE_DIR = path.join(__dirname, "..", "uploads", "live");
const LIVE_CHUNK_DIR = path.join(LIVE_DIR, "chunks");
const liveSessions = new Map();

const ensureNotesDir = async () => {
    await fs.mkdir(NOTES_DIR, { recursive: true });
};

const ensureLiveDirs = async () => {
    await fs.mkdir(LIVE_DIR, { recursive: true });
    await fs.mkdir(LIVE_CHUNK_DIR, { recursive: true });
};

const sanitizeBaseName = (name) => {
    const cleaned = name.replace(/[^a-z0-9-_]+/gi, "_").replace(/^_+|_+$/g, "");
    return cleaned || "voice-note";
};

const resolveUniqueBase = async (base) => {
    let candidate = base;
    let counter = 1;

    while (true) {
        try {
            await fs.access(path.join(NOTES_DIR, `${candidate}.txt`));
            candidate = `${base}-${counter}`;
            counter += 1;
        } catch (error) {
            return candidate;
        }
    }
};

const buildSummaryText = (summary) => {
    return [
        `Title: ${summary?.title || "Untitled"}`,
        "",
        "Key Points:",
        ...(summary?.keyPoints?.length
            ? summary.keyPoints.map((point, index) => `${index + 1}. ${point}`)
            : ["- None"]),
        "",
        "Action Items:",
        ...(summary?.actionItems?.length
            ? summary.actionItems.map((item, index) => {
                const deadline = item.deadline ? ` (Deadline: ${item.deadline})` : "";
                return `${index + 1}. ${item.task}${deadline}`;
            })
            : ["- None"])
    ].join("\n");
};

const writeSummaryFiles = async (baseName, transcription, summary) => {
    await ensureNotesDir();
    const uniqueBase = await resolveUniqueBase(baseName);
    const transcriptFile = path.join("uploads", "notes", `${uniqueBase}.txt`);
    const summaryFile = path.join("uploads", "notes", `${uniqueBase}.summary.txt`);

    const summaryLines = buildSummaryText(summary);

    await fs.writeFile(path.join(__dirname, "..", transcriptFile), transcription, "utf8");
    await fs.writeFile(
        path.join(__dirname, "..", summaryFile),
        summaryLines,
        "utf8"
    );

    return { transcriptFile, summaryFile, uniqueBase };
};

const loadSessionFromDb = async (sessionId) => {
    const stored = await LiveSession.findOne({ sessionId });
    if (!stored) {
        return null;
    }

    const session = {
        id: stored.sessionId,
        title: stored.title,
        audioPath: stored.audioPath || path.join("uploads", "live", stored.sessionId, "stream.webm"),
        transcription: stored.transcription || "",
        summary: stored.summary || null,
        createdAt: stored.createdAt?.toISOString?.() || new Date().toISOString()
    };

    liveSessions.set(sessionId, session);
    return session;
};

exports.uploadVoice = async (req,res)=>{
    try {
        if(!req.file){
            return res.status(400).json({message : "No audio file uploaded"});
        }
        const audioPath = req.file.path;
        const originalName = req.file.originalname;
        
        const transcription = await transcribeWithPython(audioPath);

        const summary = await summarizeText(transcription);

        const baseName = sanitizeBaseName(path.parse(originalName).name);
        const { transcriptFile, summaryFile } = await writeSummaryFiles(
            baseName,
            transcription,
            summary
        );
        
        const voiceNote =await VoiceNote.create({
            originalName,
            audioPath,
            transcription,
            summary,
            transcriptFile,
            summaryFile
        });
        
        res.status(201).json({
            message: "Audio transcribed successfully",
            data : voiceNote
        });

    } catch (error) {
        console.error("Upload voice failed:", error);
        res.status(500).json({ error: error.message });
    }
}

exports.listVoiceNotes = async (req, res) => {
    try {
        const notes = await VoiceNote.find()
            .sort({ createdAt: -1 })
            .select("_id originalName audioPath transcriptFile summaryFile summary createdAt");

        res.json({ data: notes });
    } catch (error) {
        console.error("List voice notes failed:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.startLiveSession = async (req, res) => {
    try {
        const title = req.body?.title || "live-meeting";
        const sessionId = crypto.randomUUID();

        await ensureLiveDirs();
        const sessionDir = path.join(LIVE_DIR, sessionId);
        await fs.mkdir(sessionDir, { recursive: true });

        const audioPath = path.join("uploads", "live", sessionId, "stream.webm");

        const session = {
            id: sessionId,
            title,
            audioPath,
            transcription: "",
            summary: null,
            createdAt: new Date().toISOString()
        };

        liveSessions.set(sessionId, session);
        await LiveSession.create({
            sessionId,
            title,
            transcription: "",
            summary: null,
            audioPath
        });

        res.json({ data: { sessionId, title } });
    } catch (error) {
        console.error("Start live session failed:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.appendLiveChunk = async (req, res) => {
    try {
        const sessionId = req.body?.sessionId;
        let session = liveSessions.get(sessionId);

        if (!session && sessionId) {
            session = await loadSessionFromDb(sessionId);
        }

        if (!session) {
            return res.status(404).json({ message: "Live session not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No audio chunk uploaded" });
        }

        await ensureLiveDirs();
        const chunkName = `chunk-${Date.now()}-${Math.round(Math.random() * 1e6)}.webm`;
        const chunkPath = path.join(LIVE_CHUNK_DIR, chunkName);

        await fs.writeFile(chunkPath, req.file.buffer);
        await fs.appendFile(path.join(__dirname, "..", session.audioPath), req.file.buffer);

        await fs.unlink(chunkPath).catch(() => null);

        if (!session.transcription) {
            session.summary = session.summary || {
                title: "Live session in progress",
                keyPoints: [],
                actionItems: []
            };
        }

        await LiveSession.findOneAndUpdate(
            { sessionId },
            {
                sessionId,
                title: session.title,
                transcription: session.transcription,
                summary: session.summary,
                audioPath: session.audioPath
            },
            { upsert: true, new: true }
        );

        res.json({
            data: {
                sessionId,
                transcription: session.transcription,
                summary: session.summary
            }
        });
    } catch (error) {
        console.error("Append live chunk failed:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.stopLiveSession = async (req, res) => {
    try {
        const sessionId = req.body?.sessionId;
        let session = liveSessions.get(sessionId);

        if (!session && sessionId) {
            session = await loadSessionFromDb(sessionId);
        }

        if (!session) {
            return res.status(404).json({ message: "Live session not found" });
        }

        const baseName = sanitizeBaseName(session.title || sessionId);
        let finalTranscription = session.transcription;
        if (!finalTranscription) {
            const absoluteAudioPath = path.join(__dirname, "..", session.audioPath);
            finalTranscription = await transcribeWithPython(absoluteAudioPath);
        }

    const finalSummary = await summarizeText(finalTranscription);
        const { transcriptFile, summaryFile } = await writeSummaryFiles(
            baseName,
            finalTranscription,
            finalSummary
        );

        const voiceNote = await VoiceNote.create({
            originalName: session.title,
            audioPath: session.audioPath,
            transcription: finalTranscription,
            summary: finalSummary,
            transcriptFile,
            summaryFile
        });

        await LiveSession.deleteOne({ sessionId });

        liveSessions.delete(sessionId);

        res.json({ data: voiceNote });
    } catch (error) {
        console.error("Stop live session failed:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.downloadVoiceNoteFile = async (req, res) => {
    try {
        const note = await VoiceNote.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        const type = req.query.type;
        const requestedFilename = req.query.filename;
        let filePath = null;
        let filename = null;

        if (type === "transcript") {
            filePath = note.transcriptFile;
            filename = `${note.originalName || note._id}.txt`;
        } else if (type === "summary") {
            const safeBase = sanitizeBaseName(note.originalName || note._id.toString());
            const preferredPath = note.summaryFile && note.summaryFile.endsWith(".summary.txt")
                ? note.summaryFile
                : path.join("uploads", "notes", `${safeBase}.summary.txt`);
            const absolutePreferred = path.join(__dirname, "..", preferredPath);

            try {
                await fs.access(absolutePreferred);
            } catch (error) {
                await ensureNotesDir();
                await fs.writeFile(absolutePreferred, buildSummaryText(note.summary), "utf8");
                note.summaryFile = preferredPath;
                await note.save();
            }

            filePath = preferredPath;
            filename = `${note.originalName || note._id}.summary.txt`;
        }

        if (requestedFilename) {
            const safeName = requestedFilename.replace(/[^a-z0-9_.-]+/gi, "_");
            if (safeName) {
                filename = safeName;
            }
        }

        if (!filePath) {
            return res.status(400).json({ message: "Invalid file type" });
        }

        const resolved = path.join(__dirname, "..", filePath);
        await fs.access(resolved);

        res.download(resolved, filename);
    } catch (error) {
        console.error("Download voice note file failed:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getVoiceNoteContent = async (req, res) => {
    try {
        const note = await VoiceNote.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        const transcriptPath = path.join(__dirname, "..", note.transcriptFile || "");
        const summaryPath = path.join(__dirname, "..", note.summaryFile || "");

        const [transcription, summaryRaw] = await Promise.all([
            fs.readFile(transcriptPath, "utf8"),
            fs.readFile(summaryPath, "utf8")
        ]);

        let summary = note.summary;
        try {
            summary = JSON.parse(summaryRaw);
        } catch (parseError) {
            summary = note.summary;
        }

        res.json({
            data: {
                ...note.toObject(),
                transcription,
                summary
            }
        });
    } catch (error) {
        console.error("Get voice note content failed:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVoiceNote = async (req, res) => {
    try {
        const note = await VoiceNote.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        const transcriptPath = note.transcriptFile
            ? path.join(__dirname, "..", note.transcriptFile)
            : null;
        const summaryPath = note.summaryFile
            ? path.join(__dirname, "..", note.summaryFile)
            : null;

        await VoiceNote.deleteOne({ _id: note._id });

        const fileDeletes = [];
        if (transcriptPath) {
            fileDeletes.push(fs.unlink(transcriptPath).catch(() => null));
        }
        if (summaryPath) {
            fileDeletes.push(fs.unlink(summaryPath).catch(() => null));
        }
        if (fileDeletes.length) {
            await Promise.all(fileDeletes);
        }

        res.json({ message: "Note deleted" });
    } catch (error) {
        console.error("Delete voice note failed:", error);
        res.status(500).json({ error: error.message });
    }
};
