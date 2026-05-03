/**
 * app.js — Application bootstrap.
 * Initialises all components, handles navigation and animations.
 */

const MAPS_API_KEY = "AIzaSyDG6_iT6I2Zfnbbs3ZIBT6beEl2Rf5TkPE";

let wizard, chatAssistant, pollingFinder;

document.addEventListener("DOMContentLoaded", () => {
  wizard = new ElectionWizard();
  chatAssistant = new ChatAssistant();
  pollingFinder = new PollingFinder(MAPS_API_KEY);

  initNavigation();
  initParticles();
  initScrollAnimations();
  loadGoogleMaps();
  initGlossary();
  initFinishModal();
});

// ── Navigation ────────────────────────────────────────────────────────────────
function initNavigation() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  // Sticky navbar shadow on scroll
  window.addEventListener("scroll", () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 40);
    updateActiveNavLink();
  });

  // Hamburger menu for mobile
  hamburger?.addEventListener("click", () => {
    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", String(!expanded));
    navMenu?.classList.toggle("open");
  });

  // Close mobile menu on link click
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu?.classList.remove("open");
      hamburger?.setAttribute("aria-expanded", "false");
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        const offset = 72; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
}

function updateActiveNavLink() {
  const sections = ["hero", "wizard", "chat", "maps", "glossary"];
  const scrollY = window.scrollY + 100;

  sections.forEach((id) => {
    const section = document.getElementById(id);
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!section || !link) return;
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    link.classList.toggle("active", scrollY >= top && scrollY < bottom);
  });
}

// ── Canvas Particle Animation ─────────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? "#FF9933" : "#138808",
    };
  }

  resize();
  window.addEventListener("resize", resize);
  particles = Array.from({ length: PARTICLE_COUNT }, createParticle);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  animate();
}

// ── Scroll Reveal Animations ─────────────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// ── Google Maps Dynamic Load ──────────────────────────────────────────────────
function loadGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    const mapContainer = document.getElementById("map");
    if (mapContainer) mapContainer.innerHTML = `<div class="map-error">⚠️ Maps could not be loaded. Check your network connection.</div>`;
  };
  document.head.appendChild(script);
}

// ── Glossary ─────────────────────────────────────────────────────────────────
function initGlossary() {
  const container = document.getElementById("glossary-list");
  const searchInput = document.getElementById("glossary-search");
  if (!container) return;

  function renderGlossary(filter = "") {
    const terms = filter
      ? KNOWLEDGE_BASE.glossary.filter((g) =>
          g.term.toLowerCase().includes(filter.toLowerCase()) ||
          g.definition.toLowerCase().includes(filter.toLowerCase())
        )
      : KNOWLEDGE_BASE.glossary;

    container.innerHTML = terms.length
      ? terms
          .map(
            (g) => `
          <div class="glossary-card reveal" role="listitem">
            <dt class="glossary-term">${g.term}</dt>
            <dd class="glossary-def">${g.definition}</dd>
          </div>
        `
          )
          .join("")
      : `<p class="no-results">No terms found for "${filter}"</p>`;

    // Re-observe new elements
    document.querySelectorAll(".glossary-card.reveal:not(.revealed)").forEach((el) => {
      el.classList.add("revealed");
    });
  }

  renderGlossary();
  searchInput?.addEventListener("input", (e) => renderGlossary(e.target.value));
}

// ── Finish Modal ──────────────────────────────────────────────────────────────
function initFinishModal() {
  const modal = document.getElementById("finish-modal");
  const closeBtn = document.getElementById("modal-close");

  closeBtn?.addEventListener("click", () => modal?.classList.add("hidden"));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal?.classList.add("hidden");
  });
}
