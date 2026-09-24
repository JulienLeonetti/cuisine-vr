import * as THREE from "three";

export function addLighting(scene) {
  const ambient = new THREE.HemisphereLight(0xffefd6, 0x53695d, 1.85);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffd29b, 3.45);
  sun.position.set(-3, 6, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
  sun.shadow.camera.top = 5; sun.shadow.camera.bottom = -3;
  sun.shadow.bias = -.0005;
  scene.add(sun);
  const counterFill = new THREE.PointLight(0xffc477, .65, 4.5, 2);
  counterFill.position.set(1.7, 2.25, -.1); counterFill.castShadow = false; scene.add(counterFill);
  return { ambient, sun };
}
