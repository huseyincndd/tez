// Web Audio API ile rahatlatıcı ortam sesi üreticisi (MP3 dosyası olmadan da gerçek ses verir)
class AmbientZenSound {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isPlaying = false;

  private init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();
  }

  public play() {
    try {
      this.init();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (this.isPlaying) return;

      const now = this.ctx.currentTime;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.2, now + 2);
      this.masterGain.connect(this.ctx.destination);

      // Ana ton (432Hz - Tibet Çanağı / Derin Meditasyon Tonu)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(432, now);

      // İkincil harmonik (216Hz - Sıcak alt ton)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'sine';
      this.osc2.frequency.setValueAtTime(216, now);

      // Nefes alma hissi veren yavaş LFO (Low Frequency Oscillator)
      this.lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.lfo.frequency.setValueAtTime(0.12, now); // 8 saniyede bir nefes döngüsü
      lfoGain.gain.setValueAtTime(0.08, now);

      this.lfo.connect(lfoGain);
      if (this.masterGain) {
        lfoGain.connect(this.masterGain.gain);
      }

      this.osc1.connect(this.masterGain);
      this.osc2.connect(this.masterGain);

      this.osc1.start();
      this.osc2.start();
      this.lfo.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('AudioContext ses başlatılamadı:', e);
    }
  }

  public pause() {
    try {
      if (this.masterGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        setTimeout(() => {
          this.stop();
        }, 500);
      } else {
        this.stop();
      }
    } catch {
      this.stop();
    }
  }

  public stop() {
    try {
      if (this.osc1) {
        this.osc1.stop();
        this.osc1.disconnect();
      }
      if (this.osc2) {
        this.osc2.stop();
        this.osc2.disconnect();
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
      }
    } catch {
      // ignore
    }
    this.osc1 = null;
    this.osc2 = null;
    this.lfo = null;
    this.isPlaying = false;
  }
}

export const ambientSound = new AmbientZenSound();
