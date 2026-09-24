import * as THREE from "three";
import { MixZone } from "./MixZone.js";

export class MixSystem {
  constructor(bowl, audio) {
    this.zone = new MixZone(bowl, .28); this.audio = audio; this.lastQuaternion = new THREE.Quaternion(); this.hasRotation = false; this.soundCooldown = 0;
  }
  update(whisk, delta) {
    if (!whisk) { this.hasRotation = false; return this.zone.progress; }
    const before = this.zone.progress; const progress = this.zone.update(whisk);
    if (this.hasRotation && progress > before) {
      const angular = 1 - Math.abs(this.lastQuaternion.dot(whisk.quaternion));
      this.zone.progress = Math.min(100, progress + angular * 210);
    }
    this.lastQuaternion.copy(whisk.quaternion); this.hasRotation = true; this.soundCooldown -= delta;
    if (this.zone.progress > before && this.soundCooldown <= 0) { this.audio.mix(); this.soundCooldown = .28; }
    return this.zone.progress;
  }
}
