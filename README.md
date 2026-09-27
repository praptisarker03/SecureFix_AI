# FixLoop AI 🛡️⚡

FixLoop AI is an AI-powered vulnerability scanner and auto-fix web application designed to automatically detect security vulnerabilities in your codebase and generate verified remediation patches.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Python, FastAPI, Uvicorn, Pydantic
- **Database / Auth** *(Upcoming)*: Supabase
- **Static Analysis** *(Upcoming)*: Semgrep
- **AI Engine** *(Upcoming)*: Google Gemini API

---

## 📁 Project Structure

```text
FixLoop_AI/
├── frontend/             # React + TypeScript + Tailwind CSS application
└── backend/              # Python + FastAPI application
    └── app/
        ├── api/          # API endpoints & dependency injection
        └── core/         # Core configuration & settings
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. Test the health endpoint:
   - Browser / cURL: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
   - Interactive Swagger API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser:
   [http://localhost:5173](http://localhost:5173)
