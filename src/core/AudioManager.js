export class AudioManager {
  constructor() { this.enabled = true; this.context = null; }
  unlock() {
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") this.context.resume();
  }
  tone(frequency = 520, duration = .12, type = "sine") {
    if (!this.enabled) return;
    this.unlock();
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.07, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(); oscillator.stop(this.context.currentTime + duration);
  }
  success() { this.tone(660, .1); setTimeout(() => this.tone(880, .18), 100); }
  crack() { this.tone(170, .08, "triangle"); }
  pour() { this.tone(310, .18); }
  oven() { this.tone(220, .35, "square"); }
  speak(text) {
    if (!this.enabled || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = "fr-FR"; voice.rate = .95; voice.pitch = 1.05;
    speechSynthesis.speak(voice);
  }
}
