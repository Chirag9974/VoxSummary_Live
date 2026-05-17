const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = require("../config/multer");
const {
	uploadVoice,
	listVoiceNotes,
	getVoiceNoteContent,
	deleteVoiceNote,
	startLiveSession,
	appendLiveChunk,
	stopLiveSession,
	downloadVoiceNoteFile
} = require("../controllers/voice_controller");

const liveUpload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 15 * 1024 * 1024
	}
});

router.post("/", upload.single("audio"), uploadVoice);
router.get("/history", listVoiceNotes);
router.get("/notes/:id", getVoiceNoteContent);
router.delete("/notes/:id", deleteVoiceNote);
router.get("/notes/:id/download", downloadVoiceNoteFile);
router.post("/live/start", startLiveSession);
router.post("/live/chunk", liveUpload.single("audio"), appendLiveChunk);
router.post("/live/stop", stopLiveSession);

module.exports = router;