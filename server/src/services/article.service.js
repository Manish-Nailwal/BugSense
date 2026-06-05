import { genAI, MODEL_MAPPING } from '../config/gemini.js';
import { stripMeta } from '../utils/text.js';
import { reserveInputTokens, estimateTokens } from '../utils/rateLimiter.js';

/**
 * Generates an SEO-optimized markdown article based on a resolved debug session
 * @param {string} rawError - The original error log
 * @param {string} aiAnalysis - The AI's diagnostic breakdown
 * @param {string} userNote - The user's explanation of the fix
 * @param {string} category - The tech category
 */

/**
 * Mocks article generation for development
 */
export const mockGenerateArticle = async (rawError, aiAnalysis, userNote, category) => {
  const title = `Insight: Resolving ${category} Bottlenecks`;
  const content = `
# ${title}

## The Challenge
Developers often encounter unexpected behavior when dealing with **${category}** in highly concurrent environments.

## Error Signature
\`\`\`
${rawError.substring(0, 100)}...
\`\`\`

## Deep Dive
The root cause lies in the **Event Loop** synchronization. As observed in the analysis:
> ${aiAnalysis.substring(0, 150)}...

## The Resolution
The user implemented the following patch:
*${userNote}*

This ensures that the **State Transition** is idempotent.
  `;

  return {
    content,
    metadata: {
      title,
      metaDescription: "A deep dive into neural diagnostic resolution.",
      tags: [category, "Resolved"],
      ogTitle: title
    },
    slug: `mock-fix-${Date.now()}`
  };
};

/**
 * Generates an SEO-optimized markdown article based on a resolved debug session
 */
export const generateArticle = async (rawError, aiAnalysis, userNote, category, selectedModel = 'Gemini 3 Flash', messages = [], contextSummary = '') => {
  if (process.env.MOCK_AI === 'true') {
    return mockGenerateArticle(rawError, aiAnalysis, userNote, category);
  }

  const chatHistory = messages
    .map(m => `[${m.role.toUpperCase()}]: ${stripMeta(m.content).substring(0, 500)}`)
    .join('\n\n');

  // For long sessions, the rolling summary captures the older turns that were
  // compressed out of the live window.
  const summarySection = contextSummary && contextSummary.trim()
    ? `\n    - **Earlier Conversation Summary:** """${contextSummary.trim()}"""`
    : '';

  const prompt = `
    You are Trace, a technical documentation specialist.
    Create a high-quality, SEO-optimized knowledge base article about a fixed bug based on a diagnostic session.

    ### CONTEXT:
    - **Initial Error:** """${rawError}"""
    - **Initial Analysis:** """${aiAnalysis}"""${summarySection}
    - **Complete Conversation History:**
      """
      ${chatHistory}
      """
    - **Developer's Fix Explanation:** """${userNote}"""
    - **Technology Category:** ${category}
    
    ### INSTRUCTIONS:
    - Synthesize the entire conversation (history) into a cohesive technical article.
    - The **Developer's Fix Explanation** (${userNote}) is the **GROUND TRUTH** for how the problem was finally solved. Use this as the core of "The Solution" section.
    - If the user asked clarifying questions that revealed more info, include those insights.
    - Title: Catchy, problem-solution oriented.
    - Foundational Causality: Explain the deep technical "Why" discovered across the chat.
    - The Solution: A clear, analytical guide based on the verified fix note.
    - Prevention: How to avoid this in the future.
    
    METADATA:
    End the response with a JSON block wrapped in __JSON_META__ containing:
    {
      "title": "Clean Article Title",
      "metaDescription": "Brief SEO description",
      "tags": ["Tag1", "Tag2"],
      "ogTitle": "Open Graph Title"
    }
  `;

  try {
    // Respect the input tokens-per-minute budget (blog gen sends the whole convo).
    const reservation = reserveInputTokens(estimateTokens(prompt));
    if (!reservation.ok) {
      const secs = Math.max(1, Math.ceil(reservation.retryAfterMs / 1000));
      throw new Error(`Trace is at its per-minute capacity. Please try publishing again in ~${secs}s.`);
    }

    const modelId = MODEL_MAPPING[selectedModel] || MODEL_MAPPING['Gemini 3 Flash'];
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(prompt);
    const fullContent = result.response.text();

    // 1. Try to find the specific JSON meta block
    let jsonMatch = fullContent.match(/__JSON_META__\s*([\s\S]*?)__JSON_META__/);
    
    // 2. Fallback: Try to find ANY json block
    if (!jsonMatch) {
      jsonMatch = fullContent.match(/```json\n([\s\S]*?)\n```/);
    }
    
    // 3. Last resort: Try to find a naked JSON object at the end
    if (!jsonMatch) {
      jsonMatch = fullContent.match(/\{[\s\S]*"title":[\s\S]*\}/);
    }

    let metadata = {};
    if (jsonMatch) {
      try { 
        const jsonStr = (jsonMatch[1] || jsonMatch[0]);
        const cleanJson = jsonStr
          .replace(/__JSON_META__/g, '')
          .replace(/JSON_META/g, '') // Also remove variant
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        metadata = JSON.parse(cleanJson); 
      } catch (e) {
        try {
           const jsonStr = (jsonMatch[1] || jsonMatch[0]);
           const fixJson = jsonStr.replace(/,\s*([\]}])/g, '$1');
           metadata = JSON.parse(fixJson);
        } catch(e2) {}
      }
    }

    // AGGRESSIVE CLEANING: Strip all metadata evidence
    let content = fullContent
      .replace(/__JSON_META__[\s\S]*?__JSON_META__/g, "")
      .replace(/JSON_META[\s\S]*?$/g, "") // Strip if AI missed closing tag
      .replace(/```json[\s\S]*?```/g, "")
      .replace(/\{[\s\S]*"title":[\s\S]*\}/g, "") // Strip raw JSON objects
      .trim();

    // ROBUST FALLBACK
    if (!metadata.title) {
      const h1Match = content.match(/^#\s+(.*)/m);
      const safeCategory = category && category !== 'undefined' ? category : 'General';
      metadata.title = h1Match ? h1Match[1].trim() : `Resolution: ${safeCategory} Issue`;
    }

    if (!metadata.metaDescription) {
      const safeCategory = category && category !== 'undefined' ? category : 'Technical';
      metadata.metaDescription = `Deep dive into resolving a technical bottleneck in ${safeCategory}.`;
    }

    // Normalize tags for library consistency
    if (metadata.tags && Array.isArray(metadata.tags)) {
      metadata.tags = metadata.tags.map(t => t.trim().toUpperCase()).filter(t => t.length > 0);
    }

    return {
      content,
      metadata,
      slug: `${slugify(metadata.title)}-${Math.random().toString(16).substring(2, 8)}`
    };
  } catch (error) {
    console.error('Article Generation Error:', error);
    throw new Error('Failed to generate library article');
  }
};

const slugify = (text) => {
  if (!text) return `fix-${Date.now()}`;
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .substring(0, 100);        // Max length
};
