import * as THREE from "three";
export class DropZone {
  constructor(target, radius = .22, offset = new THREE.Vector3()) { this.target = target; this.radius = radius; this.offset = offset; this.targetPosition = new THREE.Vector3(); this.objectPosition = new THREE.Vector3(); }
  contains(object) { this.target.getWorldPosition(this.targetPosition).add(this.offset); object.getWorldPosition(this.objectPosition); return this.targetPosition.distanceTo(this.objectPosition) <= this.radius; }
}
