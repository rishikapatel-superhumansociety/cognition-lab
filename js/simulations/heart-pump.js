/**
 * Mission 1: Bio-Mimicry Heart Pump Design
 * Domain 1: Bio-Tech & Living Systems
 * Incorporates: First Principles (a), Bio-Mimicry Auditing (j), Synthesis (b), Project-Based Learning (d)
 */

import { sound } from "../sound.js";

export class HeartPumpSimulation {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.level = 1;
    this.modelType = "human"; // human (4 chamber) | fish (2 chamber) | frog (3 chamber)

    // Hemodynamic Parameters
    this.heartRate = 72; // 60 - 180 BPM
    this.strokeVolume = 70; // 50 - 120 mL
    this.blockage = 0; // 0%, 50%, 80% stenosis

    this.animFrame = null;
    this.phase = 0; // Contraction phase (0 to 2*PI)
    this.particles = [];
    this.lastBeatTime = 0;

    // 25-Minute Mission Timer
    this.timerSeconds = 25 * 60;
    this.timerInterval = null;
    this.isRunning = true;
    this.beatTimeout = null;
  }

  mount() {
    this.isRunning = true;
    this.renderLayout();
    this.setupCanvas();
    this.initParticles();
    this.renderControls();
    this.startBeatLoop();
    this.startTimer();
  }

  destroy() {
    this.isRunning = false;
    if (this.beatTimeout) clearTimeout(this.beatTimeout);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.timerInterval) clearInterval(this.timerInterval);
    sound.stopAll();
  }

  startTimer() {
    const timerEl = document.getElementById("heart-timer");
    if (!timerEl) return;
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, "0");
        const secs = (this.timerSeconds % 60).toString().padStart(2, "0");
        timerEl.textContent = `${mins}:${secs}`;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="sim-stage-split">
        <!-- 70% Left: Anatomical Heart & Fluid Dynamics -->
        <div class="sim-stage-visual" id="heart-visual-pane">
          <div class="sim-canvas-container">
            <canvas id="heartCanvas" class="sim-canvas"></canvas>

            <!-- Bio-Mimicry Model Selector Bar -->
            <div style="position:absolute; top:15px; left:15px; display:flex; gap:0.5rem; background:rgba(15,23,42,0.85); backdrop-filter:blur(8px); padding:0.4rem; border-radius:8px; border:1px solid var(--border-subtle); z-index:10;">
              <button id="model-human-btn" class="filter-chip active">Human (4-Chamber)</button>
              <button id="model-fish-btn" class="filter-chip">Fish (2-Chamber)</button>
              <button id="model-frog-btn" class="filter-chip">Amphibian (3-Chamber)</button>
            </div>

            <!-- Real-time Pressure & Flow Telemetry Overlay -->
            <div style="position:absolute; bottom:20px; left:20px; right:20px; background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:0.85rem 1.25rem; display:flex; justify-content:space-between; align-items:center; backdrop-filter:blur(10px);">
              <div>
                <div style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; font-weight:700;">Cardiac Output (CO = HR × SV)</div>
                <div style="font-family:var(--font-mono); font-size:1.4rem; font-weight:800; color:var(--accent-cyan);" id="co-display">5.04 <span style="font-size:0.8rem; color:var(--text-muted);">L/min</span></div>
              </div>
              <div>
                <div style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; font-weight:700;">Derived Blood Pressure</div>
                <div style="font-family:var(--font-mono); font-size:1.4rem; font-weight:800; color:#fff;" id="bp-display">120 / 80 <span style="font-size:0.8rem; color:var(--text-muted);">mmHg</span></div>
              </div>
              <div>
                <div style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; font-weight:700;">Vascular Resistance</div>
                <div style="font-family:var(--font-mono); font-size:1.4rem; font-weight:800; color:#f59e0b;" id="resistance-display">1.00 <span style="font-size:0.8rem; color:var(--text-muted);">dyn·s/cm⁵</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 30% Right: Hemodynamic Controls & Embedded Quizzes -->
        <div class="sim-stage-controls" id="heart-controls-pane">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Mission Phase</div>
              <span id="heart-level-badge" class="level-chip active">Level 1: Calibration</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <div class="sim-timer-badge" id="heart-timer" style="font-size:0.85rem; padding:0.25rem 0.65rem;">25:00</div>
              <button id="theory-btn" class="btn btn-subtle" style="font-size:0.75rem; padding:0.35rem 0.7rem;">
                Mini-Lecture
              </button>
            </div>
          </div>

          <div id="heart-controls-area">
            <!-- Dynamic Controls and Quizzes -->
          </div>
        </div>
      </div>
    `;

    document.getElementById("model-human-btn").addEventListener("click", () => this.switchModel("human"));
    document.getElementById("model-fish-btn").addEventListener("click", () => this.switchModel("fish"));
    document.getElementById("model-frog-btn").addEventListener("click", () => this.switchModel("frog"));
    document.getElementById("theory-btn").addEventListener("click", () => this.showTheoryModal());
  }

  setupCanvas() {
    this.canvas = document.getElementById("heartCanvas");
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

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        t: Math.random(),
        type: i % 2 === 0 ? "oxygenated" : "deoxygenated",
        speed: 0.003 + Math.random() * 0.002
      });
    }
  }

  switchModel(type) {
    sound.playClick();
    this.modelType = type;
    document.getElementById("model-human-btn").classList.toggle("active", type === "human");
    document.getElementById("model-fish-btn").classList.toggle("active", type === "fish");
    document.getElementById("model-frog-btn").classList.toggle("active", type === "frog");
    this.updateTelemetry();
  }

  startBeatLoop() {
    this.isRunning = true;
    const checkBeat = () => {
      if (!this.isRunning) return;
      const now = Date.now();
      const intervalMs = (60 / this.heartRate) * 1000;
      if (now - this.lastBeatTime >= intervalMs) {
        sound.playHeartbeat(1.0);
        this.lastBeatTime = now;
      }
      this.beatTimeout = setTimeout(checkBeat, 50);
    };
    checkBeat();
  }

  renderControls() {
    const area = document.getElementById("heart-controls-area");
    area.innerHTML = `
      <!-- Heart Rate Control -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">Heart Rate (HR)</span>
          <span class="control-value" id="val-hr">${this.heartRate} BPM</span>
        </div>
        <input type="range" class="slider-range" id="slider-hr" min="60" max="180" value="${this.heartRate}">
        <div class="control-hints">
          <span>60 BPM (Resting)</span>
          <span>120 BPM (Aerobic)</span>
          <span>180 BPM (Max Sprint)</span>
        </div>
      </div>

      <!-- Stroke Volume Control -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">Stroke Volume (SV)</span>
          <span class="control-value" id="val-sv">${this.strokeVolume} mL</span>
        </div>
        <input type="range" class="slider-range" id="slider-sv" min="50" max="120" value="${this.strokeVolume}">
        <div class="control-hints">
          <span>50 mL (Sedentary)</span>
          <span>70 mL (Normal)</span>
          <span>120 mL (Endurance Athlete)</span>
        </div>
      </div>

      <!-- Coronary Arterial Stenosis -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">Arterial Stenosis / Blockage</span>
          <span class="control-value" id="val-blockage">${this.blockage}%</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; margin-top:0.4rem;">
          <button id="block-0" class="btn btn-subtle ${this.blockage === 0 ? 'active' : ''}" style="justify-content:center; font-size:0.75rem;">Normal (0%)</button>
          <button id="block-50" class="btn btn-subtle ${this.blockage === 50 ? 'active' : ''}" style="justify-content:center; font-size:0.75rem;">50% Block</button>
          <button id="block-80" class="btn btn-subtle ${this.blockage === 80 ? 'active' : ''}" style="justify-content:center; font-size:0.75rem; color:#f87171;">80% Critical</button>
        </div>
      </div>

      <!-- Progressive Challenge / Embedded Quiz Section -->
      <div id="quiz-container" style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:1rem; margin-top:1rem;">
        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-cyan); font-weight:700; margin-bottom:0.4rem;" id="quiz-header">
          Level 1 Challenge: Rest to Sprint
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.4; margin-bottom:0.75rem;" id="quiz-prompt">
          An athlete begins an intense 400m sprint. Oxygen consumption triples, requiring a Cardiac Output of at least <strong>12.0 L/min</strong>. Adjust HR and SV to hit this target safely!
        </p>
        <button id="verify-quiz-btn" class="btn btn-primary" style="width:100%; justify-content:center; font-size:0.8rem;">
          Verify Cardiac Equilibrium
        </button>
        <div id="quiz-feedback" style="font-size:0.78rem; text-align:center; margin-top:0.5rem; min-height:1.2rem;"></div>
      </div>
    `;

    document.getElementById("slider-hr").addEventListener("input", (e) => {
      this.heartRate = parseInt(e.target.value);
      document.getElementById("val-hr").textContent = `${this.heartRate} BPM`;
      this.updateTelemetry();
    });

    document.getElementById("slider-sv").addEventListener("input", (e) => {
      this.strokeVolume = parseInt(e.target.value);
      document.getElementById("val-sv").textContent = `${this.strokeVolume} mL`;
      this.updateTelemetry();
    });

    document.getElementById("block-0").addEventListener("click", () => this.setBlockage(0));
    document.getElementById("block-50").addEventListener("click", () => this.setBlockage(50));
    document.getElementById("block-80").addEventListener("click", () => this.setBlockage(80));

    document.getElementById("verify-quiz-btn").addEventListener("click", () => this.verifyChallenge());
    this.updateTelemetry();
  }

  setBlockage(val) {
    sound.playClick();
    this.blockage = val;
    document.getElementById("val-blockage").textContent = `${val}%`;
    ["0", "50", "80"].forEach(b => {
      const btn = document.getElementById(`block-${b}`);
      if (btn) btn.classList.toggle("active", parseInt(b) === val);
    });
    this.updateTelemetry();
  }

  updateTelemetry() {
    const co = (this.heartRate * this.strokeVolume) / 1000;
    // Poiseuille's law approximation for vascular resistance: R increases exponentially with blockage
    const rFactor = 1 / Math.pow(1 - (this.blockage / 100) * 0.7, 4);
    const meanArterial = Math.round(co * 16 * rFactor);
    const systolic = Math.round(meanArterial * 1.25);
    const diastolic = Math.round(meanArterial * 0.85);

    const coEl = document.getElementById("co-display");
    const bpEl = document.getElementById("bp-display");
    const resEl = document.getElementById("resistance-display");

    if (coEl) coEl.innerHTML = `${co.toFixed(2)} <span style="font-size:0.8rem; color:var(--text-muted);">L/min</span>`;
    if (bpEl) {
      bpEl.innerHTML = `${systolic} / ${diastolic} <span style="font-size:0.8rem; color:var(--text-muted);">mmHg</span>`;
      if (systolic > 160 || diastolic > 100) {
        bpEl.style.color = "#f43f5e";
      } else {
        bpEl.style.color = "#fff";
      }
    }
    if (resEl) resEl.innerHTML = `${rFactor.toFixed(2)} <span style="font-size:0.8rem; color:var(--text-muted);">dyn·s/cm⁵</span>`;
  }

  verifyChallenge() {
    const co = (this.heartRate * this.strokeVolume) / 1000;
    const feedback = document.getElementById("quiz-feedback");

    if (this.level === 1) {
      if (co >= 12.0 && co <= 16.0) {
        sound.playSuccess();
        feedback.style.color = "#34d399";
        feedback.textContent = "Target Cleared! Sprint cardiac output achieved without hypertensive crisis.";
        setTimeout(() => this.advanceToLevel2(), 800);
      } else {
        sound.playWarning();
        feedback.style.color = "#f87171";
        feedback.textContent = `Current CO is ${co.toFixed(2)} L/min. You need at least 12.0 L/min! Increase HR or SV.`;
      }
    } else if (this.level === 2) {
      // Level 2: Stenosis compensation
      if (this.blockage >= 50 && co >= 6.0 && this.heartRate <= 130) {
        sound.playSuccess();
        feedback.style.color = "#34d399";
        feedback.textContent = "Stenosis Compensated! Deep stroke volume maintained output without tachycardia.";
        setTimeout(() => this.advanceToLevel3(), 800);
      } else {
        sound.playWarning();
        feedback.style.color = "#f87171";
        feedback.textContent = "Elevate Stroke Volume to sustain >=6.0 L/min while keeping HR under 130 BPM under blockage!";
      }
    } else if (this.level === 3) {
      sound.playSuccess();
      feedback.style.color = "#34d399";
      feedback.textContent = "Bio-mimicry audit successfully completed!";
      this.completeMission();
    }
  }

  advanceToLevel2() {
    this.level = 2;
    document.getElementById("heart-level-badge").textContent = "Level 2: Stenosis Shock";
    document.getElementById("quiz-header").textContent = "Level 2 Challenge: Arterial Blockage";
    document.getElementById("quiz-prompt").innerHTML = `
      A <strong>50% arterial stenosis</strong> strikes. Vascular resistance spikes.
      Stabilize Cardiac Output to <strong>>= 6.0 L/min</strong> while preventing resting tachycardia (keep Heart Rate <= 130 BPM).
    `;
    this.setBlockage(50);
  }

  advanceToLevel3() {
    this.level = 3;
    document.getElementById("heart-level-badge").textContent = "Level 3: Bio-Mimicry Audit";
    document.getElementById("quiz-header").textContent = "Level 3: Nature-to-Tech Bio-Audit";
    document.getElementById("quiz-prompt").innerHTML = `
      Explore the <strong>Fish (2-Chamber)</strong> and <strong>Amphibian (3-Chamber)</strong> models using the top tabs.
      Observe single vs dual circulation and explain why endothermic mammals evolved complete ventricular septation!
    `;
    document.getElementById("verify-quiz-btn").textContent = "Finalize Bio-Mimicry Comparative Audit";
  }

  completeMission() {
    const modalArea = document.createElement("div");
    modalArea.style.cssText = `
      position:fixed; inset:0; background:rgba(5,8,16,0.9); backdrop-filter:blur(12px);
      z-index:300; display:flex; align-items:center; justify-content:center; padding:1.5rem;
    `;
    modalArea.innerHTML = `
      <div class="value-card-modal" style="max-width:580px; width:100%;">
        <div style="text-align:center; margin-bottom:1.5rem;">
          <div style="font-size:2.5rem; margin-bottom:0.25rem;"></div>
          <h2 style="font-size:1.5rem; color:#fff;">Mission 1: Bio-Mimicry Heart Pump Mastered</h2>
          <p style="font-size:0.85rem; color:var(--accent-cyan);">Domain 1: Bio-Tech & Living Systems Cleared</p>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:1rem; margin-bottom:1.25rem; font-size:0.85rem;">
          <h4 style="color:#38bdf8; margin-bottom:0.4rem;">Key First-Principles Derivation:</h4>
          <p style="color:var(--text-muted); line-height:1.4;">
            Poiseuille's equation ($R = \frac{8\eta L}{\pi r^4}$) proves that halving vessel radius increases resistance 16-fold! Mammalian 4-chamber separation creates high systemic pressure while protecting fragile pulmonary capillaries.
          </p>
        </div>

        <div class="physical-brief-box" style="margin-bottom:1.5rem;">
          <div class="physical-brief-header">
            
            <span>NEXT 50%: Classroom Physical Build Project</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.6rem;">
            Construct the <strong>Dual-Chamber Syringe & Ball-Valve Mechanical Hemodynamic Rig</strong> in the classroom to physically measure manometer pressure with one-way valves.
          </p>
          <button id="view-heart-lab-brief-btn" class="btn btn-subtle" style="font-size:0.75rem; padding:0.4rem 0.8rem;">
            Open Classroom Physical Lab Brief
          </button>
        </div>

        <button id="exit-heart-sim-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem;">
          Return to Mission Command
        </button>
      </div>
    `;

    document.body.appendChild(modalArea);
    document.getElementById("view-heart-lab-brief-btn").addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("open-physical-brief", { detail: "sim-heart-pump" }));
    });
    document.getElementById("exit-heart-sim-btn").addEventListener("click", () => {
      modalArea.remove();
      if (this.onComplete) this.onComplete();
    });
  }

  showTheoryModal() {
    sound.playClick();
    const modalArea = document.createElement("div");
    modalArea.style.cssText = `
      position:fixed; inset:0; background:rgba(5,8,16,0.85); backdrop-filter:blur(10px);
      z-index:300; display:flex; align-items:center; justify-content:center; padding:1.5rem;
    `;
    modalArea.innerHTML = `
      <div class="value-card-modal" style="max-width:640px; width:100%;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="color:#fff; font-size:1.25rem;">Mini-Lecture: Heart Hemodynamics & Comparative Physiology</h3>
          <button id="close-theory-btn" class="modal-close-btn" style="position:static;">&times;</button>
        </div>
        <div style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; max-height:60vh; overflow-y:auto; padding-right:0.5rem;">
          <p style="margin-bottom:0.75rem;">
            <strong>1. Cardiac Output Formula:</strong> $\text{CO} = \text{Heart Rate (HR)} \times \text{Stroke Volume (SV)}$. At rest, $72\text{ BPM} \times 70\text{ mL} \approx 5.0\text{ L/min}$, circulating the body's total blood volume every 60 seconds!
          </p>
          <p style="margin-bottom:0.75rem;">
            <strong>2. Four Chambers & One-Way Check Valves:</strong> The Right Atrium and Ventricle handle oxygen-depleted venous return to the lungs. The Left Atrium and Ventricle pump oxygen-rich blood through the Aorta to muscles and brain. Valves prevent retrograde backflow.
          </p>
          <p style="margin-bottom:0.75rem;">
            <strong>3. Bio-Mimicry Auditing:</strong>
            <br>• <em>Fish (2 Chambers):</em> 1 atrium, 1 ventricle. Blood flows in a single loop through gills to body. Operates at low capillary pressure.
            <br>• <em>Amphibians (3 Chambers):</em> 2 atria, 1 ventricle. Partial oxygenated/deoxygenated mixing. Adapted for cutaneous skin breathing.
            <br>• <em>Mammals & Birds (4 Chambers):</em> Complete separation. Supports high metabolic rates and warm-blooded homeostasis.
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(modalArea);
    document.getElementById("close-theory-btn").addEventListener("click", () => modalArea.remove());
  }

  animate() {
    this.drawHeart();
    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  drawHeart() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dynamic contraction rhythm based on heartRate
    const cycleSpeed = (this.heartRate / 60) * 0.08;
    this.phase = (this.phase + cycleSpeed) % (Math.PI * 2);
    const contract = Math.sin(this.phase) * 0.08 + 1.0; // 0.92 to 1.08 scale

    const cx = w * 0.5;
    const cy = h * 0.46;
    const heartScale = Math.min(w, h) * 0.0022;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(heartScale * contract, heartScale * contract);

    if (this.modelType === "human") {
      this.drawHumanHeart(ctx);
    } else if (this.modelType === "fish") {
      this.drawFishHeart(ctx);
    } else {
      this.drawFrogHeart(ctx);
    }

    ctx.restore();

    // Draw animated blood flow particles
    this.drawParticles(ctx, cx, cy, heartScale);
  }

  drawHumanHeart(ctx) {
    // 4 Chamber Anatomical Representation
    // Right Atrium (Blue deoxygenated)
    ctx.fillStyle = "rgba(30, 58, 138, 0.75)";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(-70, -40, 55, 65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Ventricle (Blue)
    ctx.fillStyle = "rgba(30, 58, 138, 0.85)";
    ctx.beginPath();
    ctx.ellipse(-60, 50, 60, 75, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Left Atrium (Red oxygenated)
    ctx.fillStyle = "rgba(153, 27, 27, 0.75)";
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(70, -40, 55, 65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Left Ventricle (Thick muscular myocardium)
    ctx.fillStyle = "rgba(153, 27, 27, 0.9)";
    ctx.beginPath();
    ctx.ellipse(60, 55, 65, 85, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Septum Wall
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(0, 140);
    ctx.stroke();

    // Aortic Arch
    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(0, -100, 50, Math.PI, 0);
    ctx.stroke();

    // Chamber Labels
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Right Atrium (RA)", -70, -40);
    ctx.fillText("Right Ventricle (RV)", -60, 55);
    ctx.fillText("Left Atrium (LA)", 70, -40);
    ctx.fillText("Left Ventricle (LV)", 60, 60);

    // Stenosis Visual Overlay if active
    if (this.blockage > 0) {
      ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
      ctx.beginPath();
      ctx.arc(40, -120, this.blockage * 0.15 + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(`${this.blockage}%`, 40, -117);
    }
  }

  drawFishHeart(ctx) {
    // 2-Chamber Heart: 1 Atrium + 1 Ventricle (Single Circulation)
    ctx.fillStyle = "rgba(30, 58, 138, 0.85)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;

    // Sinus Venosus & Atrium
    ctx.beginPath();
    ctx.ellipse(0, -60, 65, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ventricle
    ctx.fillStyle = "rgba(30, 58, 138, 0.95)";
    ctx.beginPath();
    ctx.ellipse(0, 45, 75, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bulbus Arteriosus
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, 105);
    ctx.lineTo(0, 160);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Fish Single Atrium (Venous)", 0, -60);
    ctx.fillText("Fish Single Ventricle", 0, 50);
    ctx.fillText("To Gill Capillaries →", 0, 185);
  }

  drawFrogHeart(ctx) {
    // 3-Chamber Heart: 2 Atria + 1 Single Ventricle (Partial Mixing)
    ctx.fillStyle = "rgba(30, 58, 138, 0.8)";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(-65, -50, 50, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(153, 27, 27, 0.8)";
    ctx.strokeStyle = "#ef4444";
    ctx.beginPath();
    ctx.ellipse(65, -50, 50, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Single Ventricle (Purple mixed fluid)
    ctx.fillStyle = "rgba(109, 40, 217, 0.85)";
    ctx.strokeStyle = "#a855f7";
    ctx.beginPath();
    ctx.ellipse(0, 50, 85, 75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Right Atrium", -65, -50);
    ctx.fillText("Left Atrium", 65, -50);
    ctx.fillText("Single Ventricle (Mixed Blood)", 0, 55);
  }

  drawParticles(ctx, cx, cy, scale) {
    const flowSpeedMultiplier = (this.heartRate / 70) * (1 - (this.blockage / 100) * 0.5);

    this.particles.forEach(p => {
      p.t = (p.t + p.speed * flowSpeedMultiplier) % 1;
      
      let px, py;
      if (p.type === "oxygenated") {
        // Red arterial loop
        const angle = p.t * Math.PI * 2;
        px = cx + Math.cos(angle) * 70 * scale + (scale * 30);
        py = cy + Math.sin(angle) * 80 * scale;
        ctx.fillStyle = "#ef4444";
      } else {
        // Blue venous loop
        const angle = p.t * Math.PI * 2;
        px = cx + Math.cos(angle) * 70 * scale - (scale * 30);
        py = cy + Math.sin(angle) * 80 * scale;
        ctx.fillStyle = "#38bdf8";
      }

      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
