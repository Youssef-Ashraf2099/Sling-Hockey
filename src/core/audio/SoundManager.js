class SoundManager {
  constructor() {
    this.ctx = null;
    this.isEnabled = true;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported");
      this.isEnabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Synthesis helpers
  createGain(start = 1, duration = 0.1) {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(start, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    return gain;
  }

  // --- Sound Effects ---

  // Snappy whoosh for launching pucks
  playLaunch(intensity = 1) {
    if (!this.isEnabled) return;
    this.init();
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Frequency sweep
    osc.type = "triangle";
    osc.frequency.setValueAtTime(100 + intensity * 50, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800 + intensity * 400, this.ctx.currentTime + 0.15);

    // Envelope
    gain.gain.setValueAtTime(0.2 * intensity, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Percussive clack for collisions (Walking stick tap style)
  playCollision(intensity = 1) {
    if (!this.isEnabled) return;
    this.init();
    this.resume();

    const volume = Math.min(intensity * 0.4, 0.3);
    if (volume < 0.01) return;

    // A walking stick tap is a sharp, high-frequency "tock"
    const duration = 0.04;
    
    // Main "Tick" component
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    
    // Higher frequency for a wood-like "tock"
    osc.type = "sine";
    osc.frequency.setValueAtTime(600 + intensity * 200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);
    
    oscGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);

    // Subtle resonance (hollow sound)
    const res = this.ctx.createOscillator();
    const resGain = this.ctx.createGain();
    res.type = "triangle";
    res.frequency.setValueAtTime(400, this.ctx.currentTime);
    resGain.gain.setValueAtTime(volume * 0.3, this.ctx.currentTime);
    resGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration * 2);
    
    res.connect(resGain);
    resGain.connect(this.ctx.destination);
    res.start();
    res.stop(this.ctx.currentTime + duration * 2);
  }

  // Happy jingle for scoring
  playGoal() {
    if (!this.isEnabled) return;
    this.init();
    this.resume();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
    });
  }

  // Soft click for UI
  playClick() {
    if (!this.isEnabled) return;
    this.init();
    this.resume();
    this.playNote(800, 0, 0.05, "sine", 0.05);
  }

  // Snappy sound for equipping items
  playEquip() {
    if (!this.isEnabled) return;
    this.init();
    this.resume();
    this.playNote(400, 0, 0.1, "sine");
    this.playNote(600, 0.05, 0.1, "sine");
  }

  // Big celebration for winning
  playWin() {
    if (!this.isEnabled) return;
    this.init();
    this.resume();

    // Arpeggio leading to a chord
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4 to G5
    arpeggio.forEach((freq, i) => {
      this.playNote(freq, 0.1 * i, 0.4);
    });
    
    // Final chord
    [523.25, 659.25, 783.99].forEach(freq => {
      this.playNote(freq, arpeggio.length * 0.1, 1.0, "square", 0.05);
    });
  }

  // Level up celebration sound
  playLevelUp() {
    if (!this.isEnabled) return;
    this.init();
    this.resume();

    // Ascending magical sound
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 to C6
    notes.forEach((freq, i) => {
      this.playNote(freq, 0.15 * i, 0.3, "triangle", 0.08);
    });
    
    // Sparkle effect
    setTimeout(() => {
      [1318.51, 1567.98, 2093.00].forEach((freq, i) => {
        this.playNote(freq, 0.05 * i, 0.2, "sine", 0.04);
      });
    }, 200);
  }

  playNote(freq, delay, duration, type = "sine", vol = 0.1) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }
}

export const soundManager = new SoundManager();
