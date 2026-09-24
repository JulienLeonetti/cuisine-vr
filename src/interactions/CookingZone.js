export class CookingZone {
  constructor(duration = 5) { this.duration = duration; this.elapsed = 0; this.active = false; }
  start() { this.elapsed = 0; this.active = true; }
  update(delta) { if (!this.active) return 0; this.elapsed += delta; return Math.min(1, this.elapsed / this.duration); }
  get finished() { return this.active && this.elapsed >= this.duration; }
  stop() { this.active = false; }
}
