const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b-instruct-q4_K_M";

const generateWithOllama = async (prompt) => {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            stream: false
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.response?.trim() || "";
};

module.exports = {
    generateWithOllama,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL
};
