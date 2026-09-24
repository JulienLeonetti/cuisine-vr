import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { getStyleMaterials, PALETTE, applySoftShadows } from "../../scene/StyleConfig.js";

export function createWickerBasket() {
  const materials = getStyleMaterials();
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.17, .13, .12, 12, 1, true), materials.woodLight);
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .018, 12), materials.woodDark); bottom.position.y = -.06;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.17, .012, 6, 16), materials.woodDark); rim.rotation.x = Math.PI / 2; rim.position.y = .06;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.14, .009, 6, 18, Math.PI), materials.woodDark); handle.position.y = .08;
  group.add(body, bottom, rim, handle);
  return applySoftShadows(group);
}

export function createHerbPot(scale = 1) {
  const materials = getStyleMaterials();
  const group = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.09, .07, .12, 12), materials.terracotta); pot.position.y = .06; group.add(pot);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .01, 12), materials.woodDark); soil.position.y = .125; group.add(soil);
  for (let index = 0; index < 9; index++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.035, 7, 5), index % 3 ? materials.olive : materials.oliveDark);
    const angle = index * 2.4; const radius = .03 + (index % 2) * .025;
    leaf.scale.set(.55, 1.45, .4); leaf.rotation.z = Math.sin(angle) * .45;
    leaf.position.set(Math.cos(angle) * radius, .16 + (index % 3) * .035, Math.sin(angle) * radius); group.add(leaf);
  }
  group.scale.setScalar(scale);
  return applySoftShadows(group);
}

export function createFoldedTowel(color = PALETTE.terracotta) {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 1 });
  const towel = new THREE.Mesh(new RoundedBoxGeometry(.28, .018, .17, 3, .008), material);
  for (let index = 0; index < 6; index++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(.008, .004, .172), getStyleMaterials().ceramic);
    stripe.position.set(-.1 + index * .04, .011, 0); towel.add(stripe);
  }
  return applySoftShadows(towel);
}

export function createCuttingBoard() {
  const materials = getStyleMaterials();
  const board = new THREE.Mesh(new RoundedBoxGeometry(.42, .025, .25, 3, .025), materials.woodLight);
  const hole = new THREE.Mesh(new THREE.TorusGeometry(.018, .006, 6, 12), materials.woodDark);
  hole.rotation.x = Math.PI / 2; hole.position.set(.16, .015, 0); board.add(hole);
  return applySoftShadows(board);
}

export function createIngredientCrate() {
  const materials = getStyleMaterials();
  const group = new THREE.Group();
  const bottom = new THREE.Mesh(new RoundedBoxGeometry(.48, .035, .3, 2, .012), materials.woodDark); bottom.position.y = -.08; group.add(bottom);
  for (const z of [-.14, .14]) {
    for (let row = 0; row < 2; row++) {
      const slat = new THREE.Mesh(new RoundedBoxGeometry(.5, .045, .025, 2, .008), materials.woodLight);
      slat.position.set(0, -.035 + row * .085, z); group.add(slat);
    }
  }
  for (const x of [-.235, .235]) {
    const end = new THREE.Mesh(new RoundedBoxGeometry(.025, .16, .3, 2, .008), materials.woodLight); end.position.set(x, 0, 0); group.add(end);
  }
  return applySoftShadows(group);
}

export function createHangingRail() {
  const materials = getStyleMaterials();
  const group = new THREE.Group();
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1.05, 10), materials.brass); rail.rotation.z = Math.PI / 2; group.add(rail);
  for (let index = 0; index < 4; index++) {
    const hook = new THREE.Mesh(new THREE.TorusGeometry(.025, .006, 6, 10, Math.PI), materials.brass);
    hook.position.set(-.38 + index * .25, -.035, 0); hook.rotation.x = Math.PI / 2; group.add(hook);
    const utensil = new THREE.Mesh(index % 2 ? new THREE.CylinderGeometry(.025, .04, .18, 10) : new THREE.CapsuleGeometry(.018, .16, 4, 8), materials.steel);
    utensil.position.set(-.38 + index * .25, -.16, 0); group.add(utensil);
  }
  return applySoftShadows(group);
}
