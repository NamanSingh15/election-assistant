/**
 * chat.js
 * AI chat interface — calls /api/chat (Vertex AI Gemini backend).
 * Maintains conversation history and renders messages with markdown support.
 */

class ChatAssistant {
  constructor() {
    this.history = [];
    this.currentContext = null;
    this.isLoading = false;
    this.messagesEl = document.getElementById("chat-messages");
    this.inputEl = document.getElementById("chat-input");
    this.sendBtn = document.getElementById("chat-send");
    this.contextBadge = document.getElementById("chat-context-badge");

    this.bindEvents();
    this.renderWelcome();
    this.renderQuickQuestions();
  }

  bindEvents() {
    this.sendBtn?.addEventListener("click", () => this.sendFromInput());
    this.inputEl?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendFromInput();
      }
    });
    // Auto-resize textarea
    this.inputEl?.addEventListener("input", () => {
      this.inputEl.style.height = "auto";
      this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 120) + "px";
    });
  }

  updateContext(stepTitle) {
    this.currentContext = stepTitle;
    if (this.contextBadge) {
      if (stepTitle) {
        this.contextBadge.textContent = `Context: ${stepTitle}`;
        this.contextBadge.classList.remove("hidden");
      } else {
        this.contextBadge.classList.add("hidden");
      }
    }
  }

  renderWelcome() {
    this.addBotMessage(
      "🙏 **Namaste! I'm ElectionGuide AI.**\n\nI'm here to help you understand every step of the Indian democratic election process — from voter registration to result declaration.\n\nFeel free to ask me anything about elections, or use the timeline on the left to follow along step by step!"
    );
  }

  renderQuickQuestions() {
    const container = document.getElementById("quick-questions");
    if (!container) return;
    container.innerHTML = KNOWLEDGE_BASE.quickQuestions
      .map(
        (q) => `
        <button class="quick-q-chip"
                onclick="chatAssistant.askQuestion('${q.replace(/'/g, "\\'")}')"
                aria-label="Ask: ${q}">
          ${q}
        </button>
      `
      )
      .join("");
  }

  sendFromInput() {
    const text = this.inputEl?.value?.trim();
    if (!text || this.isLoading) return;
    this.inputEl.value = "";
    this.inputEl.style.height = "auto";
    this.askQuestion(text);
  }

  askQuestion(text) {
    if (!text || this.isLoading) return;

    // Scroll chat into view if not visible
    document.getElementById("chat")?.scrollIntoView({ behavior: "smooth", block: "nearest" });

    this.addUserMessage(text);
    this.sendToAPI(text);
  }

  addUserMessage(text) {
    this.history.push({ role: "user", content: text });
    this.appendMessage("user", text);
  }

  addBotMessage(text) {
    this.history.push({ role: "assistant", content: text });
    this.appendMessage("assistant", text);
  }

  appendMessage(role, text) {
    if (!this.messagesEl) return;

    const msgEl = document.createElement("div");
    msgEl.className = `chat-message ${role}`;
    msgEl.setAttribute("role", "article");
    msgEl.setAttribute("aria-label", `${role === "user" ? "You" : "ElectionGuide AI"} said`);

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = this.renderMarkdown(text);

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    msgEl.appendChild(bubble);
    msgEl.appendChild(time);
    this.messagesEl.appendChild(msgEl);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    if (!this.messagesEl) return;
    const indicator = document.createElement("div");
    indicator.id = "typing-indicator";
    indicator.className = "chat-message assistant";
    indicator.setAttribute("aria-label", "ElectionGuide AI is typing");
    indicator.setAttribute("aria-live", "polite");
    indicator.innerHTML = `
      <div class="message-bubble typing-bubble">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>`;
    this.messagesEl.appendChild(indicator);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    document.getElementById("typing-indicator")?.remove();
  }

  async sendToAPI(text) {
    this.isLoading = true;
    this.sendBtn && (this.sendBtn.disabled = true);
    this.showTypingIndicator();

    // Build history excluding the last user message (already added)
    const historyToSend = this.history.slice(0, -1);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyToSend,
          step: this.currentContext,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      this.removeTypingIndicator();
      this.addBotMessage(data.response);
    } catch (err) {
      this.removeTypingIndicator();
      this.addBotMessage(
        `⚠️ **I'm having trouble connecting right now.**\n\nError: ${err.message}\n\nPlease try again in a moment, or visit [eci.gov.in](https://eci.gov.in) for official information.`
      );
    } finally {
      this.isLoading = false;
      this.sendBtn && (this.sendBtn.disabled = false);
      this.inputEl?.focus();
    }
  }

  renderMarkdown(text) {
    // Lightweight markdown: bold, italic, links, line breaks, lists
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" aria-label="$1 (opens in new tab)">$1</a>')
      .replace(/^### (.+)$/gm, "<h4>$1</h4>")
      .replace(/^## (.+)$/gm, "<h3>$1</h3>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^(.+)$/, "<p>$1</p>");
  }

  scrollToBottom() {
    if (this.messagesEl) {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
  }

  clearHistory() {
    this.history = [];
    if (this.messagesEl) this.messagesEl.innerHTML = "";
    this.renderWelcome();
  }
}
