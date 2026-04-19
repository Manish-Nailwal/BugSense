---

## 📝 License & Usage
**Copyright © 2026 Manish. All Rights Reserved.**
This documentation and the associated BugSense codebase are proprietary. Unauthorized copying, modification, or distribution is strictly prohibited.


## 1. What is BugSense?
BugSense is a tool for "Guided Debugging." Most AI tools just give you a block of code to copy, but BugSense helps you think through the problem yourself. This makes you a better developer every time you fix a bug.

### Our Approach
- **Learn, don't just fix**: Understand *why* something broke, not just how to patch it.
- **Double-check everything**: The AI makes sure your fix actually works and that you understand it.
- **Your own help center**: Every fix is saved as a simple article in your personalized library.

---

## 2. The Parts of the App

### The Backend (Server)
- **Node.js**: The engine that runs the server.
- **MongoDB**: The database where your chats and library are saved.
- **Gemini AI**: The "brain" that guides you through the debugging steps.
- **Security**: Keeps your account and data safe.

### The Frontend (User Interface)
- **React**: Makes the app fast and interactive.
- **Tailwind CSS**: Makes the app look clean and modern.
- **Animations**: Smooth transitions that make the app feel premium and easy to use.

---

## 3. The 4 Steps of Debugging
When you talk to BugSense, it follows 4 simple steps:
1. **Input**: You share your error message or code.
2. **First Look**: The AI checks the problem without giving away the answer.
3. **Guidance**: The AI asks questions or gives hints to help you find the bug.
4. **Final Summary**: Once solved, it writes a clear guide (an article) for your library.

---

## 4. Design Style
We use a style called **Industrial Minimalist**. This means:
- **Dark & Clean**: Dark colors that are easy on the eyes.
- **Simple Fonts**: Easy-to-read text.
- **Focused Layout**: Everything is designed to keep you focused on solving your code issues.

---

## 5. What’s Next?
- [x] Feature 1: Guided Chat Engine.
- [x] Feature 2: User History & Profiles.
- [x] Feature 3: The Troubleshooting Library.
- [ ] Future: VS Code extension (Fix bugs directly in your editor).
- [ ] Future: Team features (Share your library with friends).

---

## 6. How to Install

### Server
```bash
cd server
npm install
# Put your database and AI keys in the .env file
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```
