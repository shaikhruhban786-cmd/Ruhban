/**
 * Web Audio API Sound & Music Synthesizer
 * Zero-latency procedural sound effects, mechanical keyboard clicks, impacts, and ambient music.
 */

import { WeaponType } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private droneInterval: number | null = null;

  public soundEnabled: boolean = true;
  public musicEnabled: boolean = true;
  public effectsEnabled: boolean = true;
  public typingSound: boolean = true;
  public sfxVolume: number = 0.8;
  public musicVolume: number = 0.4;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.sfxVolume;
        this.sfxGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.musicVolume;
        this.musicGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public updateSettings(settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    effectsEnabled?: boolean;
    typingSound: boolean;
    sfxVolume: number;
    musicVolume: number;
  }) {
    this.soundEnabled = settings.soundEnabled;
    this.musicEnabled = settings.musicEnabled;
    if (settings.effectsEnabled !== undefined) this.effectsEnabled = settings.effectsEnabled;
    this.typingSound = settings.typingSound;
    this.sfxVolume = settings.sfxVolume;
    this.musicVolume = settings.musicVolume;

    if (this.sfxGain) {
      this.sfxGain.gain.value = this.soundEnabled && this.effectsEnabled ? this.sfxVolume : 0;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = this.soundEnabled && this.musicEnabled ? this.musicVolume : 0;
    }

    if (!this.musicEnabled && this.isMusicPlaying) {
      this.stopBattleMusic();
    }
  }

  // --- MECHANICAL KEYBOARD TYPING SOUNDS ---
  public playKeyClick(char: string = 'a') {
    if (!this.soundEnabled || !this.typingSound) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Subtle pitch variance based on character
    const charCode = char.charCodeAt(0) || 65;
    const baseFreq = char === ' ' ? 220 : 600 + (charCode % 12) * 25;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.04);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);

    // Subtle mechanical tactile click noise
    const bufferSize = this.ctx.sampleRate * 0.015;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06 * this.sfxVolume, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    noise.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);
  }

  public playKeyError() {
    if (!this.soundEnabled || !this.typingSound) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(85, t + 0.12);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // --- ATTACK & WEAPON SOUNDS ---
  public playAttack(weapon: WeaponType = 'sword', isCritical: boolean = false) {
    if (!this.soundEnabled || !this.effectsEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    if (weapon === 'gun') {
      // Gunshot: explosive transient + metallic reverb
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
      gain.gain.setValueAtTime((isCritical ? 0.6 : 0.4) * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.22);
    } else if (weapon === 'energy') {
      // Cyber energy beam / lightsaber slash
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.18);
      gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.22);
    } else {
      // Blade / Axe / Spear whoosh & clash
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isCritical ? 450 : 320, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + (isCritical ? 0.25 : 0.14));
      gain.gain.setValueAtTime((isCritical ? 0.5 : 0.3) * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isCritical ? 0.25 : 0.15));
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.26);
    }

    if (isCritical) {
      this.playCriticalImpact();
    }
  }

  public playHitImpact() {
    if (!this.soundEnabled || !this.effectsEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playCriticalImpact() {
    if (!this.soundEnabled || !this.effectsEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Sub-bass hit
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.35);

    subGain.gain.setValueAtTime(0.6 * this.sfxVolume, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(t);
    subOsc.stop(t + 0.4);
  }

  // --- COMBO MILESTONE SOUNDS ---
  public playComboMilestone(tier: number) {
    if (!this.soundEnabled || !this.effectsEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    const baseFreq = notes[Math.min(tier, notes.length - 1)];

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.25);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // --- ENEMY ATTACK SOUND ---
  public playEnemyStrike() {
    if (!this.soundEnabled || !this.effectsEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // --- VICTORY & DEFEAT ---
  public playVictoryFanfare() {
    if (!this.soundEnabled || !this.effectsEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const chords = [
      { freq: 261.63, delay: 0 },    // C4
      { freq: 329.63, delay: 0.1 },  // E4
      { freq: 392.00, delay: 0.2 },  // G4
      { freq: 523.25, delay: 0.35 }, // C5
      { freq: 659.25, delay: 0.5 },  // E5
      { freq: 783.99, delay: 0.65 }  // G5
    ];

    chords.forEach(({ freq, delay }) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  public playDefeat() {
    if (!this.soundEnabled || !this.effectsEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.8);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.9);
  }

  // --- BUTTON CLICKS & UI FEEDBACK ---
  public playButtonClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playButtonHover() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.04);

    gain.gain.setValueAtTime(0.06 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // --- CINEMATIC PROCEDURAL BATTLE AMBIENT MUSIC ---
  public startBattleMusic() {
    if (!this.soundEnabled || !this.musicEnabled || this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    this.stopBattleMusic(); // clean up any remnants

    // Cinematic deep drone bass pad
    const freqs = [65.41, 98.0, 130.81]; // C2, G2, C3
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08 * (1 / (idx + 1)), this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start();
      this.musicOscillators.push({ osc, gain });
    });

    // Procedural rhythmic low-pulse bass heartbeat
    let beat = 0;
    this.droneInterval = window.setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Alternating 4/4 battle pulse
      const freq = beat % 4 === 0 ? 55 : 65.41;
      beat++;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.5);
    }, 700);
  }

  public stopBattleMusic() {
    this.isMusicPlaying = false;
    if (this.droneInterval !== null) {
      clearInterval(this.droneInterval);
      this.droneInterval = null;
    }
    this.musicOscillators.forEach(({ osc, gain }) => {
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, (this.ctx?.currentTime || 0) + 0.3);
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        }, 350);
      } catch {}
    });
    this.musicOscillators = [];
  }
}

export const soundEngine = new SoundEngine();
