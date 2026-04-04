# Daylog Implementation Guide — Next.js + Go + Python

This document outlines the detailed process for transforming the **Daylog** design system and PRD into a fully functional AI-powered journaling application.

## 🏗 High-Level Architecture

The system consists of three main parts:
1.  **Frontend (Next.js)**: Responsible for the user interface, rich-text editing, and analytics dashboards.
2.  **API Gateway (Go)**: Handles authentication, database interactions, and orchestrates the AI processing flow.
3.  **AI Processor (Python)**: A specialized internal service that uses LLMs (Groq) to extract structured data from raw text.

---

## 🛠 Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router) | Core UI and Routing |
| **Styling** | Tailwind CSS / Vanilla CSS | Design System Implementation |
| **Editor** | TipTap | Notion-like free-text journaling |
| **Backend** | Go (Gin/Fiber) | User Auth & Data Management |
| **AI Layer** | Python (FastAPI) | LLM Entity Extraction (Groq) |
| **Database** | MongoDB | Persistent Storage |

---

## 📂 Project Structure

```text
/
├── frontend/                  # Next.js Application
│   ├── app/                   # App Router (Home, Auth, Journal, Profile)
│   ├── components/            # UI Kit & Feature Blocks
│   ├── hooks/                 # Custom React hooks (useJournal, useAuth)
│   ├── lib/                   # API Client & Utilities
│   └── styles/                # Global Design System Tokens
│
├── backend-go/                # API Gateway
│   ├── handlers/              # Auth & Journal Route Handlers
│   ├── middleware/            # JWT & CORS
│   └── services/              # Shared logic & Python Bridge
│
└── backend-python/            # AI Processing Service
    ├── main.py                # FastAPI endpoints
    └── ai_processor.py        # Groq LLM integration
```

---

## 🚀 Step-by-Step Implementation

### Phase 1: Design System Foundation (Frontend)
1.  **Initialize Next.js**: Create the project and set up the directory structure.
2.  **Global Tokens**: Translate `design_system.html` into a `globals.css` or Tailwind config.
    *   Colors: Cream (`#fffff4`), Navy (`#212844`), Sage Green (`#a8c675`), etc.
    *   Typography: Import Google Fonts (DM Serif Display, DM Sans, DM Mono).
3.  **Atomic UI Kit**: Create reusable components for `Button`, `Input`, `Badge`, `Card`, and `Avatar`.

### Phase 2: Mocking the User Interface
1.  **Marketing**: Port `homepage_daylog.html` to `app/page.tsx`.
2.  **Auth**: Build Login/Signup pages using the split-screen design from `auth_page_daylog.html`.
3.  **Journal Dashboard**: Build the two-column layout from `journal_page_daylog.html`.
    *   Left side: Entry history list.
    *   Right side: TipTap editor area.
4.  **Profile**: Implement the analytics heatmaps and charts from `profile_page_daylog.html`.

### Phase 3: Backend & Authentication
1.  **Auth (Go)**: Set up JWT authentication with HttpOnly cookies.
2.  **Database**: Define MongoDB schemas for `users` and `journals`.
3.  **Middleware**: Ensure every request to `/api/journal` is authenticated and scoped to the user's ID.

### Phase 4: AI Workflow & Data Flow
1.  **Autosave**: Implement a debounced (2s) `PATCH` request from the TipTap editor to the Go API.
2.  **Submit Flow**:
    *   User clicks "Submit".
    *   Frontend sends a `POST` to `/api/journal/:id/submit`.
    *   Go calls the Python service at `:8000/process`.
    *   Python calls Groq LLM → returns structured JSON.
    *   Go saves the JSON and generated narrative → returns to Frontend.
3.  **Result Rendering**: Update the frontend to show the "Processed" view with extracted skills, people, and mood chips.

---

## 🔑 Environment Variables

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Go Backend (`.env`)
```bash
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
PYTHON_SERVICE_URL=http://localhost:8000
```

### Python Service (`.env`)
```bash
GROQ_API_KEY=your_groq_api_key
```

---

## 🛡 Security Rules
1.  **User Isolation**: Never query the database without filtering by the authenticated user's ID.
2.  **Protected Routes**: Use Next.js Middleware to protect `/journal` and `/profile`.
3.  **Safe Processing**: Python service should remain internal (behind Go) and not be exposed directly.

---

## 🛠 Local Development Workflow
1.  Start MongoDB (local or Atlas).
2.  Run Python Processor: `uvicorn main:app --port 8000`.
3.  Run Go API: `go run main.go`.
4.  Run Next.js: `npm run dev`.

---

> [!IMPORTANT]
> The design system's **Sage Green (#a8c675)** should be used as the primary brand color for success states and interactive "logo" highlights.
