import * as THREE from "three";

export function createLemonPlaceholder(lemonMaterial, leafMaterial) {
  const group = new THREE.Group();
  const profile = [];
  for (let index = 0; index <= 20; index++) {
    const t = index / 20;
    const x = -.08 + t * .16;
    const radius = Math.pow(Math.sin(Math.PI * t), .72) * .052;
    profile.push(new THREE.Vector2(Math.max(radius, .002), x));
  }
  const fruit = new THREE.Mesh(new THREE.LatheGeometry(profile, 20), lemonMaterial);
  fruit.rotation.z = Math.PI / 2; fruit.castShadow = fruit.receiveShadow = true;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.006, .008, .025, 8), leafMaterial);
  stem.rotation.z = Math.PI / 2; stem.position.x = .086;
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 5), leafMaterial);
  leaf.scale.set(1.7, .25, .7); leaf.position.set(.085, .018, 0); leaf.rotation.z = .4;
  group.add(fruit, stem, leaf);
  return group;
}
