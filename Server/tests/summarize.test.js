const test = require("node:test");
const assert = require("node:assert/strict");

process.env.SUMMARIZE_MODE = "heuristic";
const summarizeText = require("../services/summarize");

test("summarizeText returns a title of first 6 words", async () => {
    const text = "This is a simple sentence to verify title generation.";
    const result = await summarizeText(text);

    assert.equal(result.title, "This is a simple sentence to");
});

test("summarizeText returns up to 5 key points", async () => {
    const text = "One. Two? Three! Four. Five. Six.";
    const result = await summarizeText(text);

    assert.ok(result.keyPoints.length <= 5);
    assert.equal(result.keyPoints.length, 5);
});

test("summarizeText extracts action items by verb", async () => {
    const text = "We should fix the bug. Later we will review the PR.";
    const result = await summarizeText(text);

    assert.equal(result.actionItems.length, 2);
    assert.ok(result.actionItems[0].task.includes("fix"));
    assert.ok(result.actionItems[1].task.includes("review"));
});
