/**
 * Superhuman Society - Hero Motion Graphics & Kinetic Visuals Controller
 * High-performance 60fps canvas particle constellation, 3D card tilt & dynamic specular lighting.
 */

export class HeroMotionController {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.heroSection = null;
    this.animId = null;
    this.isRunning = false;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    // Interactive mouse state
    this.mouse = {
      x: -9999,
      y: -9999,
      smoothX: -9999,
      smoothY: -9999,
      isHovering: false,
      radius: 175
    };

    // Autonomous wandering beacon for idle animation
    this.wanderAngle = 0;

    // Particles and motes
    this.particles = [];
    this.dustMotes = [];
    this.particleCount = 68;
    this.dustCount = 42;
    this.maxConnectDist = 125;

    // Color palette matching the Superhuman Society theme
    this.palette = [
      { r: 56, g: 189, b: 248 },   // Cyan #38bdf8
      { r: 129, g: 140, b: 248 },  // Indigo #818cf8
      { r: 168, g: 85, b: 247 },   // Purple #a855f7
      { r: 16, g: 185, b: 129 },   // Emerald #10b981
      { r: 245, g: 158, b: 11 }    // Amber #f59e0b
    ];

    // Bound methods
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.renderLoop = this.renderLoop.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  init() {
    if (typeof document === "undefined") return;

    this.canvas = document.getElementById("hero-motion-canvas");
    this.heroSection = document.querySelector(".hero");

    if (!this.canvas || !this.heroSection) {
      return;
    }

    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) return;

    this.setupCanvasDimensions();
    this.initParticles();
    this.setupEventListeners();
    this.attachCardListeners();
    this.attachButtonMagneticListeners();
    this.start();
  }

  setupCanvasDimensions() {
    if (!this.canvas || !this.heroSection) return;

    const rect = this.heroSection.getBoundingClientRect();
    this.dpr = (typeof window !== "undefined" && window.devicePixelRatio) ? Math.min(window.devicePixelRatio, 2) : 1;
    this.width = Math.max(rect.width || 0, 320);
    this.height = Math.max(rect.height || 0, 300);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    if (this.ctx && typeof this.ctx.setTransform === "function") {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    // Adapt particle count to viewport width
    if (this.width < 768) {
      this.particleCount = 38;
      this.dustCount = 24;
      this.maxConnectDist = 95;
    } else {
      this.particleCount = 68;
      this.dustCount = 42;
      this.maxConnectDist = 125;
    }
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      const color = this.palette[Math.floor(Math.random() * this.palette.length)];
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        originX: Math.random() * this.width,
        originY: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: 1.3 + Math.random() * 1.6,
        color: color,
        alpha: 0.35 + Math.random() * 0.45,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        hasHalo: Math.random() < 0.22,
        haloRadius: 0,
        haloMaxRadius: 18 + Math.random() * 14
      });
    }

    // Parallax background dust motes
    this.dustMotes = [];
    for (let i = 0; i < this.dustCount; i++) {
      this.dustMotes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.1 - Math.random() * 0.15,
        radius: 0.6 + Math.random() * 0.8,
        alpha: 0.12 + Math.random() * 0.28
      });
    }
  }

  setupEventListeners() {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.handleResize, { passive: true });
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }

    if (this.heroSection) {
      this.heroSection.addEventListener("mousemove", this.handleMouseMove, { passive: true });
      this.heroSection.addEventListener("mouseenter", this.handleMouseEnter, { passive: true });
      this.heroSection.addEventListener("mouseleave", this.handleMouseLeave, { passive: true });
    }

    // Pause canvas when simulation cockpit viewport is opened
    if (typeof document !== "undefined") {
      const cockpit = document.getElementById("simulation-viewport");
      if (cockpit && typeof window !== "undefined" && window.MutationObserver) {
        const observer = new MutationObserver(() => {
          const isCockpitActive = cockpit.classList.contains("active");
          if (isCockpitActive && this.isRunning) {
            this.stop();
          } else if (!isCockpitActive && !this.isRunning && !document.hidden) {
            this.start();
          }
        });
        observer.observe(cockpit, { attributes: true, attributeFilter: ["class"] });
      }
    }
  }

  handleResize() {
    this.setupCanvasDimensions();
    // Keep particles within new boundaries
    this.particles.forEach(p => {
      p.x = Math.min(Math.max(p.x, 0), this.width);
      p.y = Math.min(Math.max(p.y, 0), this.height);
    });
  }

  handleMouseMove(e) {
    if (!this.heroSection) return;
    const rect = this.heroSection.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
    this.mouse.isHovering = true;
  }

  handleMouseEnter(e) {
    if (!this.heroSection) return;
    const rect = this.heroSection.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
    if (this.mouse.smoothX < 0) {
      this.mouse.smoothX = this.mouse.x;
      this.mouse.smoothY = this.mouse.y;
    }
    this.mouse.isHovering = true;
  }

  handleMouseLeave() {
    this.mouse.isHovering = false;
  }

  handleVisibilityChange() {
    if (typeof document === "undefined") return;
    if (document.hidden) {
      this.stop();
    } else {
      const cockpit = document.getElementById("simulation-viewport");
      const isCockpitActive = cockpit && cockpit.classList.contains("active");
      if (!isCockpitActive) {
        this.start();
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.renderLoop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  renderLoop() {
    if (!this.isRunning) return;

    this.update();
    this.draw();

    if (typeof requestAnimationFrame === "function") {
      this.animId = requestAnimationFrame(this.renderLoop);
    }
  }

  update() {
    // Smooth mouse coordinates interpolation
    if (this.mouse.isHovering) {
      this.mouse.smoothX += (this.mouse.x - this.mouse.smoothX) * 0.12;
      this.mouse.smoothY += (this.mouse.y - this.mouse.smoothY) * 0.12;
    } else {
      // Idle breathing wanderer motion
      this.wanderAngle += 0.016;
      const centerX = this.width * 0.5;
      const centerY = this.height * 0.38;
      const targetX = centerX + Math.cos(this.wanderAngle) * (this.width * 0.36);
      const targetY = centerY + Math.sin(this.wanderAngle * 1.4) * (this.height * 0.22);
      this.mouse.smoothX += (targetX - this.mouse.smoothX) * 0.04;
      this.mouse.smoothY += (targetY - this.mouse.smoothY) * 0.04;
    }

    // Update background dust motes
    for (let i = 0; i < this.dustMotes.length; i++) {
      const mote = this.dustMotes[i];
      mote.x += mote.vx;
      mote.y += mote.vy;
      if (mote.y < -10) {
        mote.y = this.height + 10;
        mote.x = Math.random() * this.width;
      }
      if (mote.x < -10) mote.x = this.width + 10;
      if (mote.x > this.width + 10) mote.x = -10;
    }

    // Update particles
    const interactionX = this.mouse.smoothX;
    const interactionY = this.mouse.smoothY;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Base drift
      p.x += p.vx;
      p.y += p.vy;

      // Pulse alpha
      p.pulsePhase += p.pulseSpeed;

      // Halo ring animation
      if (p.hasHalo) {
        p.haloRadius += 0.3;
        if (p.haloRadius > p.haloMaxRadius) {
          p.haloRadius = 0;
        }
      }

      // Bounce gracefully at edges
      if (p.x <= 0 || p.x >= this.width) p.vx *= -1;
      if (p.y <= 0 || p.y >= this.height) p.vy *= -1;

      // Interactive mouse ripple physics
      const dx = p.x - interactionX;
      const dy = p.y - interactionY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.mouse.radius && dist > 0.001) {
        // Elastic gentle repulsion
        const force = (1 - dist / this.mouse.radius) * 1.8;
        const angle = Math.atan2(dy, dx);
        p.x += Math.cos(angle) * force;
        p.y += Math.sin(angle) * force;
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw subtle ambient cursor aura
    if (this.mouse.smoothX > -100 && this.mouse.smoothY > -100 && typeof ctx.createRadialGradient === "function") {
      try {
        const auraGradient = ctx.createRadialGradient(
          this.mouse.smoothX, this.mouse.smoothY, 0,
          this.mouse.smoothX, this.mouse.smoothY, 200
        );
        auraGradient.addColorStop(0, "rgba(56, 189, 248, 0.065)");
        auraGradient.addColorStop(0.5, "rgba(99, 102, 241, 0.025)");
        auraGradient.addColorStop(1, "transparent");
        ctx.fillStyle = auraGradient;
        ctx.fillRect(0, 0, this.width, this.height);
      } catch (e) {}
    }

    // 2. Draw background dust motes (depth layer)
    for (let i = 0; i < this.dustMotes.length; i++) {
      const mote = this.dustMotes[i];
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(186, 230, 253, ${mote.alpha})`;
      ctx.fill();
    }

    // 3. Draw constellation filament lines between nearby particles
    ctx.lineWidth = 0.85;
    const len = this.particles.length;

    for (let i = 0; i < len; i++) {
      const p1 = this.particles[i];

      for (let j = i + 1; j < len; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxConnectDist) {
          const alphaFactor = (1 - dist / this.maxConnectDist);
          const lineAlpha = alphaFactor * 0.22;

          if (typeof ctx.createLinearGradient === "function") {
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${lineAlpha})`);
            grad.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${lineAlpha})`);
            ctx.strokeStyle = grad;
          } else {
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
          }

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Draw filament connecting particle to mouse if nearby
      if (this.mouse.smoothX > -100) {
        const mdx = p1.x - this.mouse.smoothX;
        const mdy = p1.y - this.mouse.smoothY;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        const mouseConnectThreshold = this.mouse.radius * 0.88;

        if (mdist < mouseConnectThreshold) {
          const mAlpha = (1 - mdist / mouseConnectThreshold) * 0.3;
          ctx.strokeStyle = `rgba(56, 189, 248, ${mAlpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(this.mouse.smoothX, this.mouse.smoothY);
          ctx.stroke();
        }
      }
    }

    // 4. Draw particles and glowing halos
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];
      const pulsedAlpha = Math.max(0.2, p.alpha + Math.sin(p.pulsePhase) * 0.2);

      // Glowing Halo Ring
      if (p.hasHalo && p.haloRadius > 0) {
        const haloAlpha = (1 - p.haloRadius / p.haloMaxRadius) * 0.32;
        ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${haloAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.haloRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Core particle dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${pulsedAlpha})`;
      ctx.fill();
    }

    // 5. Draw active cursor reticle if hovering
    if (this.mouse.isHovering && this.mouse.smoothX > 0 && this.mouse.smoothY > 0) {
      ctx.beginPath();
      ctx.arc(this.mouse.smoothX, this.mouse.smoothY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
      ctx.fill();
    }
  }

  /**
   * Attach 3D tilt and specular lighting listeners to .criterion-card elements
   */
  attachCardListeners() {
    if (typeof document === "undefined") return;
    const cards = document.querySelectorAll(".criterion-card");
    if (!cards || cards.length === 0) return;

    cards.forEach(card => {
      // Ensure specular shine element exists
      if (!card.querySelector(".card-specular-shine")) {
        const shine = document.createElement("div");
        shine.className = "card-specular-shine";
        card.appendChild(shine);
      }

      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normalized offsets (-0.5 to 0.5)
        const normX = x / rect.width - 0.5;
        const normY = y / rect.height - 0.5;

        // Max tilt angles: 10 deg
        const rotX = (-normY * 11).toFixed(2);
        const rotY = (normX * 11).toFixed(2);

        card.style.transform = `perspective(850px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty("--mouse-x", `${(x / rect.width * 100).toFixed(1)}%`);
        card.style.setProperty("--mouse-y", `${(y / rect.height * 100).toFixed(1)}%`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "perspective(850px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)";
        card.style.removeProperty("--mouse-x");
        card.style.removeProperty("--mouse-y");
      });
    });
  }

  /**
   * Attach subtle magnetic hover effect to Hero CTA buttons
   */
  attachButtonMagneticListeners() {
    if (typeof document === "undefined") return;
    const buttons = document.querySelectorAll(".hero-actions-bar .btn-cta");
    if (!buttons || buttons.length === 0) return;

    buttons.forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);

        // Subtle magnetic pull (max 5px displacement)
        const pullX = (x * 0.12).toFixed(1);
        const pullY = (y * 0.12).toFixed(1);

        btn.style.transform = `translate(${pullX}px, ${pullY}px) translateY(-2px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0px, 0px) translateY(0px)";
      });
    });
  }
}
