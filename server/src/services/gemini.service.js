import { genAI, MODEL_MAPPING } from "../config/gemini.js";

/**
 * Streams debug analysis from Gemini AI using Server-Sent Events (SSE)
 * @param {string} errorLog - The raw error log or follow-up message
 * @param {Object} res - Express response object
 * @param {Array} history - Optional conversation history
 * @param {string} selectedModel - The model name requested by the user
 */
export const streamDebugAnalysis = async (
  errorLog,
  res,
  history = [],
  selectedModel = "Gemini 2.5 Flash",
) => {
  const isFollowUp = history.length > 0;

  // Resolve the actual model ID from mapping
  const modelId =
    MODEL_MAPPING[selectedModel] || MODEL_MAPPING["Gemini 2.5 Flash"];
  const model = genAI.getGenerativeModel({ model: modelId });

  let prompt = "";
  // ... rest of the logic ...
  if (!isFollowUp) {
    prompt = `
      You are BugSense, a Senior Socratic Engineering Lead and Deep-Tech Mentor. 
      Your mission is to guide developers through their coding journey.
      
      CRITICAL INSTRUCTIONS:
      1. Analyze the user's input:
         - IF it's a **Technical Error, Stack Trace, or Log**: Use the "Diagnostic Mode" (detailed below).
         - IF it's a **General Question, Architecture Discussion, or Greeting**: Use the "Mentor Mode" (conversational, expert, pivot to logic/concepts).
      
      [MODE: Diagnostic Mode]
      Use this structure strictly:
      # 🔍 The Breakdown
      [Explain what happened in high-level English.]
      # 🧠 The Mental Model
      [Explain the core concept behind the error (e.g., Closure, Event Loop, Race condition).]
      # 🧬 Probable Causality
      [List 2-3 logical directions to explore based on the code.]
      # 🧪 Diagnostic Checklist
      - [ ] [Diagnostic Step]

      [MODE: Mentor Mode]
      - Be conversational, professional, and pithy.
      - Use **bolding** for technical terms.
      - Act as a mentor, offering deep insights without requiring the diagnostic headers.
      
      [COMMON RULES]
      - Maintain a calm, encouraging, and highly technical tone.
      - DO NOT provide the final code solution yet.
      - Keep paragraphs short (2-3 sentences).
      - Always include the metadata block at the very end.
      
      User Input:
      """
      ${errorLog}
      """
      
      __JSON_META__
      {
        "category": "High-level tech category (e.g., Greeting, Architecture, Logic Error)",
        "techStack": ["Relevant", "Tech"]
      }
      __JSON_META__
    `;
  } else {
    const historyContext = history
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
    prompt = `
      You are BugSense, continuing the diagnostic thread.
      
      CONTEXT HISTORY:
      ${historyContext}
      
      NEW INPUT FROM USER:
      "${errorLog}"
      
      INSTRUCTIONS:
      - Be pithy and direct. 
      - Use **bolding** for key terms.
      - If the user is on the right track, give them a subtle "nudge" in that direction.
      - Only provide code snippets if they demonstrate a diagnostic technique (like a specific console.log or a debugger placement).
    `;
  }

  let fullText = "";
  try {
    const result = await model.generateContentStream(prompt);

    try {
      for await (const chunk of result.stream) {
        if (!chunk) continue;
        const chunkText = chunk.text();
        if (chunkText) {
          fullText += chunkText;
          res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
        }
      }
    } catch (streamError) {
      console.error("Internal Stream Error:", streamError);
      res.write(`data: ${JSON.stringify({ error: "AI_STREAM_INTERRUPTED", message: "The AI stream was interrupted." })}\n\n`);
      // We don't re-throw here to allow the function to return whatever it gathered so far
    }

    let metadata = {};
    if (!isFollowUp) {
      const jsonMatch = fullText.match(
        /__JSON_META__\s*([\s\S]*?)\s*__JSON_META__/,
      );
      if (jsonMatch) {
        try {
          metadata = JSON.parse(jsonMatch[1]);
        } catch (e) {}
      }
    }

    return { fullText, metadata };
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    res.write(
      `data: ${JSON.stringify({ error: "AI_STREAM_ERROR", message: error.message })}\n\n`,
    );
    throw error;
  }
};
