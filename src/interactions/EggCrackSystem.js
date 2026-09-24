import * as THREE from "three";

export class EggCrackSystem {
  constructor(scene, bowl, physics, audio) {
    this.scene = scene; this.bowl = bowl; this.physics = physics; this.audio = audio; this.effects = [];
  }

  canCrack(egg, bowlZone) { return egg.userData.id?.startsWith("egg") && bowlZone.contains(egg); }

  crack(egg) {
    const position = egg.getWorldPosition(new THREE.Vector3());
    egg.visible = false; this.physics.setEnabled(egg, false); this.audio.crack();
    const effect = new THREE.Group(); effect.position.copy(position);
    const shellMaterial = new THREE.MeshStandardMaterial({ color: 0xf2e5c8, roughness: .86, side: THREE.DoubleSide });
    for (const side of [-1, 1]) {
      const shell = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8, 0, Math.PI, 0, Math.PI), shellMaterial);
      shell.scale.set(.8, 1.15, .8); shell.position.x = side * .032; shell.rotation.z = side * .65; shell.userData.side = side; effect.add(shell);
    }
    const yolk = new THREE.Mesh(new THREE.SphereGeometry(.026, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffb51f, roughness: .5 }));
    yolk.name = "falling-yolk"; effect.add(yolk); this.scene.add(effect);
    this.effects.push({ group: effect, age: 0, bowlY: this.bowl.getWorldPosition(new THREE.Vector3()).y + .08 });
  }

  update(delta) {
    for (let index = this.effects.length - 1; index >= 0; index--) {
      const effect = this.effects[index]; effect.age += delta;
      const yolk = effect.group.getObjectByName("falling-yolk");
      if (yolk) yolk.position.y = -Math.min(.18, effect.age * .55);
      for (const shell of effect.group.children.filter((child) => child !== yolk)) {
        shell.position.x += shell.userData.side * delta * .07; shell.rotation.z += shell.userData.side * delta * 1.4; shell.position.y -= delta * .08;
      }
      effect.group.traverse((child) => { if (child.material) child.material.opacity = THREE.MathUtils.clamp((1.65 - effect.age) * 2, 0, 1); child.material && (child.material.transparent = true); });
      if (effect.age > 1.65) { this.scene.remove(effect.group); this.effects.splice(index, 1); }
    }
  }
}
