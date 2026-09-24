import * as THREE from "three";

export const AUDIO_MANIFEST = Object.freeze({
  village: "/audio/village-ambience.ogg",
  wind: "/audio/mediterranean-wind.ogg",
  birds: "/audio/birds.ogg",
  crack: "/audio/egg-crack.ogg",
  mix: "/audio/whisk.ogg",
  pour: "/audio/pour.ogg",
  oven: "/audio/oven.ogg",
  success: "/audio/success.ogg"
});

export class AudioManager {
  constructor() {
    this.enabled = true; this.context = null; this.listener = null; this.buffers = new Map(); this.loader = new THREE.AudioLoader();
  }
  configureCamera(camera) { this.listener ??= new THREE.AudioListener(); this.context = this.listener.context; if (!this.listener.parent) camera.add(this.listener); }
  unlock() {
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") this.context.resume();
  }
  async load(name, url = AUDIO_MANIFEST[name]) {
    if (!url || this.buffers.has(name)) return this.buffers.get(name) ?? null;
    try { const buffer = await this.loader.loadAsync(url); this.buffers.set(name, buffer); return buffer; }
    catch { return null; }
  }
  playBuffer(name, { parent = null, loop = false, volume = .35, distance = 3 } = {}) {
    if (!this.enabled || !this.listener || !this.buffers.has(name)) return null;
    const sound = parent ? new THREE.PositionalAudio(this.listener) : new THREE.Audio(this.listener);
    sound.setBuffer(this.buffers.get(name)); sound.setLoop(loop); sound.setVolume(volume);
    if (sound.isPositionalAudio) sound.setRefDistance(distance);
    (parent ?? this.listener).add(sound); sound.play(); return sound;
  }
  tone(frequency = 520, duration = .12, type = "sine") {
    if (!this.enabled) return;
    this.unlock(); const oscillator = this.context.createOscillator(); const gain = this.context.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.07, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, this.context.currentTime + duration); oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(); oscillator.stop(this.context.currentTime + duration);
  }
  fallback(name, tone) { if (!this.playBuffer(name)) tone(); }
  success() { this.fallback("success", () => { this.tone(660, .1); setTimeout(() => this.tone(880, .18), 100); }); }
  crack() { this.fallback("crack", () => this.tone(170, .08, "triangle")); }
  pour() { this.fallback("pour", () => this.tone(310, .18)); }
  mix() { this.fallback("mix", () => this.tone(245, .07, "sine")); }
  oven() { this.fallback("oven", () => this.tone(220, .35, "square")); }
  speak(text) {
    if (!this.enabled || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel(); const voice = new SpeechSynthesisUtterance(text); voice.lang = "fr-FR"; voice.rate = .95; voice.pitch = 1.05; speechSynthesis.speak(voice);
  }
}
