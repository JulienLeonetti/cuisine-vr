import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { getStyleMaterials, PALETTE, applySoftShadows } from "./StyleConfig.js";
import { createHerbPot } from "../objects/environment/Decor.js";

const materials = getStyleMaterials();
const coloredMaterial = (color, roughness = .82) => new THREE.MeshStandardMaterial({ color, roughness });
const box = (size, material, radius = Math.min(.06, Math.min(...size) * .12)) => applySoftShadows(new THREE.Mesh(new RoundedBoxGeometry(...size, 2, radius), material));

function createSky(scene) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(22, 20, 12),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { topColor: { value: new THREE.Color(0x70b6cc) }, bottomColor: { value: new THREE.Color(0xffdfaa) } },
      vertexShader: "varying float vHeight; void main(){ vHeight=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "uniform vec3 topColor; uniform vec3 bottomColor; varying float vHeight; void main(){ float h=smoothstep(-.15,.7,vHeight); gl_FragColor=vec4(mix(bottomColor,topColor,h),1.0); }"
    })
  );
  scene.add(sky);
}

function createFacade(scene, index, x) {
  const colors = [0xd98567, 0xf0dfba, 0xd6a15e, 0xe9e1c9];
  const facadeMaterial = coloredMaterial(colors[index]);
  const height = 3 + (index % 2) * .45;
  const facade = box([2.55, height, .72], facadeMaterial, .08);
  facade.position.set(x, height / 2, -8.2); scene.add(facade);

  const door = box([.62, 1.05, .045], index % 2 ? materials.oliveDark : materials.woodDark, .06);
  door.position.set(x + (index % 2 ? -.52 : .52), .53, -7.81); scene.add(door);
  const doorArch = new THREE.Mesh(new THREE.TorusGeometry(.31, .055, 7, 18, Math.PI), materials.stone);
  doorArch.position.set(door.position.x, 1.04, -7.805); scene.add(doorArch);

  for (let floor = 0; floor < 2; floor++) {
    const windowY = .92 + floor * 1.27;
    const frame = box([.68, .82, .04], materials.stone, .04); frame.position.set(x, windowY, -7.81); scene.add(frame);
    const glass = box([.52, .65, .025], coloredMaterial(0x456b73, .28), .025); glass.position.set(x, windowY, -7.785); scene.add(glass);
    for (const direction of [-1, 1]) {
      const shutter = box([.19, .72, .03], index % 2 ? materials.olive : materials.terracotta, .025);
      shutter.position.set(x + direction * .44, windowY, -7.78); scene.add(shutter);
    }
    if (floor === 1) {
      const balcony = box([1.1, .06, .34], materials.stone, .025); balcony.position.set(x, windowY - .5, -7.62); scene.add(balcony);
      const rail = new THREE.Group();
      for (let railIndex = 0; railIndex < 6; railIndex++) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .34, 6), materials.brass); bar.position.set(-.45 + railIndex * .18, 0, 0); rail.add(bar);
      }
      rail.position.set(x, windowY - .29, -7.48); scene.add(rail);
    }
  }

  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.62, .5, 4), materials.terracotta);
  roof.rotation.y = Math.PI / 4; roof.scale.z = .38; roof.position.set(x, height + .2, -8.2); roof.castShadow = true; scene.add(roof);
}

function createCafeSet(scene, x, z) {
  const group = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(.43, .43, .055, 18), materials.wood); top.position.y = .72; group.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(.055, .085, .69, 10), materials.woodDark); leg.position.y = .35; group.add(leg);
  for (const direction of [-1, 1]) {
    const chair = new THREE.Group();
    const seat = box([.34, .045, .32], materials.woodLight, .025); seat.position.y = .43; chair.add(seat);
    const back = box([.34, .42, .04], materials.olive, .03); back.position.set(0, .66, -.14); chair.add(back);
    for (const sx of [-.13, .13]) { const chairLeg = new THREE.Mesh(new THREE.CylinderGeometry(.018, .022, .42, 7), materials.woodDark); chairLeg.position.set(sx, .21, 0); chair.add(chairLeg); }
    chair.position.x = direction * .68; chair.rotation.y = direction > 0 ? Math.PI / 2 : -Math.PI / 2; group.add(chair);
  }
  group.position.set(x, 0, z); applySoftShadows(group); scene.add(group);
}

export function createEnvironment(scene) {
  scene.background = new THREE.Color(PALETTE.sky);
  scene.fog = new THREE.Fog(0x9fc1b8, 10, 24);
  createSky(scene);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), coloredMaterial(0xc8b48c, .98));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.5), coloredMaterial(0xa79b82, .96));
  street.rotation.x = -Math.PI / 2; street.position.set(0, .006, -5.8); street.receiveShadow = true; scene.add(street);

  const cobbleGeometry = new RoundedBoxGeometry(.42, .015, .24, 1, .04);
  const cobbles = new THREE.InstancedMesh(cobbleGeometry, coloredMaterial(0xb8aa8e, .95), 72);
  const matrix = new THREE.Matrix4(); let cobbleIndex = 0;
  for (let row = 0; row < 6; row++) for (let column = 0; column < 12; column++) {
    matrix.compose(new THREE.Vector3(-4.7 + column * .85 + (row % 2) * .18, .017, -4.1 - row * .62), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (column % 3 - 1) * .04), new THREE.Vector3(1, 1, 1));
    cobbles.setMatrixAt(cobbleIndex++, matrix);
  }
  cobbles.receiveShadow = true; scene.add(cobbles);

  for (let index = 0; index < 4; index++) createFacade(scene, index, -4.5 + index * 3);

  const awning = new THREE.Group();
  for (let index = 0; index < 8; index++) {
    const strip = box([.4, .055, .82], index % 2 ? materials.ceramic : materials.terracotta, .018);
    strip.position.x = (index - 3.5) * .4; awning.add(strip);
  }
  awning.position.set(0, 2.58, -2.05); awning.rotation.x = -.16; scene.add(awning);

  for (const x of [-3.45, 3.55]) {
    const planter = createHerbPot(2); planter.position.set(x, 0, -3.65); scene.add(planter);
  }
  createCafeSet(scene, 3.25, -4.9);
  createCafeSet(scene, -3.45, -5.25);

  const sea = new THREE.Mesh(new THREE.PlaneGeometry(18, 7), new THREE.MeshStandardMaterial({ color: PALETTE.sea, roughness: .34, metalness: .04 }));
  sea.rotation.x = -Math.PI / 2; sea.position.set(0, -.02, -13); scene.add(sea);

  for (const [x, z, scale] of [[-6, -12, 2.5], [0, -13, 3.4], [6, -12, 2.8]]) {
    const hill = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.2, 7), materials.olive);
    hill.position.set(x, 1.5, z); hill.scale.set(scale, 1, .65); scene.add(hill);
  }
}
