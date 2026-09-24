import * as THREE from "three";
export class MixZone {
  constructor(bowl, radius = .22) { this.bowl = bowl; this.radius = radius; this.progress = 0; this.lastPosition = new THREE.Vector3(); this.started = false; }
  update(whisk) {
    const whiskPosition = whisk.getWorldPosition(new THREE.Vector3()); const bowlPosition = this.bowl.getWorldPosition(new THREE.Vector3());
    if (whiskPosition.distanceTo(bowlPosition) > this.radius) { this.started = false; return this.progress; }
    if (this.started) this.progress = Math.min(100, this.progress + whiskPosition.distanceTo(this.lastPosition) * 260);
    this.lastPosition.copy(whiskPosition); this.started = true; return this.progress;
  }
  reset() { this.progress = 0; this.started = false; }
}
