/**
 * Mission 5: Cybersecurity Crisis: Ransomware Attack Simulation
 * Domain 5: Digital Frontier & Security
 * Incorporates: First Principles (a), Blind-Variable Crisis (k), Synthesis (b), Physical Build (d)
 */

import { sound } from "../sound.js";

export class RansomwareSimulation {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.timerSeconds = 25 * 60; // 25 minutes countdown
    this.timerInterval = null;
    this.spreadInterval = null;
    this.animFrame = null;

    // Defensive Arsenal
    this.firewallPortsOpen = true; // Port 445 / SMB
    this.decryptKeysLeft = 3;
    this.backupRestoring = false;
    this.backupProgress = 0;

    // Network Topology Graph Nodes
    this.nodes = [
      { id: "gateway", name: "Border Router / Gateway", ip: "192.168.1.1", status: "secure", totalFiles: 200, encryptedFiles: 0, xRatio: 0.15, yRatio: 0.5 },
      { id: "firewall", name: "Next-Gen Enterprise Firewall", ip: "192.168.1.2", status: "secure", totalFiles: 50, encryptedFiles: 0, xRatio: 0.32, yRatio: 0.5 },
      { id: "ad_server", name: "Active Directory Domain Controller", ip: "192.168.1.10", status: "secure", totalFiles: 1200, encryptedFiles: 0, xRatio: 0.50, yRatio: 0.28 },
      { id: "workstation_a", name: "Workstation A (Finance)", ip: "192.168.1.101", status: "infected", totalFiles: 450, encryptedFiles: 80, xRatio: 0.48, yRatio: 0.72 },
      { id: "workstation_b", name: "Workstation B (HR)", ip: "192.168.1.102", status: "secure", totalFiles: 350, encryptedFiles: 0, xRatio: 0.65, yRatio: 0.75 },
      { id: "database", name: "Hospital Patient Database EHR", ip: "192.168.1.50", status: "secure", totalFiles: 5000, encryptedFiles: 0, xRatio: 0.75, yRatio: 0.30 },
      { id: "backup_nas", name: "Air-Gapped Vault NAS", ip: "10.0.0.99", status: "secure", totalFiles: 8000, encryptedFiles: 0, xRatio: 0.88, yRatio: 0.65, airgapped: true }
    ];

    // Edges (Network Links)
    this.links = [
      { from: "gateway", to: "firewall", severed: false },
      { from: "firewall", to: "ad_server", severed: false },
      { from: "firewall", to: "workstation_a", severed: false },
      { from: "workstation_a", to: "workstation_b", severed: false },
      { from: "ad_server", to: "database", severed: false },
      { from: "workstation_b", to: "database", severed: false },
      { from: "database", to: "backup_nas", severed: true } // Initially air-gapped
    ];

    this.selectedNode = null;
    this.incidentStartTime = Date.now();
  }

  mount() {
    this.renderLayout();
    this.setupCanvas();
    this.startCrisisTimer();
    this.startWormPropagation();
    this.renderControls();
  }

  destroy() {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.spreadInterval) clearInterval(this.spreadInterval);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    sound.stopAll();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="sim-stage-split">
        <!-- 70% Left: Interactive Cyber Topology Graph & Real-Time Telemetry -->
        <div class="sim-stage-visual" id="cyber-visual-pane">
          <div class="sim-canvas-container">
            <canvas id="cyberCanvas" class="sim-canvas"></canvas>

            <!-- Network Status Bar Overlay -->
            <div class="network-status-bar">
              <div style="background:rgba(15,23,42,0.88); border:1px solid rgba(244,63,94,0.4); border-radius:8px; padding:0.5rem 1rem; backdrop-filter:blur(8px); display:flex; align-items:center; gap:0.6rem;">
                <span class="status-dot danger" style="animation:pulse-urgent 1s infinite alternate;"></span>
                <span style="font-family:var(--font-mono); font-size:0.8rem; font-weight:700; color:#fca5a5;">INCIDENT LEVEL 1 // DARK-CRYPTO RANSOMWARE ACTIVE</span>
              </div>

              <div class="sim-timer-badge urgent" id="cyber-timer">25:00</div>
            </div>

            <!-- Bottom Forensics Telemetry Bar -->
            <div style="position:absolute; bottom:20px; left:20px; right:20px; background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:0.85rem 1.25rem; display:flex; justify-content:space-between; align-items:center; backdrop-filter:blur(10px); z-index:10;">
              <div>
                <div style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; font-weight:700;">Files Encrypted / Total</div>
                <div style="font-family:var(--font-mono); font-size:1.4rem; font-weight:800; color:#f87171;" id="encrypted-files-display">80 / 15,250</div>
              </div>
              <div>
                <div style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; font-weight:700;">Operational Integrity</div>
                <div style="font-family:var(--font-mono); font-size:1.4rem; font-weight:800; color:#34d399;" id="integrity-display">88.5%</div>
              </div>
              <div>
                <div style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; font-weight:700;">Downtime Cost Incurred</div>
                <div style="font-family:var(--font-mono); font-size:1.4rem; font-weight:800; color:var(--accent-amber);" id="cost-display">₹14,000</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 30% Right: Incident Command Cockpit & Defense Toolbox -->
        <div class="sim-stage-controls" id="cyber-controls-pane">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Incident Response Console</div>
              <span class="level-chip active" style="background:#e11d48; border-color:#f43f5e;">CRISIS IN PROGRESS</span>
            </div>
          </div>

          <div id="cyber-tools-area">
            <!-- Dynamic Controls -->
          </div>
        </div>
      </div>
    `;
  }

  setupCanvas() {
    this.canvas = document.getElementById("cyberCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
    this.animate();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth * window.devicePixelRatio;
    this.canvas.height = parent.clientHeight * window.devicePixelRatio;
  }

  startCrisisTimer() {
    const timerEl = document.getElementById("cyber-timer");
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, "0");
        const secs = (this.timerSeconds % 60).toString().padStart(2, "0");
        timerEl.textContent = `${mins}:${secs}`;
      } else {
        clearInterval(this.timerInterval);
        sound.playAlarm();
        alert("25-Minute Containment Window Expired! Master database permanently wiped by threat actor.");
      }
    }, 1000);
  }

  startWormPropagation() {
    this.spreadInterval = setInterval(() => {
      let newlyInfected = false;

      // Increment encrypted files on infected nodes
      this.nodes.forEach(node => {
        if (node.status === "infected" && node.encryptedFiles < node.totalFiles) {
          const filesPerTick = Math.min(60, node.totalFiles - node.encryptedFiles);
          node.encryptedFiles += filesPerTick;
          if (node.encryptedFiles >= node.totalFiles) {
            node.status = "locked";
            sound.playGlitch();
          }
        }
      });

      // Spread along active links
      this.nodes.forEach(source => {
        if (source.status === "infected" || source.status === "locked") {
          this.links.forEach(link => {
            if (link.severed) return;
            // If firewall ports are blocked and link passes through firewall, stop SMB spread
            if (!this.firewallPortsOpen && (link.from === "firewall" || link.to === "firewall")) return;

            let targetId = null;
            if (link.from === source.id) targetId = link.to;
            if (link.to === source.id) targetId = link.from;

            if (targetId) {
              const targetNode = this.nodes.find(n => n.id === targetId);
              if (targetNode && targetNode.status === "secure" && !targetNode.airgapped) {
                targetNode.status = "infected";
                targetNode.encryptedFiles = 10;
                newlyInfected = true;
                sound.playWarning();
              }
            }
          });
        }
      });

      this.updateTelemetry();
      this.checkContainmentStatus();
    }, 1200);
  }

  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * window.devicePixelRatio;
    const clickY = (e.clientY - rect.top) * window.devicePixelRatio;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Check if clicked near an edge link to sever it!
    for (let link of this.links) {
      const nodeA = this.nodes.find(n => n.id === link.from);
      const nodeB = this.nodes.find(n => n.id === link.to);
      if (!nodeA || !nodeB) continue;

      const ax = nodeA.xRatio * w;
      const ay = nodeA.yRatio * h;
      const bx = nodeB.xRatio * w;
      const by = nodeB.yRatio * h;

      const midX = (ax + bx) / 2;
      const midY = (ay + by) / 2;
      if (Math.hypot(clickX - midX, clickY - midY) < 25) {
        sound.playClick();
        link.severed = !link.severed;
        return;
      }
    }

    // Check if clicked a node
    const hitNode = this.nodes.find(n => {
      const nx = n.xRatio * w;
      const ny = n.yRatio * h;
      return Math.hypot(clickX - nx, clickY - ny) < 35;
    });

    if (hitNode) {
      sound.playClick();
      this.selectedNode = hitNode;
      this.renderControls();
    }
  }

  renderControls() {
    const area = document.getElementById("cyber-tools-area");
    area.innerHTML = `
      <div class="crisis-banner">
        <span class="crisis-icon">🛡️</span>
        <div>
          <h4>Method (k) Incident Containment</h4>
          <p>Click on any network cable to <strong>sever subnet links</strong>. Click nodes to isolate or inject RSA decryptors.</p>
        </div>
      </div>

      <!-- Defensive Toolbox -->
      <div style="margin-bottom:1.25rem;">
        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-faint); font-weight:700; margin-bottom:0.5rem;">
          SYSTEM COUNTERMEASURES
        </div>
        <div class="network-tools-tray">
          <button id="toggle-firewall-btn" class="tool-btn ${!this.firewallPortsOpen ? 'active' : ''}">
            <span>🧱</span>
            <span>${this.firewallPortsOpen ? 'Block SMB Port 445' : 'Port 445 Blocked'}</span>
          </button>

          <button id="restore-backup-btn" class="tool-btn" ${this.backupRestoring ? 'disabled' : ''}>
            <span>💾</span>
            <span>${this.backupRestoring ? 'Restoring NAS...' : 'Restore Offline NAS'}</span>
          </button>
        </div>
      </div>

      <!-- Selected Node Inspection Panel -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:1rem; margin-bottom:1.25rem;">
        <div style="font-size:0.72rem; text-transform:uppercase; color:var(--accent-cyan); font-weight:700; margin-bottom:0.35rem;">
          TARGET NODE TELEMETRY
        </div>
        ${this.selectedNode ? `
          <div style="font-weight:700; color:#fff; font-size:0.95rem;">${this.selectedNode.name}</div>
          <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted); margin-bottom:0.6rem;">IP: ${this.selectedNode.ip} | Status: <strong style="color:${this.selectedNode.status === 'secure' ? '#34d399' : '#f87171'};">${this.selectedNode.status.toUpperCase()}</strong></div>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.8rem;">
            Encrypted: <strong>${this.selectedNode.encryptedFiles} / ${this.selectedNode.totalFiles}</strong> files
          </div>

          <div style="display:flex; gap:0.5rem;">
            <button id="isolate-node-btn" class="btn btn-subtle" style="flex:1; font-size:0.75rem; justify-content:center;">
              ✂️ Isolate Node
            </button>
            <button id="decrypt-node-btn" class="btn btn-accent" style="flex:1; font-size:0.75rem; justify-content:center;" ${this.decryptKeysLeft <= 0 || this.selectedNode.encryptedFiles === 0 ? 'disabled' : ''}>
              🔑 Decrypt (${this.decryptKeysLeft} keys left)
            </button>
          </div>
        ` : `
          <div style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">
            Click on any workstation, database, or server node to inspect telemetry.
          </div>
        `}
      </div>

      <button id="evaluate-forensics-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem;">
        📋 Run Post-Incident Forensics Audit
      </button>

      <div id="cyber-feedback" style="font-size:0.8rem; text-align:center; margin-top:0.75rem; min-height:1.2rem;"></div>
    `;

    document.getElementById("toggle-firewall-btn").addEventListener("click", () => {
      sound.playClick();
      this.firewallPortsOpen = !this.firewallPortsOpen;
      this.renderControls();
    });

    document.getElementById("restore-backup-btn").addEventListener("click", () => this.initiateBackupRestore());

    if (this.selectedNode) {
      document.getElementById("isolate-node-btn").addEventListener("click", () => this.isolateSelectedNode());
      document.getElementById("decrypt-node-btn").addEventListener("click", () => this.decryptSelectedNode());
    }

    document.getElementById("evaluate-forensics-btn").addEventListener("click", () => this.evaluateForensics());
  }

  isolateSelectedNode() {
    sound.playClick();
    this.links.forEach(l => {
      if (l.from === this.selectedNode.id || l.to === this.selectedNode.id) {
        l.severed = true;
      }
    });
    this.renderControls();
  }

  decryptSelectedNode() {
    if (this.decryptKeysLeft <= 0 || !this.selectedNode) return;
    sound.playSuccess();
    this.decryptKeysLeft--;
    this.selectedNode.status = "secure";
    this.selectedNode.encryptedFiles = 0;
    this.renderControls();
    this.updateTelemetry();
  }

  initiateBackupRestore() {
    sound.playClick();
    this.backupRestoring = true;
    this.renderControls();
    const feedback = document.getElementById("cyber-feedback");
    feedback.textContent = "Offline NAS sync initiated. Restoring uncorrupted snapshot...";

    setTimeout(() => {
      this.backupRestoring = false;
      const db = this.nodes.find(n => n.id === "database");
      if (db) {
        db.status = "secure";
        db.encryptedFiles = 0;
      }
      sound.playSuccess();
      feedback.style.color = "#34d399";
      feedback.textContent = "Database fully restored from cold backup snapshot!";
      this.renderControls();
      this.updateTelemetry();
    }, 4000);
  }

  updateTelemetry() {
    let totalFiles = 0;
    let encryptedFiles = 0;
    let healthyCount = 0;

    this.nodes.forEach(n => {
      totalFiles += n.totalFiles;
      encryptedFiles += n.encryptedFiles;
      if (n.status === "secure") healthyCount++;
    });

    const integrityPct = ((1 - encryptedFiles / totalFiles) * 100).toFixed(1);
    const downtimeCost = Math.round((Date.now() - this.incidentStartTime) * 0.08);

    const encEl = document.getElementById("encrypted-files-display");
    const intEl = document.getElementById("integrity-display");
    const costEl = document.getElementById("cost-display");

    if (encEl) encEl.textContent = `${encryptedFiles.toLocaleString()} / ${totalFiles.toLocaleString()}`;
    if (intEl) {
      intEl.textContent = `${integrityPct}%`;
      intEl.style.color = integrityPct > 80 ? "#34d399" : integrityPct > 50 ? "#f59e0b" : "#ef4444";
    }
    if (costEl) costEl.textContent = `₹${downtimeCost.toLocaleString()}`;
  }

  checkContainmentStatus() {
    const activeInfections = this.nodes.filter(n => n.status === "infected").length;
    if (activeInfections === 0 && this.nodes.find(n => n.id === "database").status === "secure") {
      const feedback = document.getElementById("cyber-feedback");
      if (feedback) {
        feedback.style.color = "#34d399";
        feedback.textContent = "Threat eradicated! Active propagation contained.";
      }
    }
  }

  evaluateForensics() {
    const db = this.nodes.find(n => n.id === "database");
    const feedback = document.getElementById("cyber-feedback");

    if (db.status === "locked") {
      sound.playAlarm();
      feedback.style.color = "#f87171";
      feedback.textContent = "Containment Failure: Master Hospital EHR Database remains locked! Restore from NAS.";
      return;
    }

    const activeInfections = this.nodes.filter(n => n.status === "infected").length;
    if (activeInfections > 0) {
      sound.playWarning();
      feedback.style.color = "#f59e0b";
      feedback.textContent = `Warning: ${activeInfections} nodes still actively encrypting files. Sever links or decrypt.`;
      return;
    }

    sound.playSuccess();
    this.completeMission();
  }

  completeMission() {
    clearInterval(this.timerInterval);
    clearInterval(this.spreadInterval);

    const modalArea = document.createElement("div");
    modalArea.style.cssText = `
      position:fixed; inset:0; background:rgba(5,8,16,0.9); backdrop-filter:blur(12px);
      z-index:300; display:flex; align-items:center; justify-content:center; padding:1.5rem;
    `;
    modalArea.innerHTML = `
      <div class="value-card-modal" style="max-width:580px; width:100%;">
        <div style="text-align:center; margin-bottom:1.5rem;">
          <div style="font-size:2.5rem; margin-bottom:0.25rem;">🛡️🏆</div>
          <h2 style="font-size:1.5rem; color:#fff;">Mission 5: Ransomware Defense Mastered</h2>
          <p style="font-size:0.85rem; color:var(--accent-cyan);">Domain 5: Digital Frontier & Security Cleared</p>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:1rem; margin-bottom:1.25rem; font-size:0.85rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
            <span style="color:var(--text-muted);">Master EHR Database:</span>
            <strong style="color:#34d399;">100% Preserved & Operational</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
            <span style="color:var(--text-muted);">Containment Response Time:</span>
            <strong style="color:var(--accent-cyan);">${Math.floor((25*60 - this.timerSeconds) / 60)}m ${(25*60 - this.timerSeconds) % 60}s</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">First-Principles Cryptography:</span>
            <span style="color:#fff;"> One-way hash functions & air-gap architecture verified.</span>
          </div>
        </div>

        <div class="physical-brief-box" style="margin-bottom:1.5rem;">
          <div class="physical-brief-header">
            <span>🔬</span>
            <span>NEXT 50%: Classroom Physical Build Project</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.6rem;">
            Assemble the <strong>Air-Gapped Physical Network Topology & Fail-Safe Cut-Switch</strong> on a physical breadboard with LED nodes and manual circuit disconnect switches!
          </p>
          <button id="view-ransomware-lab-brief-btn" class="btn btn-subtle" style="font-size:0.75rem; padding:0.4rem 0.8rem;">
            Open Classroom Physical Lab Brief 📋
          </button>
        </div>

        <button id="exit-cyber-sim-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem;">
          Return to Mission Command
        </button>
      </div>
    `;

    document.body.appendChild(modalArea);
    document.getElementById("view-ransomware-lab-brief-btn").addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("open-physical-brief", { detail: "sim-ransomware" }));
    });
    document.getElementById("exit-cyber-sim-btn").addEventListener("click", () => {
      modalArea.remove();
      if (this.onComplete) this.onComplete();
    });
  }

  animate() {
    this.drawTopology();
    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  drawTopology() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw Links
    this.links.forEach(link => {
      const nodeA = this.nodes.find(n => n.id === link.from);
      const nodeB = this.nodes.find(n => n.id === link.to);
      if (!nodeA || !nodeB) return;

      const ax = nodeA.xRatio * w;
      const ay = nodeA.yRatio * h;
      const bx = nodeB.xRatio * w;
      const by = nodeB.yRatio * h;

      if (link.severed) {
        // Severed link
        ctx.strokeStyle = "rgba(244, 63, 94, 0.4)";
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cut icon marker
        ctx.fillStyle = "#f43f5e";
        ctx.font = "12px sans-serif";
        ctx.fillText("✂️", (ax + bx) / 2, (ay + by) / 2);
      } else {
        // Active link
        const infectedConnection = nodeA.status !== "secure" || nodeB.status !== "secure";
        ctx.strokeStyle = infectedConnection ? "rgba(239, 68, 68, 0.7)" : "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    });

    // Draw Nodes
    this.nodes.forEach(node => {
      const nx = node.xRatio * w;
      const ny = node.yRatio * h;

      let nodeColor = "#10b981"; // Secure
      if (node.status === "infected") nodeColor = "#f59e0b"; // Compromised pulsing
      if (node.status === "locked") nodeColor = "#ef4444"; // Encrypted

      // Halo glow
      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.arc(nx, ny, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = this.selectedNode && this.selectedNode.id === node.id ? "#fff" : "rgba(255,255,255,0.3)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Node Icon / Type
      ctx.fillStyle = "#000";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const icon = node.id.includes("database") ? "💾" : node.id.includes("firewall") ? "🧱" : node.id.includes("ad") ? "👑" : node.id.includes("nas") ? "🔒" : "💻";
      ctx.fillText(icon, nx, ny);

      // Node Name Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(node.name.split(" ")[0], nx, ny + 32);
    });
  }
}
