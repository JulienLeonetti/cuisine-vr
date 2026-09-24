import * as THREE from "three";

export function createPlate() {
  const material = new THREE.MeshStandardMaterial({ color: 0xf5ead3, roughness: .7 });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(.15, .17, .018, 24), material);
  plate.castShadow = plate.receiveShadow = true;
  return plate;
}

export function createKnifeBlock() {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x8c5638, roughness: .8 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xb8c0bc, roughness: .3, metalness: .65 });
  const block = new THREE.Mesh(new THREE.BoxGeometry(.13, .2, .12), wood);
  block.rotation.x = -.15; group.add(block);
  for (let index = 0; index < 3; index++) {
    const knife = new THREE.Mesh(new THREE.BoxGeometry(.018, .18, .008), metal);
    knife.position.set((index - 1) * .035, .16, 0); group.add(knife);
  }
  return group;
}
