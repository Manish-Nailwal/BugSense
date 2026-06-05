/**
 * Mocks the Gemini AI response for testing purposes.
 * Simulates the streaming behavior using timeouts.
 */
export const mockDebugAnalysis = async (errorLog, res, history = [], options = {}) => {
  const isFollowUp = history.length > 0;
  
  const mockResponses = [
    `# 🔍 The Breakdown

    You have successfully transitioned from **String Manipulation** to **Arithmetic**. In programming, the \`+\` operator is "overloaded"—it performs two entirely different tasks depending on the data types involved. 

    When you use **Strings**, the \`+\` operator performs **Concatenation** (gluing "5" and "5" into "55"). When you use **Numbers**, it performs **Addition** (summing 5 and 5 into 10). By removing the quotes, you changed the fundamental **Instruction Set** the computer follows.

    # 🧠 The Mental Model

    Think of the \`+\` symbol as a **Context-Sensitive Tool**. 
    *   In a **Linguistic Context** (Strings), it acts like **tape**.
    *   In a **Mathematical Context** (Numbers), it acts like a **calculator**.

    TypeScript is now enforcing the calculator behavior because you defined the data as a **Number**. If you try to "concatenate" numbers, the language treats it as a math problem because that is the only logic a **Number** type supports.

    # 🧬 Probable Causality

    - **Logic Conflict**: You are likely trying to build a sequence (like a PIN or a phone number) using a type meant for calculations.
    - **Operator Overloading**: Your code is now executing **Mathematical Addition** because both operands are primitives of the type **number**.
    - **State Intent**: If your goal is to append digits to a display rather than increase a total value, your **State Initialization** is likely using the wrong type.

    # 🧪 Diagnostic Checklist

    - [ ] Check your state update logic. Are you doing \`value + 5\`? If \`value\` is \`10\`, the result is now \`15\`, not \`"105"\`.
    - [ ] Determine your **Intent**: Are you calculating a **Sum** or building a **String**?
    - [ ] Use a diagnostic log to see exactly how the engine is interpreting your data during the update:

    \`\`\`typescript
    // Insert this inside your handleClick to see the transformation
    console.log({ 
      currentType: typeof value, 
      incomingValue: 5, 
      result: value + 5 
    });
    \`\`\`

    # 💡 The Nudge

    If you want the numbers to sit side-by-side (concatenation), they must be **Strings**. However, if they are **Strings**, you lose access to **toFixed()**. You must decide: is this data a **Label** or a **Measurement**?

    __JSON_META__
    {
      "title": "TypeScript Number Concatenation",
      "category": "TypeScript Types",
      "techStack": ["React", "TypeScript"]
    }
    __JSON_META__`
  ];

  const followUpResponses = [
    "That's a **keen observation**. It looks like the **Middleware Chain** is indeed skipping the validation step. Try checking the **order of execution**.",
    "Interesting point. If you see that **null** value there, it means the **Context Provider** is not wrapping that specific branch of the tree.",
    "Precisely. The **Payload** is being sent, but the **Headers** are missing the **Content-Type**. Make sure your fetch call includes it."
  ];

  const fullText = isFollowUp 
    ? followUpResponses[Math.floor(Math.random() * followUpResponses.length)]
    : mockResponses[Math.floor(Math.random() * mockResponses.length)];

  const cleanText = fullText
    .replace(/__JSON_META__[\s\S]*?__JSON_META__/, '')
    .replace(/^[ \t]{4}/gm, '') // strip source indentation so Markdown doesn't treat it as a code block
    .trim();
  const chunks = cleanText.split(' '); // Chunk by words for better effect

  for (const word of chunks) {
    // Artificial delay to mimic AI thinking
    await new Promise(resolve => setTimeout(resolve, 30));
    res.write(`data: ${JSON.stringify({ chunk: word + ' ' })}\n\n`);
  }

  let metadata = {};
  if (!isFollowUp) {
    const jsonMatch = fullText.match(/__JSON_META__\s*([\s\S]*?)\s*__JSON_META__/);
    if (jsonMatch) {
      try { metadata = JSON.parse(jsonMatch[1]); } catch (e) {}
    }
  }

  return { fullText: cleanText, metadata };
};
