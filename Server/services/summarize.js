const { generateWithOllama } = require("../config/ollama");

const extractKeyPoints = (text) => {
    const sentences = text
        .split(/[.?!]/)
        .map(s => s.trim())
        .filter(Boolean);

    return sentences.slice(0, 5);
};

const extractActionItems = (text) => {
    const actionVerbs = [
        "finish",
        "complete",
        "test",
        "build",
        "implement",
        "deploy",
        "fix",
        "review",
        "discuss"
    ];

    const sentences = text
        .split(/[.?!]/)
        .map(s => s.trim())
        .filter(Boolean);

    const actions = [];

    sentences.forEach(sentence => {
        const lower = sentence.toLowerCase();
        actionVerbs.forEach(verb => {
            if (lower.includes(verb)) {
                actions.push({
                    task: sentence,
                    deadline: null
                });
            }
        });
    });

    return actions;
};

const buildHeuristicSummary = (text) => {
    return {
        title: text.split(" ").slice(0, 6).join(" "),
        keyPoints: extractKeyPoints(text),
        actionItems: extractActionItems(text)
    };
};

const buildAiSummaryPrompt = (text) => {
    return [
        "You are a helpful assistant that summarizes transcribed voice notes.",
        "Return a valid JSON object with this shape:",
        "{\"title\": string, \"keyPoints\": string[], \"actionItems\": [{\"task\": string, \"deadline\": string|null}] }",
        "Rules:",
        "- Keep the title under 8 words.",
        "- Provide 3-6 key points.",
        "- Action items should be concrete tasks if any exist.",
        "- If no action items exist, return an empty array.",
        "Now summarize this transcription:",
        text
    ].join("\n");
};

const parseAiSummary = (raw, fallbackText) => {
    try {
        const jsonStart = raw.indexOf("{");
        const jsonEnd = raw.lastIndexOf("}");
        if (jsonStart === -1 || jsonEnd === -1) {
            return buildHeuristicSummary(fallbackText);
        }
        const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
        return {
            title: parsed.title || fallbackText.split(" ").slice(0, 6).join(" "),
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : extractKeyPoints(fallbackText),
            actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : []
        };
    } catch (error) {
        return buildHeuristicSummary(fallbackText);
    }
};

const summarizeText = async (text) => {
    if (process.env.SUMMARIZE_MODE === "heuristic") {
        return buildHeuristicSummary(text);
    }

    const prompt = buildAiSummaryPrompt(text);
    try {
        const response = await generateWithOllama(prompt);
        return parseAiSummary(response, text);
    } catch (error) {
        return buildHeuristicSummary(text);
    }
};

module.exports = summarizeText;
module.exports.buildHeuristicSummary = buildHeuristicSummary;