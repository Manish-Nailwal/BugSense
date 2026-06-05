# Trace | Technical Overview
**Copyright © 2026 Manish Nailwal. All Rights Reserved.**

> Trace (internal codename: BugSense) is a Socratic AI debugging platform by Manish Labs. This document is a high-level overview of the product and architecture. Operational specifics (exact usage limits, rate budgets, model tiers, and environment configuration) are intentionally left out.

---

## 1. Product Philosophy: Guided Learning
Trace is not a standard AI debugger. It is built on the belief that **active reasoning** is the core of senior engineering. The product introduces a little "productive friction" so a developer engages with the logic of a bug rather than blindly pasting a fix.

### Core value props
- **Skill acceleration:** deepens a developer's understanding of their own stack.
- **Knowledge retention:** turns ephemeral chat context into durable, searchable write-ups.
- **Verification first:** encourages confirming and understanding a fix before it is recorded as resolved.

---

## 2. System Architecture

### Frontend (client)
- **Framework:** React with Vite.
- **State:** Zustand stores, with local persistence for things like theme and session state.
- **Styling:** Tailwind CSS, Geist typography, a clean "industrial minimalist" design language with light and dark themes.
- **Motion:** Framer Motion for transitions and real-time streaming feedback.
- **Routing:** React Router, with public pages (landing, library, guide, about, legal) and authenticated pages (debugger, dashboard, workspace).

### Backend (server)
- **Runtime:** Node.js and Express.
- **Database:** MongoDB via Mongoose for users, debug sessions, analytics profiles, reports, and published articles.
- **AI integration:** a service layer wraps Google's Gemini models for stateful, Socratic prompting and streams responses to the client over Server-Sent Events (SSE).

---

## 3. The Debugging Experience
The "brain" of Trace is an adaptive Socratic pipeline rather than a fixed template:

1. **Understand the error:** the response opens with a plain-English explanation of what is actually going wrong.
2. **Socratic guidance:** instead of dumping a final answer, Trace leads with mental models and the most likely root cause, and adapts its format to the question (a greeting gets a sentence; a stack trace gets structure).
3. **Confirm the fix:** the developer marks what worked and can add a short note, which feeds their growth analytics.
4. **Synthesize knowledge:** a resolved session can be distilled into a clean, shareable article for the Library.

Supporting capabilities:
- **Normal vs Deep analysis:** the model is selected automatically. A fast default handles everyday questions; an optional Deep mode performs a more exhaustive, multi-hypothesis root-cause analysis. Selection and any fallback are handled server-side, so the user never picks a model.
- **Attach context:** users can attach a log or text file to give the analysis more to work with.
- **Auto chat titles:** the first reply also produces a concise conversation title behind the scenes.

---

## 4. Conversation Context and Continuity
Trace maintains conversation context efficiently so long sessions stay coherent without resending the whole transcript each turn:
- The database is the source of truth for a session's messages.
- Recent turns are kept verbatim, and older turns are folded into a rolling summary that preserves the technical details a debugging chat depends on.
- This summary also helps when distilling a session into a published article.

### Durability
Generation is decoupled from the browser connection. If a user closes the tab or refreshes mid-stream, the server still finishes the reply and persists it, so the full answer is there when they return.

---

## 5. Reliability and Fair Usage
Trace runs on a free tier, so it is designed to stay available and predictable:
- **Managed daily allowances** govern how much of the shared AI capacity each user and the platform as a whole can use, resetting on a fixed daily schedule.
- A small portion of capacity is **held in reserve** for essential actions (such as publishing a resolved fix) so everyday chat never starves them.
- A **per-minute safety throttle** keeps requests within the AI provider's rate limits and degrades gracefully (clear, friendly messaging) when capacity is tight.
- **Input length** in the composer is capped to a sensible limit, similar to mainstream chat tools.

The exact figures are intentionally not documented here and are tuned operationally.

---

## 6. Growth Analytics and Learning
The dashboard turns a developer's activity into insight:
- **At-a-glance stats:** total sessions, confirmed fixes, success rate, and top problem area.
- **Error types chart:** a breakdown of recurring categories.
- **Recommended skills and learning paths:** surfaced from real activity and linked to official documentation. These **accumulate over time** (deduplicated, most-recent first), are retained in full, and are shown in a read-only archive. New users see sensible trending suggestions until they have history of their own.
- **Summary reports:** an AI-generated diagnostic report on demand, with guidance on the right time to generate one. Each report attaches its recommended resources and skill gaps, and past reports are browsable.

---

## 7. Knowledge Library and Workspace
- **Library:** resolved sessions can be published as SEO-friendly knowledge articles that other developers can find and learn from. Authors choose to publish under their name or anonymously.
- **Workspace:** a single place to manage published blogs and past conversations, including toggling a blog's identity at any time.
- **Reader Q&A (groundwork):** the data model and UI are prepared for readers to ask questions on a published fix and for authors to reply, paving the way for lightweight community interaction.

---

## 8. Personalization and Account
A unified settings surface ("Control Center") covers:
- **Custom instructions:** what Trace should know about you and your preferred response style.
- **Response mode:** Socratic guidance vs more direct explanation.
- **Preferences:** theme, accent color, language, default publishing identity, and similar.
- **Profile and data controls:** edit your profile and manage your conversations.

Theme behavior favors the locally chosen theme, and links a saved account preference when the user updates it.

---

## 9. Platform and Polish
- **SEO and metadata:** every route sets its own title, description, and social (Open Graph / Twitter) tags, driven centrally so titles update correctly on navigation.
- **Consistent tooltips:** a single app-wide tooltip layer (driven by a data attribute) replaces native browser tooltips for a clean, theme-aware, non-clipping experience everywhere.
- **Accessibility and theming:** light/dark support, keyboard shortcuts for common actions, and readable typography.
- **Ecosystem:** Trace is one node of the wider Manish Labs ecosystem, with natural cross-links back to the hub and the creator's other projects.

---

## 10. Feature Decision Log

### Built since the early MVP
- Attaching a log or text file as context for analysis.
- Growth analytics, recurring-pattern detection, recommended skills and learning paths, and on-demand summary reports.
- A shared knowledge Library with author identity control.
- A workspace to manage blogs and conversations, with reader Q&A groundwork.
- Personalization, account preferences, and data controls.

### Intentionally deferred
- **Real-time multi-user collaboration:** would require live synchronization infrastructure; not core to validating individual problem-solving yet.
- **Sandboxed code execution:** meaningful security and infrastructure overhead for marginal MVP value; copy-pasting specific errors covers most needs today.
- **Reddit-style voting:** ranking and moderation are deferred in favor of first building a base of verified knowledge; lightweight reader Q&A is the chosen first step toward community interaction.

---

## 11. Proudest Decision: Teaching-First, Verify Before You Publish
The defining choice is the **Socratic, teaching-first delivery**: Trace explains the "why" and guides toward the fix instead of just handing one over, and it asks the developer to confirm (and ideally explain) the fix before it becomes a permanent, published article. This is a deliberate bit of friction, and it is exactly what fulfills the product's promise of helping developers genuinely learn, not just unblock.

---

## 12. Setup and Installation
See the [README.md](../README.md) for environment configuration and deployment steps.
