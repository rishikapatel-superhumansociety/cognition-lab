/**
 * Cognition Lab - Core Application Controller
 */

import { CURRICULUM } from "./data/curriculum.js";
import { PHYSICAL_PROJECTS } from "./data/physical-projects.js";
import { sound } from "./sound.js";
import { HeroMotionController } from "./hero-motion.js";

// Import all 6 simulation suites
import { PlantNpkSimulation } from "./simulations/plant-npk.js";
import { HeartPumpSimulation } from "./simulations/heart-pump.js";
import { BridgeBuilderSimulation } from "./simulations/bridge-builder.js";
import { UrbanHeatSimulation } from "./simulations/urban-heat.js";
import { MandiArbitrageSimulation } from "./simulations/mandi-arbitrage.js";
import { RansomwareSimulation } from "./simulations/ransomware.js";

class CognitionLabApp {
  constructor() {
    this.activeView = "none"; // "none" | "explore" | "domain-missions" | "our-domains"
    this.selectedDomainId = null;
    this.currentSimulation = null;
    this.currentSimId = null;
    this.heroMotion = null;
    this.simClasses = {
      "sim-plant-npk": PlantNpkSimulation,
      "sim-heart-pump": HeartPumpSimulation,
      "sim-bridge-builder": BridgeBuilderSimulation,
      "sim-urban-heat": UrbanHeatSimulation,
      "sim-mandi-arbitrage": MandiArbitrageSimulation,
      "sim-ransomware": RansomwareSimulation
    };
  }

  init() {
    this.renderCriteria();
    this.setupEventListeners();
    this.setupModals();
    this.initHeroMotion();
  }

  initHeroMotion() {
    try {
      this.heroMotion = new HeroMotionController();
      this.heroMotion.init();
    } catch (e) {
      console.warn("HeroMotionController initialization:", e);
    }
  }

  // 1. Render the 4 Core Criteria on the Home Page
  renderCriteria() {
    const grid = document.getElementById("criteria-grid");
    if (!grid) return;

    grid.innerHTML = CURRICULUM.criteria.map(c => `
      <div class="criterion-card" style="--card-accent: ${c.color}; --card-glow: ${c.color}30;">
        <div class="card-specular-shine"></div>
        <div class="criterion-header">
          <div class="criterion-icon-badge">
            <span class="criterion-icon">${c.icon}</span>
          </div>
          <h3 class="criterion-title">${c.name}</h3>
        </div>
        <p class="criterion-desc">${c.description}</p>
      </div>
    `).join("");

    if (this.heroMotion && typeof this.heroMotion.attachCardListeners === "function") {
      this.heroMotion.attachCardListeners();
    }
  }

  setupEventListeners() {
    // Two Primary CTA Buttons
    const btnExplore = document.getElementById("btn-explore-missions");
    const btnDomains = document.getElementById("btn-our-domains");

    if (btnExplore) {
      btnExplore.addEventListener("click", () => {
        sound.playClick();
        this.showExploreMissions();
      });
    }

    if (btnDomains) {
      btnDomains.addEventListener("click", () => {
        sound.playClick();
        this.showOurDomains();
      });
    }

    // Audio toggle button
    const audioBtn = document.getElementById("audio-toggle-btn");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        const enabled = sound.toggle();
        audioBtn.textContent = enabled ? "🔊 Sound FX: ON" : "🔇 Sound FX: OFF";
        audioBtn.classList.toggle("btn-accent", enabled);
        audioBtn.classList.toggle("btn-subtle", !enabled);
      });
    }

    // Brand click resets to clean Home view
    const brand = document.getElementById("nav-brand");
    if (brand) {
      brand.addEventListener("click", () => {
        this.resetToHome();
      });
    }

    // Cockpit Navigation
    const exitCockpitBtn = document.getElementById("exit-sim-cockpit-btn");
    if (exitCockpitBtn) {
      exitCockpitBtn.addEventListener("click", () => {
        sound.playClick();
        this.exitSimulation();
      });
    }

    const cockpitPhysicalBtn = document.getElementById("cockpit-physical-brief-btn");
    if (cockpitPhysicalBtn) {
      cockpitPhysicalBtn.addEventListener("click", () => {
        if (this.currentSimId) {
          sound.playClick();
          this.openPhysicalModal(this.currentSimId);
        }
      });
    }

    // Global event listener for opening physical briefs
    window.addEventListener("open-physical-brief", (e) => {
      this.openPhysicalModal(e.detail);
    });
  }

  // 2. Explore Missions: Domain Selection Flow
  showExploreMissions() {
    this.activeView = "explore";
    this.selectedDomainId = null;

    const btnExplore = document.getElementById("btn-explore-missions");
    const btnDomains = document.getElementById("btn-our-domains");
    if (btnExplore) btnExplore.classList.add("active");
    if (btnDomains) btnDomains.classList.remove("active");

    const container = document.getElementById("interactive-exploration-container");
    if (!container) return;

    container.innerHTML = `
      <div class="interactive-view-wrapper">
        <div class="explore-missions-header">
          <div class="explore-kicker">// SIMULATION MISSIONS</div>
          <h2 class="explore-title">Which domain do you wish to explore?</h2>
          <p class="explore-subtitle">
            Select any of the 5 curriculum domains below to view and launch active video-game crisis simulations.
          </p>
        </div>

        <div class="domain-picker-grid">
          ${CURRICULUM.domains.map(d => {
            const missions = CURRICULUM.missions.filter(m => m.domainId === d.id);
            const count = missions.length;
            const icon = d.id === "domain-1" ? "🌿" :
                         d.id === "domain-2" ? "🌉" :
                         d.id === "domain-3" ? "🏙️" :
                         d.id === "domain-4" ? "📈" : "🛡️";

            return `
              <div class="domain-pick-card" data-domain-id="${d.id}" style="--domain-color: ${d.color}; --domain-glow: ${d.color}33;">
                <span class="domain-pick-badge">DOMAIN 0${d.number}</span>
                <div class="domain-pick-icon">${icon}</div>
                <h3 class="domain-pick-name">${d.name}</h3>
                <div class="domain-pick-meta">${count} ${count === 1 ? 'Mission' : 'Missions'} Available</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Wire clicks on domain pick cards
    container.querySelectorAll(".domain-pick-card").forEach(card => {
      card.addEventListener("click", (e) => {
        sound.playClick();
        const domainId = e.currentTarget.dataset.domainId;
        this.showDomainMissions(domainId);
      });
    });

    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // 3. Display Missions under Selected Domain
  showDomainMissions(domainId) {
    this.activeView = "domain-missions";
    this.selectedDomainId = domainId;

    const domain = CURRICULUM.domains.find(d => d.id === domainId);
    if (!domain) return;

    const missions = CURRICULUM.missions.filter(m => m.domainId === domainId);
    const container = document.getElementById("interactive-exploration-container");
    if (!container) return;

    const icon = domain.id === "domain-1" ? "🌿" :
                 domain.id === "domain-2" ? "🌉" :
                 domain.id === "domain-3" ? "🏙️" :
                 domain.id === "domain-4" ? "📈" : "🛡️";

    container.innerHTML = `
      <div class="interactive-view-wrapper domain-missions-wrapper">
        <div class="domain-missions-nav-bar">
          <button id="back-to-domains-btn" class="btn btn-subtle" style="font-size:0.85rem; padding:0.5rem 1.2rem; border-radius:9999px;">
            ← Back to Domains
          </button>
          <div class="domain-missions-info">
            <span class="domain-missions-icon">${icon}</span>
            <div>
              <span style="font-family:var(--font-mono); font-size:0.72rem; color:${domain.color}; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;">
                DOMAIN 0${domain.number}
              </span>
              <h2 class="domain-missions-title">${domain.name}</h2>
            </div>
          </div>
        </div>

        <div class="sim-grid">
          ${missions.map(m => {
            const missionIcon = m.id === "sim-plant-npk" ? "🌿" :
                                m.id === "sim-heart-pump" ? "🫀" :
                                m.id === "sim-bridge-builder" ? "🌉" :
                                m.id === "sim-urban-heat" ? "🏙️" :
                                m.id === "sim-mandi-arbitrage" ? "📈" : "🛡️";

            return `
              <div class="sim-card" data-sim-id="${m.id}">
                <div class="sim-card-banner">
                  <span class="sim-domain-badge" style="color:${domain.color};">D${domain.number}</span>
                  <div class="sim-banner-art">${missionIcon}</div>
                </div>
                <div class="sim-card-body">
                  <div class="sim-meta-kicker">// SIMULATION LAB / V1.0</div>
                  <h3 class="sim-title">${m.title}</h3>
                  <div class="sim-domain-subheading" style="color:${domain.color};">
                    ${m.domainName}
                  </div>
                  <div class="sim-subjects">
                    ${m.subjects.map(s => `<span class="subject-tag">${s}</span>`).join("")}
                  </div>
                  <p class="sim-desc">${m.summary}</p>
                  
                  <div class="sim-meta-block">
                    <div class="meta-row">
                      <span class="meta-label">ACTIVE 10 METHODS:</span>
                      <div class="meta-methods">
                        ${m.activeMethods.map(code => {
                          const method = CURRICULUM.methods.find(me => me.code === code);
                          return `<span class="method-code-badge" title="${method ? method.name : code}">${code}</span>`;
                        }).join("")}
                      </div>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">LAB DURATION:</span>
                      <span class="meta-time-val">${m.durationMinutes} MIN</span>
                    </div>
                  </div>

                  <div class="sim-card-actions">
                    <button class="btn btn-primary launch-sim-btn" data-sim-id="${m.id}" style="width:100%; justify-content:center;">
                      🕹️ Launch Simulation
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Wire back to domains button
    const backBtn = document.getElementById("back-to-domains-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        sound.playClick();
        this.showExploreMissions();
      });
    }

    // Wire launch simulation buttons
    container.querySelectorAll(".launch-sim-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const simId = e.currentTarget.dataset.simId;
        this.launchSimulation(simId);
      });
    });

    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // 4. Our Domains: Show List of Domain Names directly & Select to View Subjects
  showOurDomains() {
    this.activeView = "our-domains";
    this.selectedDomainId = null;

    const btnExplore = document.getElementById("btn-explore-missions");
    const btnDomains = document.getElementById("btn-our-domains");
    if (btnDomains) btnDomains.classList.add("active");
    if (btnExplore) btnExplore.classList.remove("active");

    const container = document.getElementById("interactive-exploration-container");
    if (!container) return;

    container.innerHTML = `
      <div class="interactive-view-wrapper">
        <div class="our-domains-header">
          <div class="our-domains-title-block">
            <div class="our-domains-kicker">// INTERDISCIPLINARY CURRICULUM ARCHITECTURE</div>
            <h2 class="our-domains-title">Our Domains</h2>
          </div>
          <button id="back-to-home-btn" class="btn btn-subtle" style="font-size:0.85rem; padding:0.55rem 1.25rem; border-radius:9999px;">
            ← Back to Home Page
          </button>
        </div>

        <!-- Directly show the list of just the domain names -->
        <div class="our-domains-name-grid">
          ${CURRICULUM.domains.map((d, index) => {
            const icon = d.id === "domain-1" ? "🌿" :
                         d.id === "domain-2" ? "🌉" :
                         d.id === "domain-3" ? "🏙️" :
                         d.id === "domain-4" ? "📈" : "🛡️";

            return `
              <div class="domain-name-item" data-domain-id="${d.id}" style="--domain-idx: ${index}; --domain-color: ${d.color}; --domain-glow: ${d.color}26;">
                <div class="domain-name-item-left">
                  <span class="domain-name-icon">${icon}</span>
                  <div>
                    <span class="domain-name-badge">DOMAIN 0${d.number}</span>
                    <h3 class="domain-name-text">${d.name}</h3>
                  </div>
                </div>
                <div class="domain-name-item-arrow">
                  <span>View Subjects</span>
                  <span class="arrow-icon">→</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Wire Back to Home button
    const backBtn = document.getElementById("back-to-home-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        sound.playClick();
        this.resetToHome();
      });
    }

    // Wire selecting a particular domain name to show its subjects
    container.querySelectorAll(".domain-name-item").forEach(item => {
      item.addEventListener("click", (e) => {
        sound.playClick();
        const domainId = e.currentTarget.dataset.domainId;
        this.showDomainSubjects(domainId);
      });
    });

    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // 5. Show the names of all the subjects under the selected domain
  showDomainSubjects(domainId) {
    this.activeView = "domain-subjects";
    this.selectedDomainId = domainId;

    const domain = CURRICULUM.domains.find(d => d.id === domainId);
    if (!domain) return;

    const container = document.getElementById("interactive-exploration-container");
    if (!container) return;

    const icon = domain.id === "domain-1" ? "🌿" :
                 domain.id === "domain-2" ? "🌉" :
                 domain.id === "domain-3" ? "🏙️" :
                 domain.id === "domain-4" ? "📈" : "🛡️";

    container.innerHTML = `
      <div class="interactive-view-wrapper domain-subjects-view">
        <div class="domain-subjects-top-bar">
          <button id="back-to-domains-list-btn" class="btn btn-subtle" style="font-size:0.85rem; padding:0.55rem 1.25rem; border-radius:9999px;">
            ← Back to Domains
          </button>
          <button id="back-to-home-from-sub-btn" class="btn btn-subtle" style="font-size:0.85rem; padding:0.55rem 1.25rem; border-radius:9999px;">
            ← Back to Home Page
          </button>
        </div>

        <div class="domain-subjects-header-card" style="--domain-color: ${domain.color}; --domain-glow: ${domain.color}26;">
          <div class="domain-subjects-title-row">
            <span class="domain-subjects-icon">${icon}</span>
            <div>
              <span class="domain-name-badge" style="color:${domain.color};">DOMAIN 0${domain.number}</span>
              <h2 class="domain-subjects-title">${domain.name}</h2>
            </div>
          </div>

          <div class="domain-subjects-section-title">
            <span>📚</span>
            <span>SUBJECTS TAUGHT UNDER THIS DOMAIN (${domain.subjects.length}):</span>
          </div>

          <div class="subjects-cards-grid">
            ${domain.subjects.map((subject, sIdx) => `
              <div class="animated-subject-card" style="--subject-idx: ${sIdx}; --domain-color: ${domain.color}; --domain-glow: ${domain.color}26;">
                <span class="subject-card-icon">📖</span>
                <span class="subject-card-name">${subject}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    // Wire Back to Domains list button
    const backDomainsBtn = document.getElementById("back-to-domains-list-btn");
    if (backDomainsBtn) {
      backDomainsBtn.addEventListener("click", () => {
        sound.playClick();
        this.showOurDomains();
      });
    }

    // Wire Back to Home Page button
    const backHomeBtn = document.getElementById("back-to-home-from-sub-btn");
    if (backHomeBtn) {
      backHomeBtn.addEventListener("click", () => {
        sound.playClick();
        this.resetToHome();
      });
    }

    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // 5. Reset to clean Home state
  resetToHome() {
    if (this.currentSimulation) {
      this.exitSimulation();
    }
    sound.stopAll();
    this.activeView = "none";
    this.selectedDomainId = null;

    const btnExplore = document.getElementById("btn-explore-missions");
    const btnDomains = document.getElementById("btn-our-domains");
    if (btnExplore) btnExplore.classList.remove("active");
    if (btnDomains) btnDomains.classList.remove("active");

    const container = document.getElementById("interactive-exploration-container");
    if (container) container.innerHTML = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 6. Launch Simulation Cockpit
  launchSimulation(simId) {
    sound.playSuccess();
    const mission = CURRICULUM.missions.find(m => m.id === simId);
    if (!mission) return;

    this.currentSimId = simId;
    const viewport = document.getElementById("simulation-viewport");
    const stage = document.getElementById("sim-stage-container");
    const titleEl = document.getElementById("cockpit-sim-title");
    const domainEl = document.getElementById("cockpit-sim-domain");

    titleEl.textContent = mission.title;
    domainEl.textContent = mission.domainName;

    // Reset cockpit tabs
    const tabSim = document.getElementById("cockpit-tab-sim");
    const tabDeconstruct = document.getElementById("cockpit-tab-deconstruct");
    const deconstructPane = document.getElementById("sim-deconstruction-pane");

    if (tabSim && tabDeconstruct && deconstructPane) {
      tabSim.classList.add("active");
      tabDeconstruct.classList.remove("active");
      stage.style.display = "block";
      deconstructPane.style.display = "none";
    }

    // Destroy existing simulation if running
    if (this.currentSimulation && this.currentSimulation.destroy) {
      this.currentSimulation.destroy();
    }

    viewport.classList.add("active");
    stage.innerHTML = "";

    const SimClass = this.simClasses[simId];
    if (SimClass) {
      this.currentSimulation = new SimClass(stage, () => {
        this.exitSimulation();
      });
      this.currentSimulation.mount();
    }
  }

  exitSimulation() {
    sound.stopAll();
    if (this.currentSimulation && this.currentSimulation.destroy) {
      this.currentSimulation.destroy();
      this.currentSimulation = null;
    }
    sound.stopAll();
    const viewport = document.getElementById("simulation-viewport");
    viewport.classList.remove("active");

    // Re-render current view if needed
    if (this.selectedDomainId) {
      this.showDomainMissions(this.selectedDomainId);
    }
  }

  setupModals() {
    const curriculumModal = document.getElementById("curriculum-modal");
    const physicalModal = document.getElementById("physical-modal");

    document.querySelectorAll(".modal-close-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        sound.playClick();
        curriculumModal.classList.remove("active");
        physicalModal.classList.remove("active");
      });
    });

    // Backdrop click close
    [curriculumModal, physicalModal].forEach(modal => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });
    });
  }

  openCurriculumModal() {
    const modal = document.getElementById("curriculum-modal");
    const body = document.getElementById("curriculum-modal-body");

    body.innerHTML = `
      <div class="curriculum-section-title">
        <span>🏆</span>
        <span>The 4 Core Criteria of Cognition</span>
      </div>
      <div class="criteria-list">
        ${CURRICULUM.criteria.map(c => `
          <div class="criteria-item">
            <div style="display:flex; align-items:center; gap:0.5rem; color:${c.color}; font-weight:700; margin-bottom:0.35rem;">
              <span>${c.icon}</span>
              <span>${c.name}</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">${c.description}</p>
          </div>
        `).join("")}
      </div>

      <div class="curriculum-section-title">
        <span>⚡</span>
        <span>The 10 Revolutionary Teaching Methods</span>
      </div>
      <div class="methods-grid">
        ${CURRICULUM.methods.map(m => `
          <div class="method-item">
            <div class="method-item-header">
              <span class="method-code-badge">${m.code}</span>
              <span style="color:#fff;">${m.name}</span>
            </div>
            <div style="font-size:0.72rem; color:var(--accent-cyan); margin-bottom:0.25rem;">${m.tagline}</div>
            <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">${m.description}</p>
          </div>
        `).join("")}
      </div>

      <div class="curriculum-section-title">
        <span>🌐</span>
        <span>The 5 Interdisciplinary Domains</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:0.85rem;">
        ${CURRICULUM.domains.map(d => `
          <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:0.85rem;">
            <div style="color:${d.color}; font-weight:700; font-size:0.85rem; margin-bottom:0.35rem;">Domain ${d.number}: ${d.name}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${d.subjects.join(" • ")}</div>
          </div>
        `).join("")}
      </div>
    `;

    modal.classList.add("active");
  }

  openPhysicalModal(filterSimId) {
    const modal = document.getElementById("physical-modal");
    const body = document.getElementById("physical-modal-body");

    const simKeys = filterSimId ? [filterSimId] : Object.keys(PHYSICAL_PROJECTS);

    body.innerHTML = `
      <div style="margin-bottom:1.5rem;">
        <div class="badge-pill" style="margin-bottom:0.5rem;">THE 50% DUAL-MODEL FRAMEWORK</div>
        <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.5;">
          The video game simulation is 50% of the learning loop. After students conquer the digital crisis, they transition directly into the physical lab to design, engineer, and validate real hardware and chemical models.
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:1.75rem;">
        ${simKeys.map(key => {
          const p = PHYSICAL_PROJECTS[key];
          if (!p) return "";
          return `
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(16,185,129,0.3); border-radius:12px; padding:1.5rem;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                <div>
                  <span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--accent-emerald);">${p.domain}</span>
                  <h3 style="font-size:1.2rem; color:#fff; margin-top:0.2rem;">${p.projectTitle}</h3>
                  <div style="font-size:0.78rem; color:var(--text-faint);">Paired with Digital: <strong>${p.simTitle}</strong></div>
                </div>
                <span class="level-chip" style="background:rgba(16,185,129,0.15); color:#34d399; border-color:rgba(16,185,129,0.4);">${p.duration}</span>
              </div>

              <!-- Materials -->
              <div style="margin-bottom:1rem;">
                <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--accent-cyan); margin-bottom:0.4rem;">📦 Physical Materials Required</div>
                <ul class="physical-brief-list">
                  ${p.materials.map(m => `<li>${m}</li>`).join("")}
                </ul>
              </div>

              <!-- Protocol Steps -->
              <div style="margin-bottom:1rem;">
                <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--accent-amber); margin-bottom:0.4rem;">⚙️ Engineering & Build Protocol</div>
                <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.8rem; color:var(--text-muted);">
                  ${p.engineeringProtocol.map(step => `
                    <div style="background:rgba(0,0,0,0.25); padding:0.5rem 0.75rem; border-radius:6px; border-left:3px solid var(--accent-emerald);">${step}</div>
                  `).join("")}
                </div>
              </div>

              <!-- First Principles Connection -->
              <div style="background:rgba(56,189,248,0.05); border:1px solid rgba(56,189,248,0.2); border-radius:8px; padding:0.85rem; font-size:0.8rem;">
                <strong style="color:var(--accent-cyan);">🧠 First-Principles Cognitive Connection:</strong>
                <span style="color:var(--text-muted); margin-left:0.25rem;">${p.firstPrinciplesConnection}</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    modal.classList.add("active");
  }
}

// Instantiate on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new CognitionLabApp();
  app.init();
});
