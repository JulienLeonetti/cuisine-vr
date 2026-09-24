import * as THREE from "three";

const mat = (color, roughness = .75) => new THREE.MeshStandardMaterial({ color, roughness });
const mesh = (geometry, material) => { const item = new THREE.Mesh(geometry, material); item.castShadow = true; return item; };

export const CustomerState = Object.freeze({ IDLE: "IDLE", ORDERING: "ORDERING", WAITING: "WAITING", HAPPY: "HAPPY", LEAVING: "LEAVING" });

export class Customer {
  constructor(name = "Marcel", order = "Fiadone") {
    this.name = name; this.order = order; this.state = CustomerState.IDLE; this.root = new THREE.Group(); this.baseY = 0;
    this.createModel();
  }
  createModel() {
    const shirt = mat(0xb34f3c, .68); const skin = mat(0xdca276, .62); const dark = mat(0x3d302b, .78); const apron = mat(0xf1dfbd, .75);
    const body = mesh(new THREE.CapsuleGeometry(.25, .52, 8, 16), shirt); body.position.y = .86; body.scale.set(1.06, 1, .82); this.root.add(body);
    const neck = mesh(new THREE.CylinderGeometry(.085, .1, .15, 14), skin); neck.position.y = 1.25; this.root.add(neck);
    const apronShape = new THREE.Shape();
    apronShape.moveTo(-.15, .23); apronShape.quadraticCurveTo(0, .3, .15, .23); apronShape.lineTo(.19, -.24); apronShape.quadraticCurveTo(0, -.3, -.19, -.24); apronShape.closePath();
    const apronBody = mesh(new THREE.ShapeGeometry(apronShape, 6), apron); apronBody.position.set(0, .84, .224); this.root.add(apronBody);
    const pocket = mesh(new THREE.PlaneGeometry(.14, .1), mat(0xd8c39d)); pocket.position.set(0, .76, .228); this.root.add(pocket);
    const head = mesh(new THREE.SphereGeometry(.19, 24, 16), skin); head.position.y = 1.45; head.scale.set(.92, 1.08, .9); this.root.add(head);
    for (const x of [-.19, .19]) { const ear = mesh(new THREE.SphereGeometry(.042, 10, 8), skin); ear.position.set(x, 1.45, 0); ear.scale.x = .55; this.root.add(ear); }
    const nose = mesh(new THREE.ConeGeometry(.027, .07, 10), skin); nose.rotation.x = Math.PI / 2; nose.position.set(0, 1.445, .185); this.root.add(nose);
    const hair = mesh(new THREE.SphereGeometry(.194, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2), dark); hair.position.y = 1.505; hair.scale.set(.92, 1.05, .9); this.root.add(hair);
    const capTop = mesh(new THREE.SphereGeometry(.205, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x52654f)); capTop.position.y = 1.58; capTop.scale.y = .5; this.root.add(capTop);
    const capPeak = mesh(new THREE.SphereGeometry(.1, 12, 6), mat(0x52654f)); capPeak.scale.set(1.15, .16, .7); capPeak.position.set(0, 1.57, .16); this.root.add(capPeak);
    for (const x of [-.066, .066]) {
      const white = mesh(new THREE.SphereGeometry(.022, 10, 8), mat(0xfffbef)); white.position.set(x, 1.475, .17); this.root.add(white);
      const pupil = mesh(new THREE.SphereGeometry(.009, 8, 6), dark); pupil.position.set(x, 1.475, .19); this.root.add(pupil);
      const brow = mesh(new THREE.CapsuleGeometry(.006, .045, 3, 6), dark); brow.rotation.z = Math.PI / 2 + Math.sign(x) * .12; brow.position.set(x, 1.515, .184); this.root.add(brow);
    }
    const moustacheLeft = mesh(new THREE.CapsuleGeometry(.008, .055, 3, 7), dark); moustacheLeft.rotation.z = 1.32; moustacheLeft.position.set(-.025, 1.405, .188);
    const moustacheRight = moustacheLeft.clone(); moustacheRight.rotation.z = -1.32; moustacheRight.position.x = .025; this.root.add(moustacheLeft, moustacheRight);
    this.mouth = mesh(new THREE.TorusGeometry(.032, .006, 6, 14, Math.PI), mat(0x743d37)); this.mouth.rotation.z = Math.PI; this.mouth.position.set(0, 1.375, .186); this.root.add(this.mouth);
    this.arms = [];
    for (const x of [-.32, .32]) { const arm = mesh(new THREE.CapsuleGeometry(.055, .38, 6, 10), shirt); arm.position.set(x, .92, 0); arm.rotation.z = x > 0 ? -.22 : .22; const hand = mesh(new THREE.SphereGeometry(.065, 12, 9), skin); hand.position.y = -.25; arm.add(hand); this.root.add(arm); this.arms.push(arm); }
  }
  setState(state) { this.state = state; }
  update(time) {
    this.root.position.y = this.baseY + Math.sin(time * 1.7) * .012;
    if (this.state === CustomerState.ORDERING) this.mouth.scale.y = .7 + Math.abs(Math.sin(time * 10)) * .8;
    if (this.state === CustomerState.HAPPY) { this.arms[0].rotation.z = .9 + Math.sin(time * 5) * .12; this.arms[1].rotation.z = -.9 - Math.sin(time * 5) * .12; this.root.rotation.y = Math.sin(time * 4) * .06; }
  }
}
