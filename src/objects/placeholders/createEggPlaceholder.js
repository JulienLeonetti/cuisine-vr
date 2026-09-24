import * as THREE from "three";

export function createEggPlaceholder(material) {
  const profile = [];
  for (let index = 0; index <= 18; index++) {
    const t = index / 18;
    const y = -.052 + t * .118;
    const radius = Math.sin(Math.PI * t) * (.043 + (1 - t) * .011);
    profile.push(new THREE.Vector2(Math.max(radius, .001), y));
  }
  const egg = new THREE.Mesh(new THREE.LatheGeometry(profile, 24), material);
  egg.castShadow = egg.receiveShadow = true;
  return egg;
}
