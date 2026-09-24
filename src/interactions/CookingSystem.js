import { CookingZone } from "./CookingZone.js";

export class CookingSystem {
  constructor(kitchen, ovenZone, audio, duration = 6) { this.kitchen = kitchen; this.ovenZone = ovenZone; this.audio = audio; this.timer = new CookingZone(duration); }
  insert(pan) { if (!this.ovenZone.contains(pan)) return false; this.kitchen.setOvenOpen(false); this.kitchen.setOvenCooking(true); this.audio.oven(); this.timer.start(); return true; }
  update(delta) { return this.timer.update(delta); }
  get finished() { return this.timer.finished; }
  finish() { this.timer.stop(); this.kitchen.setOvenCooking(false); this.kitchen.setOvenOpen(true); }
}
