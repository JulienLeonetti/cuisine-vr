export class PourSystem {
  constructor(bowlZone, panZone, audio) { this.bowlZone = bowlZone; this.panZone = panZone; this.audio = audio; }
  ingredientDropped(object) { return this.bowlZone.contains(object); }
  bowlPoured(object) { if (!this.panZone.contains(object)) return false; this.audio.pour(); return true; }
}
