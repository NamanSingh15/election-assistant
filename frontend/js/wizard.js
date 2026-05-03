/**
 * wizard.js
 * 6-step interactive election timeline wizard.
 * Reads from KNOWLEDGE_BASE, persists progress to localStorage.
 */

class ElectionWizard {
  constructor() {
    this.currentStep = parseInt(localStorage.getItem("wizardStep") || "1", 10);
    this.completedSteps = JSON.parse(localStorage.getItem("completedSteps") || "[]");
    this.container = document.getElementById("wizard-container");
    this.stepContent = document.getElementById("step-content");
    this.render();
  }

  save() {
    localStorage.setItem("wizardStep", this.currentStep);
    localStorage.setItem("completedSteps", JSON.stringify(this.completedSteps));
  }

  getCurrentStepData() {
    return KNOWLEDGE_BASE.steps.find((s) => s.id === this.currentStep);
  }

  getCurrentStepTitle() {
    const step = this.getCurrentStepData();
    return step ? step.title : null;
  }

  render() {
    this.renderProgress();
    this.renderStepContent();
  }

  renderProgress() {
    const progressContainer = document.getElementById("wizard-progress");
    if (!progressContainer) return;

    progressContainer.innerHTML = KNOWLEDGE_BASE.steps
      .map((step) => {
        const isActive = step.id === this.currentStep;
        const isDone = this.completedSteps.includes(step.id);
        return `
          <div class="progress-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}"
               onclick="wizard.goToStep(${step.id})"
               role="button"
               tabindex="0"
               aria-label="Step ${step.id}: ${step.title}"
               aria-current="${isActive ? "step" : "false"}"
               onkeydown="if(event.key==='Enter'||event.key===' ')wizard.goToStep(${step.id})">
            <div class="step-bubble" style="--step-color: ${step.color}">
              ${isDone ? "✓" : step.icon}
            </div>
            <span class="step-label">${step.title}</span>
          </div>
          ${step.id < KNOWLEDGE_BASE.steps.length ? '<div class="step-connector"></div>' : ""}
        `;
      })
      .join("");
  }

  renderStepContent() {
    if (!this.stepContent) return;
    const step = this.getCurrentStepData();
    if (!step) return;

    const isDone = this.completedSteps.includes(step.id);

    this.stepContent.innerHTML = `
      <div class="step-card" style="--step-color: ${step.color}" role="region" aria-label="Step ${step.id}: ${step.title}">
        <div class="step-card-header">
          <div class="step-icon-large" aria-hidden="true">${step.icon}</div>
          <div class="step-card-meta">
            <span class="step-badge">Step ${step.id} of ${KNOWLEDGE_BASE.steps.length}</span>
            <h2 class="step-title">${step.title}</h2>
            <p class="step-subtitle">${step.subtitle}</p>
          </div>
        </div>

        <p class="step-description">${step.description}</p>

        <div class="step-checklist">
          <h3>Action Checklist</h3>
          <ul role="list">
            ${step.checklist
              .map(
                (item, i) => `
              <li class="checklist-item" role="listitem">
                <input type="checkbox" id="check-${step.id}-${i}" 
                       class="check-input" aria-label="${item}"
                       ${isDone ? "checked" : ""}>
                <label for="check-${step.id}-${i}">${item}</label>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>

        <div class="step-tips">
          <h3>💡 Tips</h3>
          <ul role="list">
            ${step.tips.map((t) => `<li>${t}</li>`).join("")}
          </ul>
        </div>

        <div class="step-actions">
          <button class="btn-ask-ai" onclick="chatAssistant.askQuestion('${step.quickQuestion.replace(/'/g, "\\'")}')"
                  aria-label="Ask AI about this step">
            🤖 Ask AI About This Step
          </button>
          <div class="step-nav">
            ${step.id > 1 ? `<button class="btn-nav" onclick="wizard.goToStep(${step.id - 1})" aria-label="Previous step">← Previous</button>` : ""}
            ${
              step.id < KNOWLEDGE_BASE.steps.length
                ? `<button class="btn-nav btn-primary-nav" onclick="wizard.completeAndNext(${step.id})" aria-label="Mark complete and go to next step">
                    Mark Complete & Next →
                  </button>`
                : `<button class="btn-nav btn-finish" onclick="wizard.finish()" aria-label="Finish wizard">
                    🎉 I'm Ready to Vote!
                  </button>`
            }
          </div>
        </div>
      </div>
    `;
  }

  goToStep(n) {
    this.currentStep = n;
    this.save();
    this.render();
    document.getElementById("wizard")?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Notify chat of context change
    if (typeof chatAssistant !== "undefined") {
      chatAssistant.updateContext(this.getCurrentStepTitle());
    }
  }

  completeAndNext(stepId) {
    if (!this.completedSteps.includes(stepId)) {
      this.completedSteps.push(stepId);
    }
    this.goToStep(Math.min(stepId + 1, KNOWLEDGE_BASE.steps.length));
  }

  finish() {
    if (!this.completedSteps.includes(6)) this.completedSteps.push(6);
    this.save();
    this.renderProgress();
    document.getElementById("finish-modal")?.classList.remove("hidden");
  }

  reset() {
    this.currentStep = 1;
    this.completedSteps = [];
    this.save();
    this.render();
  }
}
