🏫 Campus OS

The Unified Browser-Based Operating System for Student Lifecycle Management

https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js
https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react
https://img.shields.io/badge/TypeScript-5.4-3178c6?style=flat-square&logo=typescript
https://img.shields.io/badge/Tailwind-3.4-06b6d4?style=flat-square&logo=tailwindcss
https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square&logo=mongodb
https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square
https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square

---

🎯 Catchphrase

One Desktop. Seven Apps. Zero Context Switching. The complete student journey, reimagined as a browser-based operating system.

---

📸 Visual Preview

https://via.placeholder.com/1200x600/0f172a/60a5fa?text=Campus+OS+Desktop+Demo

⚡ Live Demo: campus-os.vercel.app (coming soon)

---

📖 About / Description

Campus OS is a browser-based simulated desktop environment engineered to eliminate the cognitive friction students face when juggling fragmented tools—resume builders, interview prep platforms, financial literacy apps, code review tools, and placement portals.

Built for Gen-Z learners in Tier-2 and Tier-3 Indian cities, Campus OS presents a single, cohesive macOS-inspired workspace where every student tool lives as a native "app" within a draggable, resizable window system. The platform features a context-aware Agentic AI assistant (Nova) powered by a 4-tier OpenRouter fallback chain, delivering hyper-specific guidance without manual prompt engineering.

The Problem We Solve: Students spend 23+ minutes regaining focus after every context switch. Campus OS collapses this friction by unifying the entire student lifecycle into one intelligent, gamified environment.

---

✨ Key Features

Feature Description
🖥️ Desktop Shell Browser-based OS with dock navigation, draggable/resizable windows, spotlight search, and lock screen
📄 AI Resume Analyzer PDF/DOCX parsing + 4-tier AI analysis, JD matching, bento-grid dashboard, and template-based PDF export
🎙️ AI Interview Prep Voice + text mock interviews with real-time Speech-to-Text, AI evaluation, and performance dashboards
💰 Smart Expense Tracker AI-powered budgeting insights, anomaly detection, and investment recommendations
📋 Campus Placement Portal AI-driven candidate shortlisting, recruiter dashboards, and match scoring
🛡️ AI Code Review (CodeGuard) Multi-language code analysis, vulnerability detection, one-click fixes, and gamified badges
📚 Financial Education Workspace Synchronized video lessons with auto-configured live market screeners
🧠 Personalized Learning Engine Adaptive learning paths with XP-based progression and conditional module unlocking
🤖 Nova AI Assistant Context-aware Agentic AI with RAG pipeline, reading your active DOM state in real time

---

🚀 Live Demo Link

· Live Deployment: campus-os.vercel.app
· Demo Video: YouTube Walkthrough
· Documentation Site: docs.campus-os.dev

---

📋 Prerequisites

Before you begin, ensure you have the following installed:

Requirement Minimum Version
Node.js v18.17+
npm v9.0+
Docker (optional) v20.0+
Git v2.30+

Required Accounts / API Keys (free tiers):

· OpenRouter — 4 API keys (or 1 with $10 top-up for 1,000 req/day)
· MongoDB Atlas — Free tier M0 cluster
· YouTube Data API v3 — Free 10,000 units/day
· Alpha Vantage — 25 calls/day (use mock data for development)

---

🛠️ Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/only-vikas/campus-os.git
cd campus-os

# 2. Install dependencies
npm install

# 3. Copy environment variables template
cp .env.example .env.local

# 4. Fill in your API keys in .env.local
# See "Environment Variables" section below

# 5. Start the development server
npm run dev

# 6. Open http://localhost:3000 in your browser
```

Docker Alternative:

```bash
docker-compose up -d
```

---

🔐 Environment Variables

Create a .env.local file with the following configuration:

```env
# ===== OpenRouter API Keys (4-Tier Fallback) =====
# Tier 1: High-performance reasoning model
OPENROUTER_API_KEY_1=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL_1=google/lyria-3-pro-preview

# Tier 2: General purpose fallback
OPENROUTER_API_KEY_2=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL_2=google/gemma-4-31b-it:free

# Tier 3: Emergency structured JSON model
OPENROUTER_API_KEY_3=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL_3=google/lyria-3-clip-preview

# Tier 4: Lightweight last resort
OPENROUTER_API_KEY_4=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL_4=dots-studio/dots-3-note-preview:free

# ===== MongoDB =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-os

# ===== YouTube API =====
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===== Alpha Vantage (Market Data) =====
ALPHA_VANTAGE_API_KEY=XXXXXXXXXX

# ===== Next.js =====
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# ===== Optional: Ollama (local, unlimited) =====
# OLLAMA_URL=http://localhost:11434
# OLLAMA_MODEL=llama3.1
```

---

💻 Code Examples

Analyzing a Resume

```typescript
// src/services/aiService.ts
import { analyzeResume } from '@/services/codeReviewService';

const result = await analyzeResume(
  resumeText,   // Extracted text from PDF/DOCX
  jdText,       // Job description text
  (progress) => console.log(progress) // "Trying AI 1/4..."
);

console.log(`Match Score: ${result.matchScore}%`);
console.log(`Missing Skills: ${result.missingSkills.map(s => s.skill).join(', ')}`);
```

Applying a Code Fix

```typescript
// In useCodeGuardStore.ts
const { currentCode, applyFix } = useCodeGuardStore();

const handleFix = (lineNumber: number, fixString: string) => {
  applyFix(lineNumber, fixString);
  // This splits currentCode by \n, replaces the target line,
  // and updates the store with the new code
};
```

---

📚 CLI Reference

Command Description
npm run dev Start development server with hot reload
npm run build Build production bundle
npm start Serve production build
npm run lint Run ESLint for code quality
npm run test Run unit tests with Jest
npm run type-check Run TypeScript type checking

---

🏗️ API Documentation

Core Endpoints (Next.js API Routes)

Endpoint Method Description
/api/auth/[...nextauth] ALL Authentication (JWT + OAuth)
/api/resume/analyze POST Resume vs JD analysis (Gemini/OpenRouter)
/api/code/review POST CodeGuard analysis with 4-tier fallback
/api/weather GET Real-time weather via Open-Meteo
/api/quote GET Daily motivation quote via ZenQuotes
/api/market GET Live market data (Alpha Vantage)
/api/placement/shortlist POST AI-driven candidate ranking

---

🤝 Contributing Guidelines

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: git checkout -b feat/your-feature-name
3. Commit changes: git commit -m "feat: add your feature"
4. Push: git push origin feat/your-feature-name
5. Open a Pull Request with a clear description of your changes

Branch Naming Convention:

· feat/ — New features
· fix/ — Bug fixes
· docs/ — Documentation updates
· refactor/ — Code refactoring
· test/ — Test coverage improvements

Commit Message Format:

```
type(scope): short description

[optional body]

[optional footer]
```

Example: feat(codeguard): add one-click fix with line offset tracking

---

🧪 Testing Instructions

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- src/components/apps/CodeGuard/CodeGuard.test.tsx

# Run E2E tests
npm run test:e2e
```

Testing Frameworks:

· Unit Tests: Jest + React Testing Library
· E2E Tests: Playwright (planned)
· Linting: ESLint + Prettier

---

🚀 Deployment Guide

Deploy to Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel Dashboard
# Project Settings → Environment Variables → Add all keys from .env.local
```

Deploy to Docker

```bash
# Build Docker image
docker build -t campus-os .

# Run container
docker run -p 3000:3000 --env-file .env.local campus-os
```

Deploy to AWS / Self-Hosted

1. Build the production bundle: npm run build
2. Start the server: npm start
3. Use PM2 for process management:
   ```bash
   pm2 start npm --name "campus-os" -- start
   pm2 save
   pm2 startup
   ```

---

🗺️ Roadmap

Phase Feature Status
v1.0 Desktop Shell + 7 Native Apps 🔄 In Progress
v1.1 Nova AI Context-Aware Assistant 📅 Q1 2026
v1.2 Simulated Execution Engine (Paper Trading) 📅 Q2 2026
v1.3 Automated NLP Pipeline for Video Tagging 📅 Q3 2026
v2.0 Mobile PWA + Collaborative Workspaces 📅 Q4 2026
v3.0 Third-Party App SDK (Plugin Architecture) 📅 2027

---

👥 Authors & Maintainers

Name USN Role
Vikas Kannur 2BA23IS120 Lead Developer, AI Integration
Subhoday Kulkarni 2BA23IS101 Frontend & UI/UX
Omkar Tatuskar 2BA22IS053 Backend & Database Architecture

Project Guide: Prof. S. S. Guttannavar, Assistant Professor, Department of Information Science and Engineering, Bapuji Institute of Engineering and Technology, Davangere.

---

📄 License

This project is licensed under the MIT License — see the LICENSE file for details.

---

🙏 Acknowledgments

· OpenRouter — Free-tier access to cutting-edge LLMs
· MongoDB Atlas — Generous free-tier database hosting
· Vercel — Free deployment and hosting
· ZenQuotes API — Daily motivational quotes
· Open-Meteo API — Free, open-source weather data
· YouTube Data API v3 — Educational content ingestion
· Alpha Vantage — Free market data (limited tier)
· Tailwind CSS & shadcn/ui — Beautiful, accessible UI components
· Framer Motion — Smooth desktop animations
· react-rnd — Draggable/resizable window manager foundation
· Monaco Editor — VS Code's powerful code editor

---

📬 Contact & Support

· GitHub Issues: Report a bug
· Discussions: Start a discussion
· Email: vikas.kannur@campus-os.dev (placeholder)

---

⭐ Show Your Support

If you found Campus OS helpful, please star this repository and share it with your network!

https://img.shields.io/github/stars/only-vikas/campus-os?style=social
https://img.shields.io/twitter/follow/vikas_kannur?style=social

---

Built with ❤️ for students, by students.
