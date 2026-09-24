import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { getStyleMaterials } from "../scene/StyleConfig.js";

export function createPlate() {
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(.15, .17, .018, 32), getStyleMaterials().ceramic);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.125, .005, 6, 32), getStyleMaterials().terracotta); ring.rotation.x = Math.PI / 2; ring.position.y = .011; plate.add(ring);
  plate.castShadow = plate.receiveShadow = true;
  return plate;
}

export function createKnifeBlock() {
  const group = new THREE.Group();
  const { wood, steel: metal } = getStyleMaterials();
  const block = new THREE.Mesh(new RoundedBoxGeometry(.13, .2, .12, 3, .025), wood);
  block.rotation.x = -.15; group.add(block);
  for (let index = 0; index < 3; index++) {
    const knife = new THREE.Mesh(new THREE.BoxGeometry(.018, .18, .008), metal);
    knife.position.set((index - 1) * .035, .16, 0); group.add(knife);
  }
  return group;
}
