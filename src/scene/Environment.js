import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const mat = (color, roughness = .8) => new THREE.MeshStandardMaterial({ color, roughness });
const box = (size, color) => {
  const item = new THREE.Mesh(new RoundedBoxGeometry(...size, 2, Math.min(.06, Math.min(...size) * .12)), mat(color));
  item.receiveShadow = true; item.castShadow = true;
  return item;
};

export function createEnvironment(scene) {
  scene.background = new THREE.Color(0x91b4bd);
  scene.fog = new THREE.Fog(0x91b4bd, 9, 22);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), mat(0xc7b58f));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  const street = new THREE.Mesh(new THREE.PlaneGeometry(13, 4), mat(0x9b927f));
  street.rotation.x = -Math.PI / 2; street.position.set(0, .006, -6); scene.add(street);
  const colors = [0xd88666, 0xeee0bd, 0xd2a260, 0xe6e2ca];
  for (let index = 0; index < 4; index++) {
    const facade = box([2.6, 3 + (index % 2) * .5, .7], colors[index]);
    facade.position.set(-4.5 + index * 3, 1.5, -8.2); scene.add(facade);
    for (let floor = 0; floor < 2; floor++) {
      const window = box([.55, .72, .03], 0x47676c);
      window.position.set(facade.position.x, .85 + floor * 1.35, -7.83); scene.add(window);
      for (const direction of [-1, 1]) {
        const shutter = box([.2, .72, .025], index % 2 ? 0x73835e : 0x9c4d3c);
        shutter.position.set(facade.position.x + direction * .4, .85 + floor * 1.35, -7.81); scene.add(shutter);
      }
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.65, .52, 4), mat(0xa8523d));
    roof.rotation.y = Math.PI / 4; roof.scale.z = .38; roof.position.set(facade.position.x, 3.12 + (index % 2) * .5, -8.2); scene.add(roof);
  }

  const awning = new THREE.Group();
  for (let index = 0; index < 7; index++) {
    const strip = box([.46, .06, .75], index % 2 ? 0xf4e7cb : 0xb85740);
    strip.position.x = (index - 3) * .46; awning.add(strip);
  }
  awning.position.set(0, 2.58, -2.1); awning.rotation.x = -.16; scene.add(awning);

  for (const x of [-3.4, 3.6]) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(.18, .24, .28, 10), mat(0xb8583f));
    pot.position.set(x, .14, -3.75); scene.add(pot);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.32, 1), mat(0x55774a));
    crown.scale.set(.75, 1.4, .75); crown.position.set(x, .54, -3.75); crown.castShadow = true; scene.add(crown);
  }

  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .08, 16), mat(0x825638));
  tableTop.position.set(3.2, .75, -5); tableTop.castShadow = true; scene.add(tableTop);
  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(.08, .11, .72, 10), mat(0x5a4232));
  tableLeg.position.set(3.2, .36, -5); scene.add(tableLeg);

  for (const [x, z, scale] of [[-6, -11, 2.5], [0, -12, 3.4], [6, -11, 2.8]]) {
    const hill = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.2, 7), mat(0x71836b));
    hill.position.set(x, 1.5, z); hill.scale.set(scale, 1, .65); scene.add(hill);
  }
}
