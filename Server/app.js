require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db")
const mongoose = require("mongoose");
const voiceRoutes = require("./routes/voice_routes");
const cors = require("cors");

connectDB();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use("/api/voice", voiceRoutes);

app.get('/',function(req,res){
    res.send("VoxSummary backend is running");
})

app.get("/health", (req, res) => {
    const state = mongoose.connection.readyState;
    const stateMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    };

    res.status(state === 1 ? 200 : 503).json({
        status: "ok",
        db: {
            state: stateMap[state] || "unknown"
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
