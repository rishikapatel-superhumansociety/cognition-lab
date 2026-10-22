/**
 * Simulation 0: Plant Soil Ecosystem & NPK Crisis
 * Domain 1: Bio-Tech & Living Systems
 * Incorporates: First Principles (a), Crisis Management (k), Ethical Radical (c), Physical Build (d)
 */

import { sound } from "../sound.js";

export class PlantNpkSimulation {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.level = 1;
    this.stage = "intro"; // intro | play | crisis | ethical | completed
    this.introTime = 0;
    this.timerSeconds = 15 * 60;
    this.timerInterval = null;
    this.animFrame = null;

    // Nutrient State (0 - 100 ppm)
    this.n = 0; // Nitrogen: Foliage / Chlorophyll
    this.p = 0; // Phosphorus: Root depth & ATP
    this.k = 0; // Potassium: Cell wall rigidity & Stomata

    // Organic bio-buffer available in crisis
    this.bioBuffer = 0;

    // Intro timeline: 0-5s healthy, 5-10s rainstorm, 10-15s collapse
    this.introDuration = 15;
    this.introStep = 0; // 0=healthy, 1=rain, 2=leached
    this.ethicalChoice = null;
    this.isRunning = true;
    this.introTimeout = null;
  }

  mount() {
    this.isRunning = true;
    this.renderLayout();
    this.setupCanvas();
    this.startIntroSequence();
  }

  destroy() {
    this.isRunning = false;
    if (this.introTimeout) clearTimeout(this.introTimeout);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    sound.stopAll();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="sim-stage-split">
        <!-- 70% Left: Botanical Canvas & Dynamic Cellular Callouts -->
        <div class="sim-stage-visual" id="plant-visual-pane">
          <div class="sim-canvas-container">
            <canvas id="plantCanvas" class="sim-canvas"></canvas>
            
            <!-- Dynamic Labels overlaid on anatomical parts -->
            <div id="leaf-label" class="bio-label" style="top: 25%; left: 55%;">
              <span class="status-dot danger"></span>
              <span class="label-text">Leaves: Severe Chlorosis (N: 0ppm)</span>
            </div>
            <div id="stem-label" class="bio-label" style="top: 50%; left: 30%;">
              <span class="status-dot danger"></span>
              <span class="label-text">Cell Walls: Turgor Collapse (K: 0ppm)</span>
            </div>
            <div id="root-label" class="bio-label" style="top: 75%; left: 52%;">
              <span class="status-dot danger"></span>
              <span class="label-text">Roots: Stunted Biomass (P: 0ppm)</span>
            </div>

            <!-- Intro Stage Cinematic Banner -->
            <div id="intro-overlay" style="position:absolute; bottom:20px; left:20px; right:20px; background:rgba(10,15,28,0.9); border:1px solid rgba(56,189,248,0.3); border-radius:12px; padding:1rem 1.5rem; display:flex; align-items:center; justify-content:space-between; backdrop-filter:blur(10px);">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-cyan); font-weight:700; letter-spacing:0.08em;" id="intro-phase-badge">Phase: Healthy Baseline</div>
                <div style="font-size:1.05rem; font-weight:700; color:#fff;" id="intro-phase-text">Initial state: Balanced soil cation equilibrium.</div>
              </div>
              <button id="skip-intro-btn" class="btn btn-subtle" style="font-size:0.75rem;">Skip Cinematic →</button>
            </div>
          </div>
        </div>

        <!-- 30% Right: Telemetry, Timers & Tactical Controls -->
        <div class="sim-stage-controls" id="plant-controls-pane">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Simulated Clock</div>
              <div class="sim-timer-badge" id="sim-timer">15:00</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Level Status</div>
              <span id="level-badge" class="level-chip active">Level 1: Stability</span>
            </div>
          </div>

          <div id="controls-dynamic-area">
            <!-- Populated per level -->
          </div>
        </div>
      </div>
    `;

    document.getElementById("skip-intro-btn").addEventListener("click", () => {
      sound.playClick();
      this.finishIntro();
    });
  }

  setupCanvas() {
    this.canvas = document.getElementById("plantCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.animate();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth * window.devicePixelRatio;
    this.canvas.height = parent.clientHeight * window.devicePixelRatio;
  }

  startIntroSequence() {
    this.stage = "intro";
    this.introTime = 0;
    const overlay = document.getElementById("intro-overlay");
    const phaseBadge = document.getElementById("intro-phase-badge");
    const phaseText = document.getElementById("intro-phase-text");

    const introTick = () => {
      if (this.stage !== "intro") return;
      this.introTime += 1;

      if (this.introTime <= 5) {
        // Healthy state preview
        this.introStep = 0;
        this.n = 50; this.p = 30; this.k = 20;
        phaseBadge.textContent = "00:00 - 00:05 // Healthy Baseline";
        phaseText.textContent = "Healthy plant with optimal N:P:K balance and deep root architecture.";
      } else if (this.introTime <= 10) {
        // Rainstorm strikes
        this.introStep = 1;
        phaseBadge.textContent = "00:05 - 00:10 // Unseasonal Flash Storm";
        phaseBadge.style.color = "#f43f5e";
        phaseText.textContent = "Unseasonal torrential rainfall hits! Water saturates and leaches soil nutrients.";
        if (this.introTime === 6) sound.playAlarm();
      } else if (this.introTime <= 15) {
        // Collapse
        this.introStep = 2;
        this.n = 0; this.p = 0; this.k = 0;
        phaseBadge.textContent = "00:10 - 00:15 // Chemical Collapse";
        phaseText.textContent = "Soil balance destroyed. Severe chlorosis, root stunting, and cellular turgor loss.";
      } else {
        this.finishIntro();
        return;
      }

      this.updateLabels();
      if (this.isRunning) {
        this.introTimeout = setTimeout(introTick, 1000);
      }
    };

    introTick();
  }

  finishIntro() {
    this.stage = "play";
    this.level = 1;
    this.n = 0; this.p = 0; this.k = 0;
    this.timerSeconds = 15 * 60;
    const overlay = document.getElementById("intro-overlay");
    if (overlay) overlay.style.display = "none";
    this.startTimer();
    this.renderLevel1Controls();
    this.updateLabels();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const timerEl = document.getElementById("sim-timer");

    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, "0");
        const secs = (this.timerSeconds % 60).toString().padStart(2, "0");
        timerEl.textContent = `${mins}:${secs}`;
        if (this.timerSeconds <= 60) {
          timerEl.classList.add("urgent");
        }
      } else {
        clearInterval(this.timerInterval);
        sound.playAlarm();
        alert("Time Expired! The plant suffered irreversible cellular senescence. Resetting level.");
        this.resetLevel();
      }
    }, 1000);
  }

  renderLevel1Controls() {
    const area = document.getElementById("controls-dynamic-area");
    area.innerHTML = `
      <div style="background:rgba(56,189,248,0.06); border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:0.85rem; margin-bottom:1.25rem;">
        <div style="font-size:0.8rem; font-weight:700; color:var(--accent-cyan); margin-bottom:0.25rem;">MISSION OBJECTIVE</div>
        <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">
          The torrential storm leached all macronutrients from the root zone. Adjust the raw <strong>Nitrogen (N)</strong>, <strong>Phosphorus (P)</strong>, and <strong>Potassium (K)</strong> ppm sliders to restore ecosystem stability.
        </p>
      </div>

      <!-- Nitrogen Slider -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">Nitrogen (N) - Leaf Chlorophyll</span>
          <span class="control-value" id="val-n">${this.n} ppm</span>
        </div>
        <input type="range" class="slider-range" id="slider-n" min="0" max="100" value="${this.n}">
        <div class="control-hints">
          <span>0 ppm (Chlorosis)</span>
          <span style="color:var(--accent-emerald);">Target: ~50 ppm</span>
          <span>100 ppm (Salt Burn)</span>
        </div>
      </div>

      <!-- Phosphorus Slider -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">Phosphorus (P) - Root Biomass</span>
          <span class="control-value" id="val-p">${this.p} ppm</span>
        </div>
        <input type="range" class="slider-range" id="slider-p" min="0" max="100" value="${this.p}">
        <div class="control-hints">
          <span>0 ppm (Stunted)</span>
          <span style="color:var(--accent-emerald);">Target: ~30 ppm</span>
          <span>100 ppm (Lockout)</span>
        </div>
      </div>

      <!-- Potassium Slider -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">Potassium (K) - Cell Wall Rigidity</span>
          <span class="control-value" id="val-k">${this.k} ppm</span>
        </div>
        <input type="range" class="slider-range" id="slider-k" min="0" max="100" value="${this.k}">
        <div class="control-hints">
          <span>0 ppm (Wilted)</span>
          <span style="color:var(--accent-emerald);">Target: ~20 ppm</span>
          <span>100 ppm (Toxicity)</span>
        </div>
      </div>

      <!-- Validation & Value Card -->
      <button id="submit-value-card-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem; margin-top:0.5rem;">
        Enter Values into Ecosystem Value Card
      </button>

      <div id="feedback-msg" style="margin-top:0.75rem; font-size:0.8rem; text-align:center; min-height:1.2rem;"></div>
    `;

    // Event listeners
    const sliderN = document.getElementById("slider-n");
    const sliderP = document.getElementById("slider-p");
    const sliderK = document.getElementById("slider-k");

    sliderN.addEventListener("input", (e) => {
      this.n = parseInt(e.target.value);
      document.getElementById("val-n").textContent = `${this.n} ppm`;
      sound.playClick();
      this.updateLabels();
    });

    sliderP.addEventListener("input", (e) => {
      this.p = parseInt(e.target.value);
      document.getElementById("val-p").textContent = `${this.p} ppm`;
      sound.playClick();
      this.updateLabels();
    });

    sliderK.addEventListener("input", (e) => {
      this.k = parseInt(e.target.value);
      document.getElementById("val-k").textContent = `${this.k} ppm`;
      sound.playClick();
      this.updateLabels();
    });

    document.getElementById("submit-value-card-btn").addEventListener("click", () => {
      this.validateLevel1();
    });
  }

  validateLevel1() {
    // Target: N ~50 (45-55), P ~30 (26-34), K ~20 (17-23)
    const nOk = this.n >= 45 && this.n <= 55;
    const pOk = this.p >= 26 && this.p <= 34;
    const kOk = this.k >= 17 && this.k <= 23;
    const msgEl = document.getElementById("feedback-msg");

    if (nOk && pOk && kOk) {
      sound.playSuccess();
      msgEl.style.color = "#34d399";
      msgEl.textContent = "Ecosystem Stability Achieved! Opening Value Card...";
      setTimeout(() => this.showLevel1ValueCard(), 600);
    } else {
      sound.playWarning();
      msgEl.style.color = "#f87171";
      let hint = [];
      if (!nOk) hint.push(this.n < 45 ? "Increase Nitrogen for chlorophyll" : "Reduce Nitrogen to avoid fertilizer burn");
      if (!pOk) hint.push(this.p < 26 ? "Increase Phosphorus for root elongation" : "Reduce Phosphorus");
      if (!kOk) hint.push(this.k < 17 ? "Increase Potassium for stomata turgor" : "Reduce Potassium");
      msgEl.textContent = `Imbalance: ${hint.join(" | ")}`;
    }
  }

  showLevel1ValueCard() {
    const modalArea = document.createElement("div");
    modalArea.id = "value-card-popup";
    modalArea.style.cssText = `
      position:fixed; inset:0; background:rgba(5,8,16,0.85); backdrop-filter:blur(10px);
      z-index:250; display:flex; align-items:center; justify-content:center; padding:1.5rem;
    `;
    modalArea.innerHTML = `
      <div class="value-card-modal" style="max-width:500px; width:100%;">
        <div style="text-align:center; margin-bottom:1rem;">
          <div style="font-size:2rem; margin-bottom:0.25rem;"></div>
          <h3 style="font-size:1.35rem; color:#fff;">Ecosystem Value Card</h3>
          <p style="font-size:0.82rem; color:var(--text-muted);">Verified Agronomic Nutrient Formula Settled</p>
        </div>

        <div class="value-card-grid">
          <div class="value-card-cell">
            <div class="label">Nitrogen (N)</div>
            <div class="val" style="color:#38bdf8;">${this.n} ppm</div>
            <div style="font-size:0.68rem; color:var(--text-faint); margin-top:0.2rem;">Foliage Vigor</div>
          </div>
          <div class="value-card-cell">
            <div class="label">Phosphorus (P)</div>
            <div class="val" style="color:#34d399;">${this.p} ppm</div>
            <div style="font-size:0.68rem; color:var(--text-faint); margin-top:0.2rem;">Root Architecture</div>
          </div>
          <div class="value-card-cell">
            <div class="label">Potassium (K)</div>
            <div class="val" style="color:#f59e0b;">${this.k} ppm</div>
            <div style="font-size:0.68rem; color:var(--text-faint); margin-top:0.2rem;">Cell Rigidity</div>
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:0.85rem; margin-bottom:1.25rem; font-size:0.8rem; color:var(--text-muted); line-height:1.4;">
          <strong>First-Principles Audit:</strong> N:P:K stoichiometry at 5:3:2 creates an optimal nitrogen assimilation rate without cation antagonism in loamy soil.
        </div>

        <button id="advance-level-2-btn" class="btn btn-accent" style="width:100%; justify-content:center; padding:0.8rem;">
          Proceed to Level 2: The Crisis →
        </button>
      </div>
    `;

    document.body.appendChild(modalArea);
    document.getElementById("advance-level-2-btn").addEventListener("click", () => {
      sound.playClick();
      modalArea.remove();
      this.startLevel2Crisis();
    });
  }

  startLevel2Crisis() {
    this.level = 2;
    this.k = 0; // Locked at 0 due to rainfall
    this.n = 20;
    this.p = 20;
    this.bioBuffer = 0;
    this.timerSeconds = 10 * 60; // 10 minutes timer
    sound.playAlarm();

    const levelBadge = document.getElementById("level-badge");
    levelBadge.textContent = "Level 2: The Crisis";
    levelBadge.className = "level-chip active";
    levelBadge.style.background = "#e11d48";
    levelBadge.style.borderColor = "#f43f5e";

    this.renderLevel2Controls();
    this.updateLabels();
  }

  renderLevel2Controls() {
    const area = document.getElementById("controls-dynamic-area");
    area.innerHTML = `
      <div class="crisis-banner">
        <span class="crisis-icon">!</span>
        <div>
          <h4>Method (k) Blind-Variable Crisis</h4>
          <p>Unseasonal torrential cloudburst! Soluble potassium has leached completely from the subsoil. <strong>The Potassium (K) supply slider is permanently locked at 0 ppm!</strong></p>
        </div>
      </div>

      <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:1.25rem; line-height:1.4;">
        Under zero chemical potassium, you must counterbalance osmotic pressure using a specialized <strong>Nitrogen-Phosphorus ratio</strong> and introduce an <strong>Organic Bio-Buffer Amendment</strong> to prevent irreversible wilt within 10 minutes.
      </p>

      <!-- Nitrogen Slider -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">Nitrogen (N) Adjustment</span>
          <span class="control-value" id="val-n-l2">${this.n} ppm</span>
        </div>
        <input type="range" class="slider-range" id="slider-n-l2" min="0" max="100" value="${this.n}">
        <div class="control-hints">
          <span>0 ppm</span>
          <span style="color:var(--accent-emerald);">Compensatory Target: ~40 ppm</span>
          <span>100 ppm</span>
        </div>
      </div>

      <!-- Phosphorus Slider -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">Phosphorus (P) Adjustment</span>
          <span class="control-value" id="val-p-l2">${this.p} ppm</span>
        </div>
        <input type="range" class="slider-range" id="slider-p-l2" min="0" max="100" value="${this.p}">
        <div class="control-hints">
          <span>0 ppm</span>
          <span style="color:var(--accent-emerald);">Compensatory Target: ~45 ppm</span>
          <span>100 ppm</span>
        </div>
      </div>

      <!-- Potassium Slider (LOCKED) -->
      <div class="control-group" style="opacity:0.6; position:relative;">
        <div class="control-header">
          <span class="control-title">Potassium (K) - LEACHED & LOCKED</span>
          <span class="control-value" style="color:#ef4444;">0 ppm [LOCKED]</span>
        </div>
        <input type="range" class="slider-range" disabled min="0" max="100" value="0">
        <div class="control-hints">
          <span style="color:#f87171;">Unseasonal rain leached 100% of soluble K</span>
        </div>
      </div>

      <!-- Organic Bio-Buffer Amendment -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">Organic Bio-Buffer Amendment</span>
          <span class="control-value" id="val-bio">${this.bioBuffer}%</span>
        </div>
        <input type="range" class="slider-range" id="slider-bio" min="0" max="100" value="${this.bioBuffer}">
        <div class="control-hints">
          <span>0% (Raw soil)</span>
          <span style="color:var(--accent-emerald);">Target: 50% - 70%</span>
          <span>100%</span>
        </div>
      </div>

      <button id="submit-scorecard-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem; margin-top:0.5rem;">
        Settle Crisis Scorecard
      </button>

      <div id="feedback-msg-l2" style="margin-top:0.75rem; font-size:0.8rem; text-align:center; min-height:1.2rem;"></div>
    `;

    document.getElementById("slider-n-l2").addEventListener("input", (e) => {
      this.n = parseInt(e.target.value);
      document.getElementById("val-n-l2").textContent = `${this.n} ppm`;
      sound.playClick();
      this.updateLabels();
    });

    document.getElementById("slider-p-l2").addEventListener("input", (e) => {
      this.p = parseInt(e.target.value);
      document.getElementById("val-p-l2").textContent = `${this.p} ppm`;
      sound.playClick();
      this.updateLabels();
    });

    document.getElementById("slider-bio").addEventListener("input", (e) => {
      this.bioBuffer = parseInt(e.target.value);
      document.getElementById("val-bio").textContent = `${this.bioBuffer}%`;
      sound.playClick();
      this.updateLabels();
    });

    document.getElementById("submit-scorecard-btn").addEventListener("click", () => {
      this.validateLevel2();
    });
  }

  validateLevel2() {
    // Under K=0, optimal survival requires: N ~40 (35-45), P ~45 (40-50), Bio-Buffer >= 50%
    const nOk = this.n >= 35 && this.n <= 45;
    const pOk = this.p >= 40 && this.p <= 50;
    const bioOk = this.bioBuffer >= 50 && this.bioBuffer <= 75;
    const msgEl = document.getElementById("feedback-msg-l2");

    if (nOk && pOk && bioOk) {
      sound.playSuccess();
      msgEl.style.color = "#34d399";
      msgEl.textContent = "Crisis Overcome! Biological resilience established.";
      setTimeout(() => this.showLevel2Scorecard(), 600);
    } else {
      sound.playWarning();
      msgEl.style.color = "#f87171";
      let hint = [];
      if (!nOk) hint.push("Rebalance Nitrogen to ~40 ppm");
      if (!pOk) hint.push("Elevate Phosphorus to ~45 ppm for root ATP");
      if (!bioOk) hint.push("Increase Organic Bio-Buffer to 50%-75%");
      msgEl.textContent = `Crisis unresolved: ${hint.join(" | ")}`;
    }
  }

  showLevel2Scorecard() {
    const modalArea = document.createElement("div");
    modalArea.id = "scorecard-popup";
    modalArea.style.cssText = `
      position:fixed; inset:0; background:rgba(5,8,16,0.85); backdrop-filter:blur(10px);
      z-index:250; display:flex; align-items:center; justify-content:center; padding:1.5rem;
    `;
    modalArea.innerHTML = `
      <div class="value-card-modal" style="max-width:520px; width:100%;">
        <div style="text-align:center; margin-bottom:1rem;">
          <div style="font-size:2rem; margin-bottom:0.25rem;"></div>
          <h3 style="font-size:1.35rem; color:#fff;">Crisis Resilience Scorecard</h3>
          <p style="font-size:0.82rem; color:var(--text-muted);">Method (k) Blind-Variable Solved</p>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:1rem; margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem;">
            <span style="color:var(--text-muted);">Nutrient Shock Survival:</span>
            <strong style="color:#34d399;">94% Tissue Viability</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem;">
            <span style="color:var(--text-muted);">Bio-Buffer Cation Protection:</span>
            <strong style="color:var(--accent-cyan);">Active (${this.bioBuffer}%)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
            <span style="color:var(--text-muted);">Response Time:</span>
            <strong style="color:#fff;">${Math.floor((10*60 - this.timerSeconds) / 60)}m ${(10*60 - this.timerSeconds) % 60}s</strong>
          </div>
        </div>

        <button id="advance-level-3-btn" class="btn btn-accent" style="width:100%; justify-content:center; padding:0.8rem;">
          Proceed to Level 3: Ethical Radical →
        </button>
      </div>
    `;

    document.body.appendChild(modalArea);
    document.getElementById("advance-level-3-btn").addEventListener("click", () => {
      sound.playClick();
      modalArea.remove();
      this.startLevel3Ethical();
    });
  }

  startLevel3Ethical() {
    this.level = 3;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const levelBadge = document.getElementById("level-badge");
    levelBadge.textContent = "Level 3: Ethical Radical";
    levelBadge.className = "level-chip active";
    levelBadge.style.background = "#8b5cf6";
    levelBadge.style.borderColor = "#a855f7";

    const controlsArea = document.getElementById("controls-dynamic-area");
    controlsArea.innerHTML = `
      <div style="background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3); border-radius:8px; padding:1rem; margin-bottom:1.25rem;">
        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-purple); font-weight:700; letter-spacing:0.06em;">Method (c) Ethical Radical</div>
        <h4 style="font-size:0.95rem; color:#fff; margin:0.3rem 0;">Severe Flash Rot in Storage Warehouse</h4>
        <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.4;">
          The moisture from the unseasonal rains has infiltrated the community granary. <strong>Flash fungal rot has destroyed all crop stores except for one remaining sealed grain bag.</strong>
        </p>
      </div>

      <div style="background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.3); border-radius:8px; padding:0.85rem; margin-bottom:1.25rem; font-size:0.82rem; color:#fca5a5;">
        <strong>Critical Dilemma:</strong> Your choice will affect human lives. You can only save one vulnerable group with this final bag of grain. There is no mathematical "right" or "wrong" answer.
      </div>

      <div class="ethical-deck">
        <div class="ethical-card" id="card-infants">
          <div class="ethical-card-icon">1</div>
          <h3>Save 5 Infants</h3>
          <p>Allocate grain for emergency nutritional milk/paste. High developmental vulnerability, entire lifespan ahead.</p>
        </div>

        <div class="ethical-card" id="card-elders">
          <div class="ethical-card-icon">2</div>
          <h3>Save 5 Elders</h3>
          <p>Allocate grain for senior community knowledge-bearers, agricultural custodians, and family pillars.</p>
        </div>
      </div>

      <div style="margin-bottom:1.25rem;">
        <label style="font-size:0.75rem; text-transform:uppercase; color:var(--text-faint); font-weight:700;">Record Your Ethical Rationale (First-Principles Thinking)</label>
        <textarea id="ethical-reasoning" class="verify-input" rows="3" placeholder="Explain your decision framework: Utilitarian lifespan vs Deontological duty of care..."></textarea>
      </div>

      <button id="finalize-simulation-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem;" disabled>
        Finalize Ethical Decision & Complete Simulation
      </button>
    `;

    const cardInfants = document.getElementById("card-infants");
    const cardElders = document.getElementById("card-elders");
    const reasonInput = document.getElementById("ethical-reasoning");
    const finalizeBtn = document.getElementById("finalize-simulation-btn");

    const checkReady = () => {
      finalizeBtn.disabled = !(this.ethicalChoice && reasonInput.value.trim().length >= 10);
    };

    cardInfants.addEventListener("click", () => {
      sound.playClick();
      this.ethicalChoice = "infants";
      cardInfants.classList.add("selected");
      cardElders.classList.remove("selected");
      checkReady();
    });

    cardElders.addEventListener("click", () => {
      sound.playClick();
      this.ethicalChoice = "elders";
      cardElders.classList.add("selected");
      cardInfants.classList.remove("selected");
      checkReady();
    });

    reasonInput.addEventListener("input", checkReady);

    finalizeBtn.addEventListener("click", () => {
      sound.playSuccess();
      this.completeSimulation(reasonInput.value.trim());
    });
  }

  completeSimulation(rationale) {
    this.stage = "completed";
    const modalArea = document.createElement("div");
    modalArea.style.cssText = `
      position:fixed; inset:0; background:rgba(5,8,16,0.9); backdrop-filter:blur(12px);
      z-index:300; display:flex; align-items:center; justify-content:center; padding:1.5rem;
    `;
    modalArea.innerHTML = `
      <div class="value-card-modal" style="max-width:580px; width:100%; text-align:left;">
        <div style="text-align:center; margin-bottom:1.5rem;">
          <div style="font-size:2.5rem; margin-bottom:0.25rem;"></div>
          <h2 style="font-size:1.5rem; color:#fff;">Plant Soil Ecosystem Mastered</h2>
          <p style="font-size:0.85rem; color:var(--accent-cyan);">Curriculum Loop: 4 Criteria & 4 Revolutionary Methods Cleared</p>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:1rem; margin-bottom:1.25rem; font-size:0.85rem;">
          <div style="margin-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Ethical Alignment Choice:</span>
            <strong style="color:#fff; text-transform:capitalize;"> Allocated to 5 ${this.ethicalChoice}</strong>
          </div>
          <div style="color:var(--text-muted); font-size:0.8rem; font-style:italic; border-left:2px solid var(--accent-purple); padding-left:0.75rem;">
            "${rationale}"
          </div>
        </div>

        <div class="physical-brief-box" style="margin-bottom:1.5rem;">
          <div class="physical-brief-header">
            
            <span>NEXT 50%: Classroom Physical Build Project</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.6rem;">
            Digital simulation complete! You are now prepared to build the <strong>Closed-Loop Hydroponic Wick Column</strong> with physical pH & NPK chemical titrants in the lab.
          </p>
          <button id="view-lab-brief-btn" class="btn btn-subtle" style="font-size:0.75rem; padding:0.4rem 0.8rem;">
            Open Classroom Physical Lab Brief
          </button>
        </div>

        <div style="display:flex; gap:0.75rem;">
          <button id="exit-sim-btn" class="btn btn-primary" style="flex:1; justify-content:center; padding:0.8rem;">
            Return to Mission Command
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalArea);
    document.getElementById("view-lab-brief-btn").addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("open-physical-brief", { detail: "sim-plant-npk" }));
    });
    document.getElementById("exit-sim-btn").addEventListener("click", () => {
      modalArea.remove();
      if (this.onComplete) this.onComplete();
    });
  }

  updateLabels() {
    const leafLabel = document.getElementById("leaf-label");
    const stemLabel = document.getElementById("stem-label");
    const rootLabel = document.getElementById("root-label");
    if (!leafLabel || !stemLabel || !rootLabel) return;

    // Leaf Nitrogen status
    if (this.n < 30) {
      leafLabel.innerHTML = `<span class="status-dot danger"></span>Leaves: Chlorosis / Yellowing (N: ${this.n}ppm)`;
    } else if (this.n > 75) {
      leafLabel.innerHTML = `<span class="status-dot danger"></span>Leaves: Tip Scorch / Salt Burn (N: ${this.n}ppm)`;
    } else {
      leafLabel.innerHTML = `<span class="status-dot healthy"></span>Leaves: Lush Dark Chlorophyll (N: ${this.n}ppm)`;
    }

    // Stem / Cell Wall Potassium status
    const effectiveK = this.k + this.bioBuffer * 0.3;
    if (effectiveK < 15) {
      stemLabel.innerHTML = `<span class="status-dot danger"></span>Stem: Turgor Collapse (K: ${this.k}ppm)`;
    } else if (effectiveK < 25) {
      stemLabel.innerHTML = `<span class="status-dot warning"></span>Stem: Mild Osmotic Strain (K: ${this.k}ppm)`;
    } else {
      stemLabel.innerHTML = `<span class="status-dot healthy"></span>Stem: Rigid Cellulose Stomata Stable`;
    }

    // Root Phosphorus status
    if (this.p < 20) {
      rootLabel.innerHTML = `<span class="status-dot danger"></span>Roots: Stunted Biomass (P: ${this.p}ppm)`;
    } else if (this.p > 70) {
      rootLabel.innerHTML = `<span class="status-dot warning"></span>Roots: Excess Salinity Stunting (P: ${this.p}ppm)`;
    } else {
      rootLabel.innerHTML = `<span class="status-dot healthy"></span>Roots: Deep Taproot & Lateral Hairs (P: ${this.p}ppm)`;
    }
  }

  animate() {
    this.drawPlant();
    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  drawPlant() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Soil boundary at 65% height
    const soilY = h * 0.62;

    // Sky Background
    if (this.stage === "intro" && this.introStep === 1) {
      // Storm sky
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, w, soilY);

      // Rain animation
      ctx.strokeStyle = "rgba(147, 197, 253, 0.4)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 60; i++) {
        const rx = (Math.sin(i * 99 + Date.now() * 0.005) * 0.5 + 0.5) * w;
        const ry = ((i * 37 + Date.now() * 0.8) % soilY);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 16);
        ctx.stroke();
      }
    } else {
      // Clear atmospheric glow
      const skyGrad = ctx.createLinearGradient(0, 0, 0, soilY);
      skyGrad.addColorStop(0, "#080e1c");
      skyGrad.addColorStop(1, "#0d1b2a");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, soilY);
    }

    // Soil Horizon
    const soilGrad = ctx.createLinearGradient(0, soilY, 0, h);
    if (this.stage === "intro" && this.introStep === 1) {
      soilGrad.addColorStop(0, "#3d2b1f"); // Muddy flooded
      soilGrad.addColorStop(1, "#21160e");
    } else {
      soilGrad.addColorStop(0, "#2c1d11");
      soilGrad.addColorStop(1, "#191009");
    }
    ctx.fillStyle = soilGrad;
    ctx.fillRect(0, soilY, w, h - soilY);

    // Soil line highlight
    ctx.strokeStyle = "rgba(180, 110, 60, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, soilY);
    ctx.lineTo(w, soilY);
    ctx.stroke();

    const plantX = w * 0.48;

    // 1. Draw Roots (Governed by Phosphorus: this.p)
    const rootLength = Math.max(30, (this.p / 100) * (h * 0.32) + 20);
    const rootBranching = Math.max(2, Math.floor((this.p / 100) * 8));
    ctx.strokeStyle = "#e2d9cc";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(plantX, soilY);
    ctx.quadraticCurveTo(plantX + 10, soilY + rootLength * 0.5, plantX, soilY + rootLength);
    ctx.stroke();

    // Lateral Root Branches
    for (let r = 1; r <= rootBranching; r++) {
      const branchY = soilY + (rootLength / (rootBranching + 1)) * r;
      const spread = (this.p / 100) * 80 + 20;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plantX, branchY);
      ctx.quadraticCurveTo(plantX - spread * 0.6, branchY + 15, plantX - spread, branchY + 30);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(plantX, branchY + 10);
      ctx.quadraticCurveTo(plantX + spread * 0.6, branchY + 20, plantX + spread, branchY + 35);
      ctx.stroke();
    }

    // 2. Draw Stem (Governed by Potassium: this.k and bioBuffer)
    const effectiveK = this.k + this.bioBuffer * 0.3;
    const stemDroop = Math.max(0, (25 - effectiveK) * 1.5);
    const stemHeight = h * 0.32;
    const stemTopX = plantX + (stemDroop > 0 ? stemDroop * 2 : 0);
    const stemTopY = soilY - stemHeight + stemDroop;

    ctx.strokeStyle = effectiveK > 15 ? "#4ade80" : "#a3e635";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(plantX, soilY);
    ctx.bezierCurveTo(
      plantX, soilY - stemHeight * 0.5,
      stemTopX - 10, stemTopY + 30,
      stemTopX, stemTopY
    );
    ctx.stroke();

    // 3. Draw Leaves (Governed by Nitrogen: this.n)
    // Leaf color shift: yellow (chlorosis) -> vibrant emerald -> dark scorched
    let leafColor = "#eab308"; // Default chlorosis yellow
    if (this.n >= 40 && this.n <= 65) {
      leafColor = "#22c55e"; // Healthy green
    } else if (this.n > 65) {
      leafColor = "#15803d"; // Dark green / burn
    } else if (this.n > 20) {
      leafColor = "#84cc16"; // Yellow-green
    }

    const leafScale = Math.max(0.4, Math.min(1.2, this.n / 50));

    // Left leaf
    this.drawLeaf(ctx, stemTopX - 15, stemTopY + 40, -0.6, leafColor, leafScale);
    // Right leaf
    this.drawLeaf(ctx, stemTopX + 15, stemTopY + 70, 0.7, leafColor, leafScale);
    // Top Left leaf
    this.drawLeaf(ctx, stemTopX - 10, stemTopY + 10, -0.3, leafColor, leafScale * 0.85);
    // Top Right leaf
    this.drawLeaf(ctx, stemTopX + 10, stemTopY + 20, 0.4, leafColor, leafScale * 0.85);
    // Apex terminal shoot
    this.drawLeaf(ctx, stemTopX, stemTopY - 10, 0, leafColor, leafScale * 0.7);
  }

  drawLeaf(ctx, x, y, angle, color, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(40, -25, 70, 0);
    ctx.quadraticCurveTo(40, 25, 0, 0);
    ctx.fill();

    // Leaf vein
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();

    ctx.restore();
  }
}
