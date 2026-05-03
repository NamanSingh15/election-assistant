# ElectionGuide AI 🗳️

[![GitHub](https://img.shields.io/badge/GitHub-NamanSingh15%2Felection--assistant-blue?logo=github)](https://github.com/NamanSingh15/election-assistant)

> An interactive, AI-powered assistant that helps citizens understand India's democratic election process — from voter registration to result certification.

**Powered by Google Vertex AI (Gemini 2.5 Flash) · Google Maps · Cloud Run**

---

## 🏆 Chosen Vertical

**Civic Engagement / Government Services** — helping Indian citizens become informed voters by guiding them through the complete election process in a clear, non-partisan, and accessible way.

---

## 🏗️ Architecture

```
Browser ──HTTPS──► Cloud Run (FastAPI)
                        │
                        ├── GET /          → Serves SPA (index.html)
                        ├── GET /assets/*  → Static CSS/JS
                        └── POST /api/chat → Vertex AI Gemini 2.5 Flash
                                                  │
                                            Google Cloud IAM (ADC)
```

**Security**: No API keys in the browser. Cloud Run uses Application Default Credentials — Vertex AI calls are server-side only.

**Local Dev**: Uses `GEMINI_API_KEY` from `.env` for offline development.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Chat Assistant | Vertex AI Gemini 2.5 Flash — non-partisan election Q&A |
| 📋 6-Step Election Wizard | Registration → Voting → Results with checklists |
| 📍 Polling Booth Finder | Google Maps JavaScript API + Places API |
| 📖 Election Glossary | Searchable: EVM, NOTA, EPIC, MCC, VVPAT + more |
| ♿ Fully Accessible | ARIA labels, skip links, keyboard nav, screen-reader support |
| 📱 Responsive Design | Mobile-first, works on all screen sizes |

---

## 🔧 Google Services Used

| Service | How It's Used |
|---|---|
| **Vertex AI (Gemini 2.5 Flash)** | AI chat — election Q&A with contextual system prompt |
| **Google Cloud Run** | Hosts FastAPI server (auto-scales to zero) |
| **Google Maps JavaScript API** | Interactive dark-themed polling booth map |
| **Google Places API** | Nearby search for polling stations |
| **Google Geocoding API** | Convert addresses to map coordinates |
| **Google Fonts** | Outfit + Inter premium typography |

---

## 📁 Project Structure

```
election-assistant/
├── main.py                  # FastAPI + Vertex AI / Gemini API integration
├── requirements.txt
├── Dockerfile               # Multi-stage, non-root, Cloud Run-ready
├── cloudbuild.yaml          # Cloud Build CI/CD
├── tests/
│   └── test_main.py         # 9 pytest cases
└── frontend/
    ├── index.html           # SPA — full ARIA/semantic HTML5
    ├── css/style.css        # Dark-mode glassmorphism + animations
    └── js/
        ├── app.js           # Bootstrap, navigation, particles
        ├── chat.js          # AI chat UI with typing indicators
        ├── wizard.js        # 6-step wizard + localStorage
        ├── maps.js          # Google Maps + Places integration
        └── knowledgeBase.js # Static election data (steps, FAQs, glossary)
```

---

## 🚀 Local Development

```bash
git clone https://github.com/NamanSingh15/election-assistant.git
cd election-assistant

pip install -r requirements.txt

# Create .env for local dev
echo "GEMINI_API_KEY=your_key_here" > .env

uvicorn main:app --reload --port 8080
# Open http://localhost:8080
```

### Run Tests
```bash
pip install pytest httpx
pytest tests/ -v
```

---

## ☁️ Deploy to Cloud Run

### 1. Enable required APIs
```bash
gcloud services enable run.googleapis.com aiplatform.googleapis.com \
  artifactregistry.googleapis.com --project namans-project-495216
```

### 2. Grant Vertex AI permissions to Cloud Run
```bash
PROJECT_NUMBER=958192797065
gcloud projects add-iam-policy-binding namans-project-495216 \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### 3. Deploy (builds automatically via Cloud Build)
```bash
gcloud run deploy election-guide-assistant \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --project namans-project-495216
```

---

## 🔐 Security Notes

- **No secrets in source code** — `.env` is gitignored
- **Vertex AI uses ADC on Cloud Run** — no API key needed in production
- **Input validation** via Pydantic models with length limits
- **Non-root Docker user** in multi-stage Dockerfile
- **Maps API key** should be restricted to your Cloud Run domain in GCP Console → APIs & Credentials

---

## 📊 Evaluation Criteria

| Criterion | Approach |
|---|---|
| **Code Quality** | Typed FastAPI, Pydantic validation, modular ES6 JS classes |
| **Security** | No secrets in frontend, input validation, CORS, non-root Docker |
| **Efficiency** | History capped at 10 msgs, multi-stage Docker, lazy Maps load |
| **Testing** | 9 pytest cases: health, chat, validation, error handling |
| **Accessibility** | ARIA roles, skip link, keyboard nav, `aria-live` regions |
| **Google Services** | Vertex AI, Maps JS, Places, Geocoding, Cloud Run, Fonts |

---

## 📋 Assumptions

- Election context is **India-specific** (ECI, EVM, VVPAT, Lok Sabha, EPIC, MCC)
- The assistant is **non-partisan**: explains process only, never recommends parties
- Maps API key should be **HTTP referrer-restricted** in production
