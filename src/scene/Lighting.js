import * as THREE from "three";

export function addLighting(scene) {
  const ambient = new THREE.HemisphereLight(0xfff1d6, 0x607368, 1.65);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffd19a, 3.7);
  sun.position.set(-3.5, 6.5, 3.8);
  sun.target.position.set(0, .8, -1.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
  sun.shadow.camera.top = 5; sun.shadow.camera.bottom = -3;
  sun.shadow.camera.near = .5; sun.shadow.camera.far = 14;
  sun.shadow.bias = -.00035; sun.shadow.normalBias = .018;
  scene.add(sun, sun.target);
  const counterFill = new THREE.PointLight(0xffbd72, .82, 4.2, 2);
  counterFill.position.set(1.65, 2.15, -.05); counterFill.castShadow = false; scene.add(counterFill);
  return { ambient, sun };
}
