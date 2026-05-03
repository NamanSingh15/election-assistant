# ElectionGuide AI 🗳️

> An interactive, AI-powered assistant that helps citizens understand India's democratic election process — from voter registration to result certification.

**Powered by Google Vertex AI (Gemini 2.0 Flash) · Google Maps · Cloud Run**

---

## Chosen Vertical

**Civic Engagement / Government Services** — helping Indian citizens become informed voters by guiding them through the complete election process in a clear, non-partisan, and accessible way.

---

## How It Works

```
Browser ──HTTPS──► Cloud Run (FastAPI)
                        │
                        ├── GET /          → Serves the React-style SPA (index.html)
                        ├── GET /assets/*  → Static CSS/JS
                        └── POST /api/chat → Vertex AI Gemini 2.0 Flash
                                                  │
                                            Google Cloud IAM
                                         (Application Default Credentials)
```

The frontend is a fully static SPA served by the same FastAPI backend on Cloud Run. No API keys are exposed to the browser — Vertex AI calls are made server-side using Cloud Run's attached service account.

---

## Features

| Feature | Description |
|---|---|
| 🤖 AI Chat Assistant | Vertex AI Gemini answers any election question with India-specific context |
| 📋 6-Step Election Wizard | Guided walkthrough: Registration → Voting → Results |
| 📍 Polling Booth Finder | Google Maps JavaScript API + Places to find nearby stations |
| 📖 Election Glossary | Searchable definitions for EVM, NOTA, EPIC, MCC, and more |
| ♿ Fully Accessible | ARIA labels, keyboard navigation, skip links, screen-reader support |
| 📱 Responsive | Mobile-first design, works on all screen sizes |

---

## Google Services Used

| Service | How It's Used |
|---|---|
| **Vertex AI (Gemini 2.0 Flash)** | AI chat backend — election Q&A with contextual system prompt |
| **Google Cloud Run** | Hosts the FastAPI server (auto-scales to zero) |
| **Google Maps JavaScript API** | Interactive map in the polling booth finder |
| **Google Places API** | Nearby search for polling stations |
| **Google Fonts** | Outfit + Inter typography |

---

## Project Structure

```
election-assistant/
├── main.py                  # FastAPI backend + Vertex AI integration
├── requirements.txt
├── Dockerfile               # Multi-stage, non-root, Cloud Run-ready
├── cloudbuild.yaml          # Cloud Build CI/CD pipeline
├── .gitignore
├── tests/
│   └── test_main.py         # Pytest suite (health, chat, validation, error cases)
└── frontend/
    ├── index.html           # SPA with full ARIA/semantic HTML
    ├── css/style.css        # Dark-mode, glassmorphism, responsive design
    └── js/
        ├── app.js           # Bootstrap, navigation, particles, Maps loader
        ├── chat.js          # Chat UI, API calls, markdown rendering
        ├── wizard.js        # 6-step wizard with localStorage persistence
        ├── maps.js          # Google Maps + Places integration
        └── knowledgeBase.js # Static election data (steps, FAQs, glossary)
```

---

## Local Development

### Prerequisites
- Python 3.12+
- Google Cloud SDK (`gcloud`) authenticated
- A GCP project with Vertex AI API enabled

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/election-guide-assistant.git
cd election-guide-assistant
pip install -r requirements.txt

# Authenticate with Google Cloud
gcloud auth application-default login

# Run locally
uvicorn main:app --reload --port 8080
# Open http://localhost:8080
```

### Run Tests
```bash
pip install pytest httpx
pytest tests/ -v
```

---

## Deploy to Cloud Run

### 1. Enable APIs
```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com aiplatform.googleapis.com --project namans-project-495216
```

### 2. Grant Vertex AI permissions
```bash
gcloud projects add-iam-policy-binding namans-project-495216 \
  --member="serviceAccount:$(gcloud iam service-accounts list --filter='displayName:Default' --format='value(email)' --project namans-project-495216)" \
  --role="roles/aiplatform.user"
```

### 3. Build & Deploy
```bash
gcloud run deploy election-guide-assistant \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --project namans-project-495216
```

---

## Assumptions

- Election context is **India-specific** (ECI, EVM, VVPAT, Lok Sabha, EPIC, etc.)
- The Maps API key is a **client-side restricted key** (should be restricted to the deployed domain in Google Cloud Console)
- Vertex AI uses Cloud Run's **service account credentials** — no secrets in code
- The assistant is **non-partisan**: it only explains process, never recommends parties/candidates

---

## Evaluation Criteria

| Criterion | Approach |
|---|---|
| **Code Quality** | Typed FastAPI, Pydantic validation, modular JS classes, constants extracted |
| **Security** | No secrets in frontend, Pydantic input validation, CORS configured, non-root Docker user |
| **Efficiency** | History capped at 10 messages, multi-stage Docker build, 2 uvicorn workers, lazy Maps load |
| **Testing** | 9 pytest cases covering health, chat, validation, error handling, and edge cases |
| **Accessibility** | ARIA roles, skip link, keyboard navigation, semantic HTML5, `aria-live` regions |
| **Google Services** | Vertex AI Gemini, Google Maps JS API, Places API, Cloud Run, Google Fonts |
