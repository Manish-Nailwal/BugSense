# Trace
**by [Manish Labs](https://manishlabs.com)**

### Stop Copy-Pasting. Start Learning.

Trace is an AI-powered debugging platform that bridges the gap between fixing an error and actually understanding it. Instead of handing you a patch like a generic chatbot, Trace uses a Socratic, teaching-first approach: it explains what is going wrong, guides you to the root cause, and turns every solved bug into durable, searchable knowledge.

---

## 🎯 The Problem
The modern developer's workflow has been reshaped by AI, but not entirely for the better. LLMs created a "copy-paste culture" where engineers resolve errors by piping stack traces into a chatbot and pasting the output back into their editor. This shortcuts the deductive reasoning phase of debugging, leading to fragile technical debt and stagnating skills.

Trace reclaims the learning moment by turning a frustrating error into a structured learning exercise, and by automatically documenting every "aha!" moment so the knowledge is never lost to the next sprint.

---

## 🚀 Core Features

<table border="0">
  <tr>
    <td width="33%" valign="top">
      <h3>🧠 Socratic Workspace</h3>
      A focused space where Gemini acts as a senior mentor, explaining the root cause and asking leading questions instead of just dumping code. The model is chosen automatically, with an optional Deep mode for tougher bugs.
    </td>
    <td width="33%" valign="top">
      <h3>📚 Knowledge Library</h3>
      Every resolved bug can be synthesized into a clean, SEO-friendly article, published under your name or anonymously, so your growth compounds over time.
    </td>
    <td width="33%" valign="top">
      <h3>⚡ Growth Analytics</h3>
      A dashboard that surfaces recurring error patterns, your success rate, recommended skills with official docs, and on-demand AI summary reports.
    </td>
  </tr>
</table>

**Also included:** a Workspace to manage blogs and conversations, a unified Control Center for personalization and preferences, accumulating learning paths and skill recommendations, and resilient streaming so a reply still saves even if you close the tab mid-answer.

---

## 🖼️ Visual Tour

### 🏠 The Entry Point
A high-fidelity landing page designed to get you into the diagnostic mindset immediately.
<p align="center">
  <img src="https://github.com/user-attachments/assets/711c0a8b-5db5-46ed-ba7e-86fcc23c21af" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" alt="Landing">
</p>

### 💬 The Workspace
The core chat experience, where the AI favors guided learning over direct patches.
<p align="center">
  <img src="https://github.com/user-attachments/assets/3d72e7aa-c154-45e3-9081-0cfcf1cd8dfa" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" alt="Chat">
</p>

### 📝 Verified Solutions
Beautifully synthesized articles that capture the "why" behind every fixed bug, without the conversational fluff.
<p align="center">
  <img src="https://github.com/user-attachments/assets/39197762-ab75-4d74-962d-43fb1b0747b7" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" alt="Article">
</p>

---

## 🤖 AI Integration
Trace uses **Google's Gemini** models as its reasoning engine.
- **Adaptive Socratic guidance:** there is no rigid template. Trace leads with a plain-English explanation, guides toward the root cause, and only structures the answer when it genuinely helps.
- **Automatic model selection:** a fast default handles everyday questions, while an optional Deep mode runs a more exhaustive, multi-hypothesis analysis. Selection and any fallback happen server-side, with fair daily usage allowances so the free tier stays available for everyone.
- **Efficient context:** recent turns are kept verbatim and older ones are folded into a rolling summary, so long sessions stay coherent without resending the whole transcript.
- **Article synthesis:** once a fix is confirmed, the AI distills the conversation into a structured Knowledge Base Article.

---

## 🛠️ Technical Stack
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Zustand, React Router, react-helmet-async.
- **Backend:** Node.js, Express, Mongoose, Server-Sent Events for streaming.
- **Database:** MongoDB.
- **AI Service:** Google Gemini API.

---

## 🏗️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the project**
   ```bash
   git clone https://github.com/Manish-Nailwal/BugSense.git
   cd "Bug Sense"
   ```

2. **Set up the server**
   ```bash
   cd server
   npm install
   # Create a .env file based on .env.example with your credentials
   npm run dev
   ```

3. **Set up the client**
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 🚦 Feature Decision Log

### Built
- Adaptive Socratic debugging with automatic Normal/Deep model selection.
- Attaching a log or text file as extra context for analysis.
- Growth analytics, recurring-pattern detection, accumulating skills and learning paths, and on-demand summary reports.
- A shared Knowledge Library with author identity control, plus a Workspace to manage blogs and conversations.
- Personalization, account preferences, and data controls.

### Intentionally deferred
- **Real-time multi-user collaboration:** needs live sync infrastructure (WebSockets/CRDTs); not core to validating individual problem-solving yet.
- **Sandboxed code execution:** meaningful security and infrastructure overhead for marginal MVP value.
- **Reddit-style voting:** ranking and moderation are deferred in favor of first building a base of verified knowledge; lightweight reader Q&A is the chosen first step.

---

## 🌐 Ecosystem
Trace is one node of the wider [Manish Labs](https://manishlabs.com) ecosystem of products and experiments.

---

## 📝 License
Copyright © 2026 Manish Nailwal. **All Rights Reserved.**
This software is proprietary. No part of this project may be copied, modified, or distributed without explicit permission from the owner.
