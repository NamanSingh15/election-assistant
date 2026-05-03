"""
Election Guide Assistant — Backend API

Auth strategy:
  - Local dev  : GEMINI_API_KEY in .env  → uses google.genai with API key
  - Cloud Run  : No API key needed       → uses google.genai with Vertex AI ADC
"""

import logging
import os
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, validator

# Load .env for local development (no-op on Cloud Run)
load_dotenv()

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── Configuration ─────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")          # local dev
MAPS_API_KEY   = os.getenv("MAPS_API_KEY", "")         # served via /api/config
PROJECT_ID     = os.getenv("GCP_PROJECT_ID", "namans-project-495216")
LOCATION       = os.getenv("GCP_LOCATION",   "us-central1")
MODEL_ID       = os.getenv("GEMINI_MODEL",   "gemini-2.5-flash")
MAX_HISTORY    = 10

# ── AI Backend Selection ──────────────────────────────────────────────────────
from google import genai
from google.genai import types as genai_types

if GEMINI_API_KEY:
    # ── Gemini Developer API (local / API-key auth) ───────────────────────────
    ai_client = genai.Client(api_key=GEMINI_API_KEY)
    USE_VERTEX = False
    logger.info("Auth mode: Gemini API key  |  Model: %s", MODEL_ID)
else:
    # ── Vertex AI (Cloud Run with ADC / service account) ─────────────────────
    ai_client = genai.Client(
        vertexai=True,
        project=PROJECT_ID,
        location=LOCATION,
    )
    USE_VERTEX = True
    logger.info("Auth mode: Vertex AI ADC  |  project=%s  model=%s", PROJECT_ID, MODEL_ID)

# ── FastAPI ───────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Election Guide Assistant",
    description="AI-powered guide to understanding democratic elections in India.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# ── System Prompt ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are ElectionGuide AI — an expert, non-partisan assistant \
helping Indian citizens understand the democratic election process.

## Knowledge Areas
**Voter Registration**: NVSP portal (voterportal.eci.gov.in), EPIC/Voter ID, \
eligibility (18+, Indian citizen), Booth Level Officers, electoral rolls, \
registration deadlines (~10 weeks before election).

**Election Commission of India (ECI)**: Constitutional body (Articles 324-329), \
Model Code of Conduct (MCC), Chief Election Commissioner, election schedule.

**Types of Elections**: Lok Sabha (543 constituencies, 5-year term), \
Vidhan Sabha (state assemblies), Rajya Sabha (indirect), Local Body, By-elections.

**Election Timeline**:
1. ECI announces schedule → MCC activated
2. Voter list finalised
3. Nominations filed & scrutinised
4. Campaign period (~2 weeks)
5. 48-hour silence period before polling
6. Polling Day — EVMs + VVPAT
7. Vote counting & result declaration
8. Oath-taking ceremony

**Voting Process**: Bring Voter ID (EPIC) or 12 approved alternatives, biometric \
verification, mark EVM, VVPAT slip, indelible ink on finger, NOTA option.

**Candidate Rules**: Form 2B nomination, expenditure limits \
(₹95 lakh Lok Sabha / ₹40 lakh state), mandatory affidavit disclosures.

**Voter Rights**: Secret ballot, no coercion, 1950 helpline, PwD facilities, \
National Grievance Portal.

## Response Guidelines
- Non-partisan, factual, encouraging civic participation
- Explain acronyms (ECI, EVM, VVPAT, NOTA, EPIC, MCC) when first used
- Direct to eci.gov.in or 1950 helpline for official queries
- Keep responses concise yet complete

## Current User Context
{step_context}"""

# ── Pydantic Models ───────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., min_length=1, max_length=5000)

    @validator("role")
    def role_must_be_valid(cls, v: str) -> str:
        if v not in ("user", "assistant"):
            raise ValueError("role must be 'user' or 'assistant'")
        return v


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[Message] = Field(default_factory=list)
    step: Optional[str] = Field(None, max_length=200)


class ChatResponse(BaseModel):
    response: str
    step: Optional[str] = None


class ConfigResponse(BaseModel):
    mapsApiKey: str


class HealthResponse(BaseModel):
    status: str
    service: str
    model: str
    auth_mode: str


# ── API Routes ────────────────────────────────────────────────────────────────
@app.get("/api/config", response_model=ConfigResponse, tags=["Config"])
async def get_config():
    """Returns public runtime config — Maps API key served server-side from env."""
    return ConfigResponse(mapsApiKey=MAPS_API_KEY)


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Liveness probe for Cloud Run."""
    return HealthResponse(
        status="healthy",
        service="Election Guide Assistant",
        model=MODEL_ID,
        auth_mode="gemini-api-key" if not USE_VERTEX else "vertex-ai-adc",
    )


@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Send a message to ElectionGuide AI.
    Uses Gemini API key locally; Vertex AI ADC on Cloud Run.
    """
    try:
        step_context = (
            f"User is on wizard step: '{request.step}'. Tailor response to this step."
            if request.step
            else "User is exploring the election guide generally."
        )
        full_system_prompt = SYSTEM_PROMPT.format(step_context=step_context)
        capped_history = request.history[-MAX_HISTORY:]

        # Build conversation history for google.genai SDK
        genai_history = [
            genai_types.Content(
                role="user" if m.role == "user" else "model",
                parts=[genai_types.Part(text=m.content)],
            )
            for m in capped_history
        ]

        # Single SDK path — api_key vs Vertex AI is handled by ai_client init
        chat_session = ai_client.chats.create(
            model=MODEL_ID,
            config=genai_types.GenerateContentConfig(
                system_instruction=full_system_prompt,
                temperature=0.7,
                max_output_tokens=1024,
            ),
            history=genai_history,
        )
        response = chat_session.send_message(request.message)
        reply = response.text

        logger.info("Response generated | step='%s' | mode=%s | chars=%d",
                    request.step, "gemini-api" if not USE_VERTEX else "vertex", len(reply))
        return ChatResponse(response=reply, step=request.step)

    except Exception as exc:
        logger.error("AI error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=503,
            detail="AI service temporarily unavailable. Please try again.",
        )


# ── Static Frontend ───────────────────────────────────────────────────────────
FRONTEND_DIR = Path(__file__).parent / "frontend"

if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR)), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_root():
        return FileResponse(str(FRONTEND_DIR / "index.html"))

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIR / "index.html"))
