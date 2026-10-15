/**
 * Procedural Audio Engine (Web Audio API)
 * Generates tactile sound effects directly without external asset dependencies.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.heartbeatTimer = null;
    let savedVol = null;
    try {
      savedVol = localStorage.getItem("cognition_lab_volume");
    } catch (e) {}
    this.volume = savedVol !== null ? parseFloat(savedVol) : 0.35; // Default 35% classroom-friendly
    this.masterGain = null;
    this.isClassroomMode = (this.volume <= 0.20 && this.volume > 0);
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.getMasterNode();
  }

  getMasterNode() {
    if (!this.ctx) return null;
    if (!this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.masterGain;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.ctx) {
      const master = this.getMasterNode();
      if (master) {
        master.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }
    this.isClassroomMode = (this.volume <= 0.20 && this.volume > 0);
    try {
      localStorage.setItem("cognition_lab_volume", String(this.volume));
    } catch (e) {}
  }

  getVolume() {
    return this.volume;
  }

  setClassroomMode(enabled) {
    if (enabled) {
      this.setVolume(0.15); // 15% whisper volume
    } else {
      this.setVolume(0.40); // 40% standard volume
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopAll();
    }
    return this.enabled;
  }

  stopAll() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.ctx) {
      try {
        if (this.ctx.state === "running") {
          this.ctx.suspend();
        }
      } catch (e) {
        console.warn("AudioContext suspend error:", e);
      }
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.getMasterNode() || this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(this.getMasterNode() || this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.07);
      osc.stop(this.ctx.currentTime + idx * 0.07 + 0.25);
    });
  }

  playSuccessChime() {
    this.playSuccess();
  }

  playWarning() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    [0, 0.12].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime + offset);
      osc.frequency.setValueAtTime(330, this.ctx.currentTime + offset + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + offset + 0.1);

      osc.connect(gain);
      gain.connect(this.getMasterNode() || this.ctx.destination);

      osc.start(this.ctx.currentTime + offset);
      osc.stop(this.ctx.currentTime + offset + 0.1);
    });
  }

  playBuzzer() {
    this.playWarning();
  }

  playAlarm() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.2);
    osc.frequency.linearRampToValueAtTime(800, now + 0.4);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.getMasterNode() || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  playHeartbeat(intensity = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Lub (Atrioventricular closure)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(65, now);
    osc1.frequency.exponentialRampToValueAtTime(35, now + 0.09);
    gain1.gain.setValueAtTime(0.25 * intensity, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc1.connect(gain1);
    gain1.connect(this.getMasterNode() || this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Dub (Semilunar closure)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(85, now + 0.14);
    osc2.frequency.exponentialRampToValueAtTime(45, now + 0.22);
    gain2.gain.setValueAtTime(0.2 * intensity, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc2.connect(gain2);
    gain2.connect(this.getMasterNode() || this.ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.24);
  }

  playEarthquake(magnitude = 5.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const duration = 1.2;
    const now = this.ctx.currentTime;

    // Deep sub-bass oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(40 + magnitude * 5, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + duration);

    const volume = Math.min(0.35, 0.05 + (magnitude / 10) * 0.3);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.getMasterNode() || this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playGlitch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.setValueAtTime(240, this.ctx.currentTime + 0.04);
    osc.frequency.setValueAtTime(950, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.getMasterNode() || this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playCountdownTick(isFinal = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isFinal) {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.getMasterNode() || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.getMasterNode() || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  playCommsChirp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Walkie talkie squelch tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1750, now);
    osc.frequency.setValueAtTime(2350, now + 0.04);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.getMasterNode() || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playBridgeCrash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Low frequency structural snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.getMasterNode() || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  }
}

export const sound = new SoundEngine();
