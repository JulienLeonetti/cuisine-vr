import * as THREE from "three";
import { createEggPlaceholder } from "../placeholders/createEggPlaceholder.js";
import { createLemonPlaceholder } from "../placeholders/createLemonPlaceholder.js";
import { createBowlPlaceholder } from "../placeholders/createBowlPlaceholder.js";
import { createWhiskPlaceholder } from "../placeholders/createWhiskPlaceholder.js";
import { getStyleMaterials, PALETTE } from "../scene/StyleConfig.js";

const mat = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: .72, ...options });
const mesh = (geometry, material) => {
  const item = new THREE.Mesh(geometry, material);
  item.castShadow = true; item.receiveShadow = true;
  return item;
};

export function makeGrabbable(root, id, type = "ingredient") {
  root.userData.id = id; root.userData.type = type; root.userData.grabbable = true;
  root.traverse((child) => { if (child.isMesh) child.userData.grabRoot = root; });
  return root;
}

export function createEgg(id) {
  const egg = createEggPlaceholder(mat(0xfff1d5, { roughness: .48 }));
  const speckleMaterial = mat(0xc59b6f, { roughness: .9 });
  for (const [x, y, z, scale] of [[.021,.018,.041,.005],[-.018,-.012,.044,.004],[.03,-.025,.025,.0035],[-.028,.028,.025,.004]]) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(scale, 6, 4), speckleMaterial); spot.position.set(x, y, z); egg.add(spot);
  }
  return makeGrabbable(egg, id);
}

export function createLemon() {
  const group = createLemonPlaceholder(mat(0xf2c431, { roughness: .82 }), mat(0x527c42, { roughness: .9 }));
  return makeGrabbable(group, "lemon");
}

export function createIngredientPot(id, bodyColor, contentColor) {
  const group = new THREE.Group();
  const pot = mesh(new THREE.CylinderGeometry(.086, .068, .115, 24), mat(bodyColor, { roughness: .48 }));
  const foot = mesh(new THREE.TorusGeometry(.07, .007, 6, 24), mat(0x7c553c)); foot.rotation.x = Math.PI / 2; foot.position.y = -.055;
  const rim = mesh(new THREE.TorusGeometry(.084, .006, 6, 24), mat(0xf1dfc2)); rim.rotation.x = Math.PI / 2; rim.position.y = .057;
  const content = mesh(new THREE.CylinderGeometry(.077, .077, .008, 24), mat(contentColor)); content.position.y = .061;
  const labelCanvas = document.createElement("canvas"); labelCanvas.width = 256; labelCanvas.height = 96;
  const context = labelCanvas.getContext("2d"); context.fillStyle = "#f8ecd3"; context.fillRect(0, 0, 256, 96); context.strokeStyle = "#b75a42"; context.lineWidth = 7; context.strokeRect(4, 4, 248, 88);
  context.fillStyle = "#344b39"; context.textAlign = "center"; context.font = "700 31px system-ui"; context.fillText(id === "brocciu" ? "BROCCIU" : "SUCRE", 128, 60);
  const labelTexture = new THREE.CanvasTexture(labelCanvas); labelTexture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(.105, .04), new THREE.MeshBasicMaterial({ map: labelTexture })); label.position.set(0, 0, .078);
  group.add(pot, foot, rim, content, label);
  return makeGrabbable(group, id);
}

export function createBowl() {
  const group = createBowlPlaceholder(
    mat(0xf4e9d2, { roughness: .38, metalness: .02 }),
    mat(0xf1d27a, { roughness: .58 })
  );
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(.159, .005, 6, 32), getStyleMaterials().olive);
  stripe.rotation.x = Math.PI / 2; stripe.position.y = .045; group.add(stripe);
  return makeGrabbable(group, "bowl", "container");
}

export function createPan() {
  const group = new THREE.Group();
  const pan = mesh(new THREE.CylinderGeometry(.16, .145, .045, 32), mat(0x38403c, { roughness: .3, metalness: .5 }));
  const rim = mesh(new THREE.TorusGeometry(.157, .009, 7, 32), mat(0x252c29, { roughness: .28, metalness: .55 })); rim.rotation.x = Math.PI / 2; rim.position.y = .024;
  const handle = mesh(new THREE.CapsuleGeometry(.018, .12, 5, 10), mat(PALETTE.woodDark)); handle.rotation.z = Math.PI / 2; handle.position.set(.22, 0, 0);
  const food = mesh(new THREE.CylinderGeometry(.14, .14, .025, 24), mat(0xe5c16b));
  food.position.y = .025; food.visible = false; food.name = "food";
  group.add(pan, rim, handle, food);
  return makeGrabbable(group, "pan", "tool");
}

export function createWhisk() {
  const group = createWhiskPlaceholder(mat(0xa75035, { roughness: .58 }), mat(0xd5d9d5, { roughness: .24, metalness: .75 }));
  return makeGrabbable(group, "whisk", "tool");
}
