export class ServiceSystem {
  constructor(zone, physics) { this.zone = zone; this.physics = physics; }
  serve(object) {
    if (!this.zone.contains(object)) return false;
    const position = this.zone.target.position.clone(); position.y += .045;
    this.physics.teleport(object, position); this.physics.setEnabled(object, false); object.userData.grabbable = false; return true;
  }
}
