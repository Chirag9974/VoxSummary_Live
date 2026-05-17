const mongoose = require("mongoose");

const LiveSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true
        },
        title: {
            type: String,
            default: "live-meeting"
        },
        transcription: {
            type: String,
            default: ""
        },
        summary: {
            title: String,
            keyPoints: [String],
            actionItems: [
                {
                    task: String,
                    deadline: String
                }
            ]
        },
        audioPath: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("LiveSession", LiveSessionSchema);