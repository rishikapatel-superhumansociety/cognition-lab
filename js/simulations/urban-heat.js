/**
 * Mission 3: Urban Heat Island: Historical vs Modern City
 * Domain 3: Earth, Society & Human Progress
 * Incorporates: Time-Capsule Immersion (h), First Principles (a), Ethical Radical (c), Physical Build (d)
 */

import { sound } from "../sound.js";

export class UrbanHeatSimulation {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.era = "2020s"; // "1950s" vs "2020s"
    this.scenario = 1; // 1: Temp Delta | 2: Mitigation Plan | 3: Ethical Debate

    // Microclimate Variables
    this.greenCover = 18; // % (1950s default ~55%, 2020s default ~18%)
    this.buildingDensity = 72; // % (1950s ~25%, 2020s ~72%)
    this.albedo = 0.18; // 0.10 (asphalt) to 0.75 (cool roof)

    this.animFrame = null;
    this.ethicalVote = null;
  }

  mount() {
    this.renderLayout();
    this.setupCanvas();
    this.renderControls();
    this.updateMicroclimate();
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    sound.stopAll();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="sim-stage-split">
        <!-- 70% Left: Satellite & Thermal Heatmap Viewport -->
        <div class="sim-stage-visual" id="heat-visual-pane">
          <div class="sim-canvas-container">
            <canvas id="heatCanvas" class="sim-canvas"></canvas>

            <!-- Era Toggle Toolbar -->
            <div style="position:absolute; top:15px; left:15px; display:flex; gap:0.5rem; background:rgba(15,23,42,0.85); backdrop-filter:blur(8px); padding:0.4rem; border-radius:8px; border:1px solid var(--border-subtle); z-index:10;">
              <button id="era-1950-btn" class="filter-chip">⏳ 1950s Historical City</button>
              <button id="era-2020-btn" class="filter-chip active">🏙️ 2020s Modern Concrete</button>
              <button id="heatmap-toggle-btn" class="filter-chip" style="color:var(--accent-amber);">🌡️ Toggle Thermal IR</button>
            </div>

            <!-- Real-Time Microclimate Telemetry HUD -->
            <div style="position:absolute; bottom:20px; left:20px; right:20px; background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:0.85rem 1.25rem; display:flex; justify-content:space-between; align-items:center; backdrop-filter:blur(10px); z-index:10;">
              <div>
                <div style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; font-weight:700;">Surface Urban Heat Index</div>
                <div style="font-family:var(--font-mono); font-size:1.5rem; font-weight:800; color:#ef4444;" id="surface-temp-display">42.4°C</div>
              </div>
              <div>
                <div style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; font-weight:700;">Solar Radiation Absorbed</div>
                <div style="font-family:var(--font-mono); font-size:1.5rem; font-weight:800; color:var(--accent-amber);" id="radiation-display">680 <span style="font-size:0.8rem; color:var(--text-muted);">W/m²</span></div>
              </div>
              <div>
                <div style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; font-weight:700;">Evapotranspirative Cooling</div>
                <div style="font-family:var(--font-mono); font-size:1.5rem; font-weight:800; color:#34d399;" id="evapo-display">-3.2°C</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 30% Right: Thermodynamic Controls & Scenarios -->
        <div class="sim-stage-controls" id="heat-controls-pane">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Investigation Stage</div>
              <span id="heat-level-badge" class="level-chip active">Scenario 1: Delta</span>
            </div>
          </div>

          <div id="heat-controls-area">
            <!-- Dynamic Controls -->
          </div>
        </div>
      </div>
    `;

    document.getElementById("era-1950-btn").addEventListener("click", () => this.switchEra("1950s"));
    document.getElementById("era-2020-btn").addEventListener("click", () => this.switchEra("2020s"));
    document.getElementById("heatmap-toggle-btn").addEventListener("click", () => {
      sound.playClick();
      this.showHeatmap = !this.showHeatmap;
      document.getElementById("heatmap-toggle-btn").classList.toggle("active", this.showHeatmap);
    });
  }

  setupCanvas() {
    this.canvas = document.getElementById("heatCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.showHeatmap = true;
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.animate();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth * window.devicePixelRatio;
    this.canvas.height = parent.clientHeight * window.devicePixelRatio;
  }

  switchEra(era) {
    sound.playClick();
    this.era = era;
    document.getElementById("era-1950-btn").classList.toggle("active", era === "1950s");
    document.getElementById("era-2020-btn").classList.toggle("active", era === "2020s");

    if (era === "1950s") {
      this.greenCover = 55;
      this.buildingDensity = 25;
      this.albedo = 0.42;
    } else {
      this.greenCover = 18;
      this.buildingDensity = 72;
      this.albedo = 0.18;
    }

    this.syncSliders();
    this.updateMicroclimate();
  }

  syncSliders() {
    const sG = document.getElementById("slider-green");
    const sD = document.getElementById("slider-density");
    const sA = document.getElementById("slider-albedo");
    if (sG) {
      sG.value = this.greenCover;
      document.getElementById("val-green").textContent = `${this.greenCover}%`;
    }
    if (sD) {
      sD.value = this.buildingDensity;
      document.getElementById("val-density").textContent = `${this.buildingDensity}%`;
    }
    if (sA) {
      sA.value = this.albedo;
      document.getElementById("val-albedo").textContent = this.albedo.toFixed(2);
    }
  }

  renderControls() {
    const area = document.getElementById("heat-controls-area");
    area.innerHTML = `
      <div style="background:rgba(56,189,248,0.06); border:1px solid rgba(56,189,248,0.2); border-radius:8px; padding:0.85rem; margin-bottom:1.25rem;">
        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-cyan); font-weight:700; margin-bottom:0.25rem;" id="scenario-title">
          Scenario 1: Thermal Delta Analysis
        </div>
        <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;" id="scenario-desc">
          Compare the <strong>1950s historical city</strong> against the <strong>2020s modern metropolis</strong>. Measure the temperature divergence caused by concrete sprawl and loss of vegetative canopy.
        </p>
      </div>

      <!-- Green Canopy Slider -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">🌳 Green Canopy Cover</span>
          <span class="control-value" id="val-green">${this.greenCover}%</span>
        </div>
        <input type="range" class="slider-range" id="slider-green" min="5" max="65" value="${this.greenCover}">
        <div class="control-hints">
          <span>5% (Concrete Desert)</span>
          <span>30% (Standard)</span>
          <span>65% (Urban Forest)</span>
        </div>
      </div>

      <!-- Building Density Slider -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">🏢 Building Surface Density</span>
          <span class="control-value" id="val-density">${this.buildingDensity}%</span>
        </div>
        <input type="range" class="slider-range" id="slider-density" min="10" max="90" value="${this.buildingDensity}">
        <div class="control-hints">
          <span>10% (Suburban Open)</span>
          <span>50% (Mixed-Use)</span>
          <span>90% (Dense Downtown)</span>
        </div>
      </div>

      <!-- Surface Albedo Slider -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-title">☀️ Surface Albedo (Reflectivity α)</span>
          <span class="control-value" id="val-albedo">${this.albedo.toFixed(2)}</span>
        </div>
        <input type="range" class="slider-range" id="slider-albedo" min="0.10" max="0.75" step="0.05" value="${this.albedo}">
        <div class="control-hints">
          <span>0.10 (Black Asphalt)</span>
          <span>0.40 (Stone/Lime)</span>
          <span>0.75 (Cool Roof Paint)</span>
        </div>
      </div>

      <!-- Action Button -->
      <button id="scenario-action-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem; margin-top:0.5rem;">
        📊 Record Scenario 1 Temperature Delta
      </button>

      <div id="heat-feedback" style="font-size:0.8rem; text-align:center; margin-top:0.75rem; min-height:1.2rem;"></div>
    `;

    document.getElementById("slider-green").addEventListener("input", (e) => {
      this.greenCover = parseInt(e.target.value);
      document.getElementById("val-green").textContent = `${this.greenCover}%`;
      this.updateMicroclimate();
    });

    document.getElementById("slider-density").addEventListener("input", (e) => {
      this.buildingDensity = parseInt(e.target.value);
      document.getElementById("val-density").textContent = `${this.buildingDensity}%`;
      this.updateMicroclimate();
    });

    document.getElementById("slider-albedo").addEventListener("input", (e) => {
      this.albedo = parseFloat(e.target.value);
      document.getElementById("val-albedo").textContent = this.albedo.toFixed(2);
      this.updateMicroclimate();
    });

    document.getElementById("scenario-action-btn").addEventListener("click", () => this.handleScenarioAction());
  }

  updateMicroclimate() {
    // Physical Radiation & Thermodynamic Model
    // Base ambient solar insolation S = 1000 W/m^2
    const solarInsolation = 1000;
    const absorbedSolar = Math.round(solarInsolation * (1 - this.albedo));
    
    // Evapotranspiration cooling: trees reduce air temperature by up to 8°C
    const coolingDelta = (this.greenCover / 65) * 7.5;
    
    // Thermal mass absorption from buildings
    const thermalMassHeating = (this.buildingDensity / 100) * 11.0;

    // Derived surface temperature (30°C to 46°C)
    const baseTemp = 30.0;
    const surfaceTemp = baseTemp + thermalMassHeating - coolingDelta + (absorbedSolar - 500) * 0.012;

    const tempDisplay = document.getElementById("surface-temp-display");
    const radDisplay = document.getElementById("radiation-display");
    const evapoDisplay = document.getElementById("evapo-display");

    if (tempDisplay) {
      tempDisplay.textContent = `${surfaceTemp.toFixed(1)}°C`;
      tempDisplay.style.color = surfaceTemp > 38 ? "#ef4444" : surfaceTemp > 33 ? "#f59e0b" : "#10b981";
    }
    if (radDisplay) {
      radDisplay.innerHTML = `${absorbedSolar} <span style="font-size:0.8rem; color:var(--text-muted);">W/m²</span>`;
    }
    if (evapoDisplay) {
      evapoDisplay.textContent = `-${coolingDelta.toFixed(1)}°C`;
    }

    this.currentTemp = surfaceTemp;
  }

  handleScenarioAction() {
    sound.playClick();
    const feedback = document.getElementById("heat-feedback");

    if (this.scenario === 1) {
      sound.playSuccess();
      feedback.style.color = "#34d399";
      feedback.textContent = `Delta logged! 1950s: ~31.8°C vs 2020s: ~42.4°C (+10.6°C Urban Heat Island effect).`;
      setTimeout(() => this.advanceToScenario2(), 1000);
    } else if (this.scenario === 2) {
      // Goal in Scenario 2: Mitigate temperature below 33.5°C
      if (this.currentTemp <= 33.5) {
        sound.playSuccess();
        feedback.style.color = "#34d399";
        feedback.textContent = `Mitigation Successful! Urban surface cooled to ${this.currentTemp.toFixed(1)}°C.`;
        setTimeout(() => this.advanceToScenario3Ethical(), 1000);
      } else {
        sound.playWarning();
        feedback.style.color = "#f87171";
        feedback.textContent = `Current temperature is ${this.currentTemp.toFixed(1)}°C. Elevate Green Canopy (>=45%) and Albedo (>=0.55) to bring below 33.5°C!`;
      }
    } else if (this.scenario === 3) {
      if (this.ethicalVote) {
        sound.playSuccess();
        this.completeMission();
      } else {
        sound.playWarning();
        feedback.style.color = "#f87171";
        feedback.textContent = "Please select your policy stance on thermal justice to proceed.";
      }
    }
  }

  advanceToScenario2() {
    this.scenario = 2;
    document.getElementById("heat-level-badge").textContent = "Scenario 2: Mitigation";
    document.getElementById("scenario-title").textContent = "Scenario 2: Cool Roof & Urban Canopy Mitigation";
    document.getElementById("scenario-desc").innerHTML = `
      Modern 2020s city is suffering heat strokes at 42°C. Propose an engineering intervention:
      increase <strong>Albedo (&ge; 0.55 via reflective cool roofs)</strong> and <strong>Canopy (&ge; 45%)</strong> to bring surface temp <strong>below 33.5°C</strong>!
    `;
    document.getElementById("scenario-action-btn").textContent = "🧪 Test Mitigation Efficacy";
  }

  advanceToScenario3Ethical() {
    this.scenario = 3;
    document.getElementById("heat-level-badge").textContent = "Scenario 3: Ethical Debate";
    const area = document.getElementById("heat-controls-area");
    area.innerHTML = `
      <div style="background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3); border-radius:8px; padding:1rem; margin-bottom:1.25rem;">
        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-purple); font-weight:700; letter-spacing:0.06em;">Method (c) Ethical Radical</div>
        <h4 style="font-size:0.95rem; color:#fff; margin:0.3rem 0;">Thermal Inequality & Municipal Zoning Debate</h4>
        <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.4;">
          Satellite thermal audits prove low-income industrial working zones are <strong>6°C hotter</strong> than affluent tree-lined suburbs due to lack of municipal tree planting.
        </p>
      </div>

      <div style="background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.3); border-radius:8px; padding:0.85rem; margin-bottom:1.25rem; font-size:0.82rem; color:#fca5a5;">
        ⚖️ <strong>Ethical Question:</strong> <em>"Should municipal governments mandate compulsory 40% cool-roof taxes on private factories, or subsidize urban forestry through city-wide tax hikes?"</em>
      </div>

      <div class="ethical-deck" style="grid-template-columns:1fr; gap:0.75rem;">
        <div class="ethical-card" id="policy-tax-factory">
          <div class="ethical-card-icon">🏭</div>
          <h3>Policy A: Polluter-Pays Mandate</h3>
          <p>Compel industrial warehouse owners to paint all roofs white and install sedum trays at their own expense.</p>
        </div>

        <div class="ethical-card" id="policy-city-subsidy">
          <div class="ethical-card-icon">🌳</div>
          <h3>Policy B: Universal Municipal Forestry</h3>
          <p>Fund public street canopy corridors and biophilic cooling parks across all neighborhoods through civic bond funding.</p>
        </div>
      </div>

      <button id="scenario-action-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem; margin-top:0.75rem;">
        Finalize Thermal Justice Policy Resolution
      </button>

      <div id="heat-feedback" style="font-size:0.8rem; text-align:center; margin-top:0.75rem; min-height:1.2rem;"></div>
    `;

    const cardA = document.getElementById("policy-tax-factory");
    const cardB = document.getElementById("policy-city-subsidy");

    cardA.addEventListener("click", () => {
      sound.playClick();
      this.ethicalVote = "polluter-pays";
      cardA.classList.add("selected");
      cardB.classList.remove("selected");
    });

    cardB.addEventListener("click", () => {
      sound.playClick();
      this.ethicalVote = "universal-subsidy";
      cardB.classList.add("selected");
      cardA.classList.remove("selected");
    });

    document.getElementById("scenario-action-btn").addEventListener("click", () => this.handleScenarioAction());
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
          <div style="font-size:2.5rem; margin-bottom:0.25rem;">🏙️🏆</div>
          <h2 style="font-size:1.5rem; color:#fff;">Mission 3: Urban Heat Island Mastered</h2>
          <p style="font-size:0.85rem; color:var(--accent-cyan);">Domain 3: Earth, Society & Human Progress Loop Cleared</p>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:1rem; margin-bottom:1.25rem; font-size:0.85rem;">
          <div style="margin-bottom:0.4rem;">
            <span style="color:var(--text-muted);">Historical vs Modern Delta:</span>
            <strong style="color:#ef4444;">+10.6°C Concrete Trapping</strong>
          </div>
          <div style="margin-bottom:0.4rem;">
            <span style="color:var(--text-muted);">Thermal Justice Stance:</span>
            <strong style="color:#34d399; text-transform:capitalize;"> ${this.ethicalVote}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted);">First-Principles Proof:</span>
            <span style="color:#fff;"> $j^* = \epsilon \sigma T^4$ & albedo reflection mitigates latent heat index.</span>
          </div>
        </div>

        <div class="physical-brief-box" style="margin-bottom:1.5rem;">
          <div class="physical-brief-header">
            <span>🔬</span>
            <span>NEXT 50%: Classroom Physical Build Project</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.6rem;">
            Execute the <strong>Multi-Surface Albedo & Microclimate Calorimeter Chamber</strong> build using miniature roofs (black tar vs cool white vs living moss) tested under infrared heat lamps!
          </p>
          <button id="view-urban-lab-brief-btn" class="btn btn-subtle" style="font-size:0.75rem; padding:0.4rem 0.8rem;">
            Open Classroom Physical Lab Brief 📋
          </button>
        </div>

        <button id="exit-urban-sim-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem;">
          Return to Mission Command
        </button>
      </div>
    `;

    document.body.appendChild(modalArea);
    document.getElementById("view-urban-lab-brief-btn").addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("open-physical-brief", { detail: "sim-urban-heat" }));
    });
    document.getElementById("exit-urban-sim-btn").addEventListener("click", () => {
      modalArea.remove();
      if (this.onComplete) this.onComplete();
    });
  }

  animate() {
    this.drawCityMap();
    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  drawCityMap() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cols = 12;
    const rows = 8;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW;
        const y = r * cellH;

        // Base land type determined by era and greenCover
        const seed = Math.sin(r * 13 + c * 37);
        const isWater = (r === 3 || r === 4) && c > 7;
        const isGreen = !isWater && (seed * 50 + 50) < this.greenCover;
        const isBuilding = !isWater && !isGreen && (seed * 50 + 50) < this.buildingDensity;

        if (this.showHeatmap) {
          // Heatmap rendering mode
          let cellTemp = 32;
          if (isWater) cellTemp = 28;
          else if (isGreen) cellTemp = 31;
          else if (isBuilding) cellTemp = 38 + (1 - this.albedo) * 8;
          else cellTemp = 34 + (1 - this.albedo) * 4;

          // Color interpolate from 28°C (blue) to 46°C (red/purple)
          const heatRatio = Math.max(0, Math.min(1, (cellTemp - 28) / 18));
          const red = Math.round(heatRatio * 255);
          const blue = Math.round((1 - heatRatio) * 200);
          ctx.fillStyle = `rgba(${red}, 40, ${blue}, 0.75)`;
          ctx.fillRect(x, y, cellW, cellH);

          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.strokeRect(x, y, cellW, cellH);
        } else {
          // Physical visual map
          if (isWater) {
            ctx.fillStyle = "#0284c7";
          } else if (isGreen) {
            ctx.fillStyle = this.era === "1950s" ? "#15803d" : "#16a34a";
          } else if (isBuilding) {
            ctx.fillStyle = this.era === "1950s" ? "#b45309" : "#334155";
          } else {
            ctx.fillStyle = "#1e293b";
          }
          ctx.fillRect(x, y, cellW, cellH);

          ctx.strokeStyle = "rgba(255,255,255,0.06)";
          ctx.strokeRect(x, y, cellW, cellH);
        }
      }
    }
  }
}
