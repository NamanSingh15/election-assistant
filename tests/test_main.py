"""
Tests for Election Guide Assistant API.
Run: pytest tests/ -v
"""

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

# Patch Vertex AI before importing main to avoid real GCP calls
with patch("vertexai.init"), patch(
    "vertexai.generative_models.GenerativeModel"
):
    from main import app

client = TestClient(app)


# ── Health Endpoint ───────────────────────────────────────────────────────────
class TestHealth:
    def test_health_returns_200(self):
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_response_shape(self):
        data = client.get("/health").json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "model" in data
        assert "project" in data


# ── Chat Endpoint ─────────────────────────────────────────────────────────────
class TestChat:
    def _mock_model(self, response_text: str = "Test response"):
        """Create a mock Vertex AI GenerativeModel."""
        mock_response = MagicMock()
        mock_response.text = response_text

        mock_session = MagicMock()
        mock_session.send_message.return_value = mock_response

        mock_model = MagicMock()
        mock_model.start_chat.return_value = mock_session
        return mock_model

    def test_chat_basic_message(self):
        with patch("main.GenerativeModel", return_value=self._mock_model("Hello!")):
            response = client.post("/api/chat", json={"message": "What is an EVM?"})
        assert response.status_code == 200
        assert response.json()["response"] == "Hello!"

    def test_chat_with_step_context(self):
        with patch("main.GenerativeModel", return_value=self._mock_model("Step info")):
            response = client.post(
                "/api/chat",
                json={"message": "How do I register?", "step": "Voter Registration"},
            )
        assert response.status_code == 200
        assert response.json()["step"] == "Voter Registration"

    def test_chat_with_history(self):
        history = [
            {"role": "user", "content": "What is ECI?"},
            {"role": "assistant", "content": "ECI is the Election Commission of India."},
        ]
        with patch("main.GenerativeModel", return_value=self._mock_model("Continued")):
            response = client.post(
                "/api/chat",
                json={"message": "Tell me more", "history": history},
            )
        assert response.status_code == 200

    def test_chat_empty_message_rejected(self):
        response = client.post("/api/chat", json={"message": ""})
        assert response.status_code == 422  # Validation error

    def test_chat_message_too_long_rejected(self):
        response = client.post("/api/chat", json={"message": "x" * 2001})
        assert response.status_code == 422

    def test_chat_invalid_history_role_rejected(self):
        history = [{"role": "admin", "content": "Hack this"}]
        response = client.post(
            "/api/chat", json={"message": "Hi", "history": history}
        )
        assert response.status_code == 422

    def test_chat_vertex_error_returns_503(self):
        with patch("main.GenerativeModel", side_effect=Exception("GCP error")):
            response = client.post("/api/chat", json={"message": "Hello"})
        assert response.status_code == 503

    def test_chat_history_capped(self):
        """History beyond MAX_HISTORY should still succeed (backend caps it)."""
        history = [
            {"role": "user" if i % 2 == 0 else "assistant", "content": f"msg {i}"}
            for i in range(30)
        ]
        with patch("main.GenerativeModel", return_value=self._mock_model("OK")):
            response = client.post(
                "/api/chat", json={"message": "Hello", "history": history}
            )
        assert response.status_code == 200


# ── Frontend Serving ──────────────────────────────────────────────────────────
class TestFrontend:
    def test_root_returns_html(self):
        response = client.get("/")
        # Either serves index.html (200) or 404 if frontend not built yet
        assert response.status_code in (200, 404)

    def test_api_docs_accessible(self):
        response = client.get("/api/docs")
        assert response.status_code == 200
