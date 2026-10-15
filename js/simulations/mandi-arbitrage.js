/**
 * Mission 4: The Sabarkantha Mandi Arbitrage Engine
 * Domain 4: Market Execution & Business
 * Incorporates: Real Life Market Exposure (e), Chaos Management (k), First Principles (a), Physical Build (d)
 */

import { sound } from "../sound.js";

export class MandiArbitrageSimulation {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.stage = "trading"; // trading | crisis | settled | completed

    // Starting Working Capital (₹)
    this.capital = 100000;
    
    // Sabarkantha Commodities Portfolio
    this.commodities = [
      { id: "castor", name: "Castor Seeds (Diveli)", qtyQuintals: 120, buyPricePerQ: 6200, mandiSpotPrice: 6950, storageTempC: 18, decayRateDay: 0.15 },
      { id: "groundnut", name: "Saurashtra Groundnut (Singdana)", qtyQuintals: 80, buyPricePerQ: 5800, mandiSpotPrice: 6500, storageTempC: 15, decayRateDay: 0.25 },
      { id: "cotton", name: "Shankar-6 Raw Cotton (Kapas)", qtyQuintals: 150, buyPricePerQ: 7100, mandiSpotPrice: 7850, storageTempC: 22, decayRateDay: 0.10 },
      { id: "wheat", name: "Sharbati Golden Wheat", qtyQuintals: 200, buyPricePerQ: 2400, mandiSpotPrice: 2850, storageTempC: 20, decayRateDay: 0.05 }
    ];

    // Operational Logistics Parameters
    this.selectedCommodity = this.commodities[0];
    this.transportKm = 120; // km to terminal market
    this.dieselFreightPerKmPerQ = 3.5; // ₹ / km / quintal
    this.coldStorageDays = 14; // days held in warehouse
    this.refrigerationPowerCostPerDayPerQ = 4.0; // ₹ / day / quintal

    // Crisis price shock state (-38% crash)
    this.priceCrashFactor = 1.0;
    this.crisisTriggered = false;
  }

  mount() {
    this.renderLayout();
    this.renderLedger();
  }

  destroy() {
    sound.stopAll();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="sim-stage-split">
        <!-- 70% Left: Authentic Commodity Exchange Terminal & Double-Entry Ledger -->
        <div class="sim-stage-visual" id="mandi-visual-pane" style="background:#090e1a; padding:1.5rem; overflow-y:auto;">
          
          <!-- Terminal Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle); padding-bottom:1rem; margin-bottom:1.5rem;">
            <div>
              <div style="font-size:0.75rem; font-family:var(--font-mono); color:var(--accent-amber); font-weight:700;">APMC SABARKANTHA COMMODITY DESK // TERMINAL 04</div>
              <h2 style="font-size:1.4rem; font-weight:800; color:#fff; font-family:var(--font-mono);">ARBITRAGE LEDGER SYSTEM</h2>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.7rem; color:var(--text-faint); font-family:var(--font-mono);">COMMODITY SETTLEMENT DATE</div>
              <div style="font-size:1.1rem; font-family:var(--font-mono); font-weight:700; color:var(--accent-cyan);">2026-SEP-13 // OPEN</div>
            </div>
          </div>

          <!-- Market Spot Price Ticker -->
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.75rem; margin-bottom:1.5rem;" id="ticker-grid">
            <!-- Populated dynamically -->
          </div>

          <!-- The Live Financial Double-Entry Ledger Table -->
          <div class="ledger-table-wrap">
            <table class="ledger-table" id="arbitrage-ledger">
              <thead>
                <tr>
                  <th>Commodity</th>
                  <th>Volume (Qtl)</th>
                  <th>Cost Outlay (₹)</th>
                  <th>Freight & Storage (₹)</th>
                  <th>Net Basis (₹/Qtl)</th>
                  <th>Mandi Realization (₹)</th>
                  <th>Gross Profit/Loss</th>
                </tr>
              </thead>
              <tbody id="ledger-tbody">
                <!-- Calculated rows -->
              </tbody>
            </table>
          </div>

          <!-- Formula Ledger Math Card (Class 7/8 Comparing Quantities Anchor) -->
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-subtle); border-radius:8px; padding:1rem; font-family:var(--font-mono); font-size:0.78rem;">
            <div style="color:var(--accent-amber); font-weight:700; margin-bottom:0.35rem;">📐 FIRST-PRINCIPLES COMMERCIAL ARITHMETIC FORMULAS:</div>
            <div style="color:var(--text-muted); display:grid; grid-template-columns:repeat(2, 1fr); gap:0.5rem;">
              <div>• Total Cost $TC = (Qty \times BuyPrice) + Freight + Storage$</div>
              <div>• Net Freight $F = Qty \times Radius(km) \times DieselRate$</div>
              <div>• Storage $S = Qty \times Days \times PowerRate$</div>
              <div>• Margin $\% = \frac{Gross Revenue - Total Cost}{Total Cost} \times 100$</div>
            </div>
          </div>
        </div>

        <!-- 30% Right: Trade Logistics HUD & Crisis Verification Lock -->
        <div class="sim-stage-controls" id="mandi-controls-pane">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Desk Status</div>
              <span id="mandi-status-badge" class="level-chip active" style="font-family:var(--font-mono);">STAGE 1: POSITIONING</span>
            </div>
          </div>

          <div id="mandi-controls-dynamic">
            <!-- Dynamic Controls -->
          </div>
        </div>
      </div>
    `;

    this.renderControlsArea();
  }

  renderControlsArea() {
    const area = document.getElementById("mandi-controls-dynamic");
    if (!this.crisisTriggered) {
      area.innerHTML = `
        <div style="background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.25); border-radius:8px; padding:0.85rem; margin-bottom:1.25rem;">
          <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-amber); font-weight:700; margin-bottom:0.25rem;">
            ARBITRAGE DESK MANDATE
          </div>
          <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">
            Configure transport transit distance and warehouse cold storage hold days. Maximize net realization yield before the settlement window closes.
          </p>
        </div>

        <!-- Transport Radius Slider -->
        <div class="control-group">
          <div class="control-header">
            <span class="control-title">🚛 Transport Radius (km)</span>
            <span class="control-value" id="val-radius">${this.transportKm} km</span>
          </div>
          <input type="range" class="slider-range" id="slider-radius" min="40" max="350" value="${this.transportKm}">
          <div class="control-hints">
            <span>40 km (Local APMC)</span>
            <span>350 km (Port Terminal)</span>
          </div>
        </div>

        <!-- Cold Storage Days Slider -->
        <div class="control-group">
          <div class="control-header">
            <span class="control-title">❄️ Cold Storage Hold (Days)</span>
            <span class="control-value" id="val-days">${this.coldStorageDays} Days</span>
          </div>
          <input type="range" class="slider-range" id="slider-days" min="2" max="60" value="${this.coldStorageDays}">
          <div class="control-hints">
            <span>2 Days (Quick Flip)</span>
            <span>60 Days (Seasonal Carry)</span>
          </div>
        </div>

        <button id="trigger-crisis-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.85rem; margin-top:0.75rem; background:linear-gradient(135deg, #d97706, #b45309);">
          ⚡ Execute Settlement & Advance Clock
        </button>
      `;

      document.getElementById("slider-radius").addEventListener("input", (e) => {
        this.transportKm = parseInt(e.target.value);
        document.getElementById("val-radius").textContent = `${this.transportKm} km`;
        this.renderLedger();
      });

      document.getElementById("slider-days").addEventListener("input", (e) => {
        this.coldStorageDays = parseInt(e.target.value);
        document.getElementById("val-days").textContent = `${this.coldStorageDays} Days`;
        this.renderLedger();
      });

      document.getElementById("trigger-crisis-btn").addEventListener("click", () => this.triggerMandiPriceCrash());
    } else {
      this.renderVerificationLock();
    }
  }

  triggerMandiPriceCrash() {
    sound.playAlarm();
    this.crisisTriggered = true;
    this.priceCrashFactor = 0.62; // 38% sudden price collapse!

    const badge = document.getElementById("mandi-status-badge");
    badge.textContent = "CRISIS: PRICE COLLAPSE";
    badge.style.background = "#e11d48";
    badge.style.borderColor = "#f43f5e";

    this.renderControlsArea();
    this.renderLedger();
  }

  renderVerificationLock() {
    const area = document.getElementById("mandi-controls-dynamic");

    // Calculate exact metrics for Castor Seeds (active reference)
    const comm = this.commodities[0];
    const buyTotal = comm.qtyQuintals * comm.buyPricePerQ;
    const freight = comm.qtyQuintals * this.transportKm * this.dieselFreightPerKmPerQ;
    const storage = comm.qtyQuintals * this.coldStorageDays * this.refrigerationPowerCostPerDayPerQ;
    const totalCost = buyTotal + freight + storage;
    const crashedSpot = Math.round(comm.mandiSpotPrice * this.priceCrashFactor);
    const grossRev = comm.qtyQuintals * crashedSpot;
    const netProfit = grossRev - totalCost;
    const netProfitPct = ((netProfit / totalCost) * 100).toFixed(2);
    const breakEvenPrice = (totalCost / comm.qtyQuintals).toFixed(2);

    this.correctProfitPct = parseFloat(netProfitPct);
    this.correctBreakEven = parseFloat(breakEvenPrice);

    area.innerHTML = `
      <div class="crisis-banner">
        <span class="crisis-icon">📉</span>
        <div>
          <h4>Method (k) Sudden Mandi Price Collapse</h4>
          <p>A flood of unseasonal grain imports caused spot prices to crash by <strong>-38%</strong> across the APMC! All asset values are locked.</p>
        </div>
      </div>

      <div class="verify-lock-box">
        <div class="verify-lock-title">
          <span>🔒</span>
          <span>MANDI VERIFICATION LOCK</span>
        </div>
        <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.4; margin-bottom:0.75rem;">
          To audit and settle this financial ledger, solve and enter the exact financial metrics for <strong>${comm.name}</strong> based on the ledger figures.
        </p>

        <div style="margin-bottom:0.75rem;">
          <label style="font-size:0.72rem; color:var(--text-faint); font-weight:700;">1. Calculated Net Profit/Loss % (Include negative sign if loss)</label>
          <input type="number" id="input-profit-pct" step="0.1" class="verify-input" placeholder="e.g. -14.25%">
        </div>

        <div style="margin-bottom:0.75rem;">
          <label style="font-size:0.72rem; color:var(--text-faint); font-weight:700;">2. Break-Even Sales Price (₹ / Quintal)</label>
          <input type="number" id="input-breakeven" step="1" class="verify-input" placeholder="e.g. 6850">
        </div>

        <button id="verify-lock-btn" class="btn btn-accent" style="width:100%; justify-content:center; padding:0.8rem; margin-top:0.4rem;">
          🔓 Settle & Unlock Verification Ledger
        </button>

        <div id="verify-feedback" style="font-size:0.78rem; text-align:center; margin-top:0.5rem; min-height:1.2rem;"></div>
      </div>
    `;

    document.getElementById("verify-lock-btn").addEventListener("click", () => this.verifyLedgerSettlement());
  }

  verifyLedgerSettlement() {
    const profitInput = parseFloat(document.getElementById("input-profit-pct").value);
    const breakEvenInput = parseFloat(document.getElementById("input-breakeven").value);
    const feedback = document.getElementById("verify-feedback");

    const profitOk = Math.abs(profitInput - this.correctProfitPct) <= 0.8;
    const breakEvenOk = Math.abs(breakEvenInput - this.correctBreakEven) <= 25;

    if (profitOk && breakEvenOk) {
      sound.playSuccess();
      feedback.style.color = "#34d399";
      feedback.textContent = "Verification Lock Cleared! Accounting ledger mathematically settled.";
      setTimeout(() => this.completeMission(), 900);
    } else {
      sound.playWarning();
      feedback.style.color = "#f87171";
      feedback.textContent = `Mathematical discrepancy: Check formulas for Net P/L % (Expected ~${this.correctProfitPct}%) and Break-even Price (Expected ~₹${this.correctBreakEven}).`;
    }
  }

  renderLedger() {
    const tbody = document.getElementById("ledger-tbody");
    const tickerGrid = document.getElementById("ticker-grid");
    if (!tbody || !tickerGrid) return;

    tbody.innerHTML = "";
    tickerGrid.innerHTML = "";

    this.commodities.forEach(c => {
      const spot = Math.round(c.mandiSpotPrice * this.priceCrashFactor);
      const buyTotal = c.qtyQuintals * c.buyPricePerQ;
      const freight = c.qtyQuintals * this.transportKm * this.dieselFreightPerKmPerQ;
      const storage = c.qtyQuintals * this.coldStorageDays * this.refrigerationPowerCostPerDayPerQ;
      const totalCost = buyTotal + freight + storage;
      const basisPerQ = Math.round(totalCost / c.qtyQuintals);
      const grossRev = c.qtyQuintals * spot;
      const netProfit = grossRev - totalCost;
      const profitClass = netProfit >= 0 ? "text-profit" : "text-loss";

      // Ticker card
      const tick = document.createElement("div");
      tick.style.cssText = "background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:6px; padding:0.6rem; font-family:var(--font-mono);";
      tick.innerHTML = `
        <div style="font-size:0.68rem; color:var(--text-muted);">${c.name.split(" ")[0]}</div>
        <div style="font-size:1.1rem; font-weight:800; color:${this.priceCrashFactor < 1 ? '#f87171' : '#fff'};">₹${spot}</div>
        <div style="font-size:0.65rem; color:${this.priceCrashFactor < 1 ? '#ef4444' : '#34d399'};">${this.priceCrashFactor < 1 ? '-38.0% [CRASH]' : '+4.2% [STEADY]'}</div>
      `;
      tickerGrid.appendChild(tick);

      // Table row
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700; color:#fff;">${c.name}</td>
        <td>${c.qtyQuintals} Q</td>
        <td>₹${buyTotal.toLocaleString()}</td>
        <td>₹${Math.round(freight + storage).toLocaleString()}</td>
        <td>₹${basisPerQ.toLocaleString()}</td>
        <td style="color:${this.priceCrashFactor < 1 ? '#f87171' : 'var(--accent-cyan)'}; font-weight:700;">₹${grossRev.toLocaleString()}</td>
        <td class="${profitClass}">${netProfit >= 0 ? '+' : ''}₹${netProfit.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
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
          <div style="font-size:2.5rem; margin-bottom:0.25rem;">📈🏆</div>
          <h2 style="font-size:1.5rem; color:#fff;">Sabarkantha Arbitrage Engine Mastered</h2>
          <p style="font-size:0.85rem; color:var(--accent-cyan);">Domain 4: Market Execution & Business Loop Cleared</p>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:1rem; margin-bottom:1.25rem; font-size:0.85rem; font-family:var(--font-mono);">
          <div style="margin-bottom:0.4rem;">
            <span style="color:var(--text-muted);">Commercial Percentage Mastery:</span>
            <strong style="color:#34d399;"> Verified (${this.correctProfitPct}%)</strong>
          </div>
          <div style="margin-bottom:0.4rem;">
            <span style="color:var(--text-muted);">Break-Even Derivation:</span>
            <strong style="color:var(--accent-cyan);"> ₹${this.correctBreakEven}/quintal</strong>
          </div>
          <div>
            <span style="color:var(--text-muted);">Textbook Anchor:</span>
            <span style="color:#fff;"> NCERT Class 7/8 Comparing Quantities & Profit-Loss applied to real commodities.</span>
          </div>
        </div>

        <div class="physical-brief-box" style="margin-bottom:1.5rem;">
          <div class="physical-brief-header">
            <span>🔬</span>
            <span>NEXT 50%: Classroom Physical Build Project</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.6rem;">
            Launch the <strong>Live Commodity Pit & Cold-Chain Perishability Ledger</strong> in the classroom with tokenized crop vouchers and market shock dice rolls!
          </p>
          <button id="view-mandi-lab-brief-btn" class="btn btn-subtle" style="font-size:0.75rem; padding:0.4rem 0.8rem;">
            Open Classroom Physical Lab Brief 📋
          </button>
        </div>

        <button id="exit-mandi-sim-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem;">
          Return to Mission Command
        </button>
      </div>
    `;

    document.body.appendChild(modalArea);
    document.getElementById("view-mandi-lab-brief-btn").addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("open-physical-brief", { detail: "sim-mandi-arbitrage" }));
    });
    document.getElementById("exit-mandi-sim-btn").addEventListener("click", () => {
      modalArea.remove();
      if (this.onComplete) this.onComplete();
    });
  }
}
