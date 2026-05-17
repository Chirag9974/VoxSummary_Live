const mongoose = require("mongoose");

const VoiceNoteSchema = new mongoose.Schema({
    originalName: {
        type: String
    },
    audioPath: {
        type: String,
        required: true
    },

    transcriptFile: {
        type: String
    },

    summaryFile: {
        type: String
    },

    transcription: {
        type: String
    },

    summary: {
        title: String,
        keyPoints: [String],
        actionItems: [{
            task: String,
            deadline: String
        }]
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("VoiceNote",VoiceNoteSchema)