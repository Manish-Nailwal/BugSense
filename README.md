<p align="center">
  <img src="https://github.com/user-attachments/assets/bc4bf26f-9d10-48a7-89c3-53dfef4acccf" width="400" alt="BugSense Banner">
</p>

# BugSense

### **Stop Copy-Pasting. Start Learning.**

BugSense is an AI-powered diagnostic platform designed to bridge the gap between error resolution and technical growth. Unlike generic chatbots that simply generate code patches, BugSense employs a **Guided Learning** methodology that helps developers deduce solutions through Socratic questioning and verified knowledge synthesis.

---

## 🎯 The Problem
The modern developer's workflow has been fundamentally altered by AI, but not entirely for the better. The rise of LLMs has created a "copy-paste culture" where engineers resolve errors by blindly piping stack traces into chatbots and pasting the output back into their editors. This shortcuts the critical deductive reasoning phase of debugging, leading to fragile technical debt and individual skill stagnation.

BugSense reclaims the learning moment by transforming a frustrating error into a structured learning exercise, automating the documentation of every "aha!" moment so that knowledge is never lost to the next sprint.

---

## 🚀 Core Features

<table border="0">
  <tr>
    <td width="33%" valign="top">
      <h3>🧠 Socratic Workspace</h3>
      A distraction-free environment where Gemini AI acts as a senior mentor, providing hints and asking leading questions instead of just giving code.
    </td>
    <td width="33%" valign="top">
      <h3>📚 Knowledge Library</h3>
      Every resolved bug is automatically synthesized into a searchable technical article. Build a personalized repository of your technical growth.
    </td>
    <td width="33%" valign="top">
      <h3>⚡ Neural Dashboard</h3>
      A premium, industrial-minimalist interface designed for deep focus, featuring real-time AI streaming and diagnostic analytics.
    </td>
  </tr>
</table>

---

## 🖼️ Visual Tour

### 🏠 The Entry Point
A high-fidelity landing page designed to get you into the diagnostic mindset immediately.
<p align="center">
  <img src="https://github.com/user-attachments/assets/711c0a8b-5db5-46ed-ba7e-86fcc23c21af" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" alt="HomePage">
</p>

### 💬 The Workspace
The core chat experience where the AI enforces guided learning over direct patches.
<p align="center">
  <img src="https://github.com/user-attachments/assets/3d72e7aa-c154-45e3-9081-0cfcf1cd8dfa" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" alt="ChatPage">
</p>

### 📝 Verified Solutions
Beautifully synthesized articles that capture the "Why" behind every fixed bug, removing conversational fluff.
<p align="center">
  <img src="https://github.com/user-attachments/assets/39197762-ab75-4d74-962d-43fb1b0747b7" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" alt="AI_Response">
</p>

---

## 🤖 AI Integration
BugSense utilizes **Google's Gemini 3** model as the core reasoning engine.
- **The Guidance Layer**: Uses specific prompt engineering to enforce a "Guided Learning" persona, preventing the AI from giving direct answers until the user demonstrates understanding.
- **Article Synthesis**: Post-session, the AI analyzes the chat history to distill the solution into a structured Knowledge Base Article (KBA).

---

## 🛠️ Technical Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Node.js, Express, Mongoose.
- **Database**: MongoDB.
- **AI Service**: Google Gemini API.

---

## 🏗️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the Project**
   ```bash
   git clone <your-repo-url>
   cd "Bug Sense"
   ```

2. **Step 1: Set up the Server**
   ```bash
   cd server
   npm install
   # Create a .env file based on .env.example with your credentials
   npm run dev
   ```

3. **Step 2: Set up the Client**
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 🚦 Feature Decision Log (What I Chose NOT to Build)

To maintain focus on the core value proposition and ensure a high-quality MVP, the following features were intentionally deferred:

- **Real-time collaboration (multi-user discussions)**  
  I considered enabling multiple users to interact within the same conversation thread in real time. However, this would require additional infrastructure such as WebSockets and state synchronization (CRDTs), significantly increasing complexity. Since the core goal was to validate individual problem-solving and knowledge generation, this was deprioritized in favor of a simpler, focused experience.

- **Community voting system (upvotes/downvotes like Reddit)**  
  A voting mechanism could help surface high-quality content, but it does not directly contribute to the core value of transforming conversations into useful articles. I chose to prioritize content creation and clarity first, leaving ranking and community moderation features for future iterations.

- **Sandbox execution & log file upload (error file parsing)**  
  I explored adding support for uploading log files and running code in a sandboxed environment for deeper debugging. However, this introduces security concerns and infrastructure overhead. To maintain a lean MVP and focus on fast problem resolution through user-provided snippets, this was intentionally deferred.

---

## 📝 License
Copyright © 2026 Manish. **All Rights Reserved.**
This software is proprietary. No part of this project may be copied, modified, or distributed without explicit permission from the owner.
