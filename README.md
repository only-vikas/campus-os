# 🎓 Campus OS
**The Next-Generation AI-Powered Academic & Career Intelligence Ecosystem**

![Campus OS Desktop](/public/screenshots/desktop.png)

## Overview

**Campus OS** is a browser-like, glassmorphic operating system built for the web. It unified academic ERP, placement tracking, financial literacy, and predictive AI into a single, beautifully animated workspace. 

Instead of disjointed portals and dashboards, Campus OS provides students and administrators with a cohesive desktop experience featuring draggable windows, real-time widgets, and a gamified ecosystem.

### 🌟 Key Features

*   **Window Manager & Desktop Shell:** A full draggable, resizable windowing system built with Framer Motion and Zustand.
*   **Gamification Engine:** Earn XP, level up, and unlock achievements by interacting with apps and completing tasks.
*   **Cross-App Intelligence:** Data flows seamlessly between apps (e.g., Campus Portal grades sync with the Placement Portal).
*   **AI Fallback Chain:** Uses a robust AI engine routing (OpenRouter -> Ollama -> Mock Data) for rate-limited, intelligent interactions.

---

## 📱 The App Ecosystem

Campus OS is modular and extensible. Currently, it ships with the following flagship applications:

### 1. 🧠 NovaMind (Learning Engine)
*Predictive, adaptive learning & career intelligence engine.*
- Analyzes skill gaps and recommends highly tailored learning paths.
- **Preview:**  
  ![NovaMind](/public/screenshots/novamind.png)

### 2. 🏛️ Campus Portal (Student ERP)
*Student profile, grades, attendance, fees & registration.*
- Direct MongoDB integration syncing real student academic data.
- Built-in tuition fee payment simulators and course registration.
- **Preview:**  
  ![Campus Portal](/public/screenshots/campus-portal.png)

### 3. 💼 Placement Portal
*Job listings, applications & placement tracking with AI matching.*
- **Dual Views:** Student View (apply for jobs) and TPO View (manage drives).
- **AI Ranking Engine:** Automatically analyzes resumes against job descriptions to assign a Match Score.
- **Preview:**  
  ![Placement Portal](/public/screenshots/placement-portal.png)

### 4. 🏗️ EduVault & FinSack
*Your AI-powered financial companions for tracking, learning, and trading.*
- Gamified financial literacy modules.
- **Preview:**  
  ![EduVault](/public/screenshots/eduvault.png)

### 5. 🛡️ CodeGuard
*AI-powered code analysis, security scanning & automated fixes.*
- Drop your code in, get actionable AI code reviews instantly.

### 6. 📄 Resume Analyzer & Interview Prep
*AI-powered career tools.*
- Automated resume parsing, scoring, and real-time mock interviews.

---

## 🚀 Installation & Usage

Follow these steps to run Campus OS locally.

### Prerequisites
- Node.js 18+ 
- MongoDB Instance (Local or Atlas)
- Clerk API Keys (for Auth)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/campus-os.git
cd campus-os
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb://localhost:27017/campus_os
# Add AI keys if needed
OPENROUTER_API_KEY=...
```

### 3. Seed Database (Optional)
If you want to populate the MongoDB database with real student data:
```bash
npx ts-node -r dotenv/config scripts/import-real-data.ts dotenv_config_path=.env.local
```

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser to boot up Campus OS!

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Glassmorphism
- **Animations:** Framer Motion & GSAP
- **State Management:** Zustand
- **Database:** MongoDB
- **Authentication:** Clerk

---

## 🎥 Video Demonstrations

*Drop your testing videos here to showcase the OS in action.*

- [Full OS Walkthrough](/public/videos/walkthrough.mp4)
- [AI Ranking Engine Demo](/public/videos/ai-rank.mp4)

---
*Built with passion for the ultimate student experience.*
