import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { addLighting } from "./Lighting.js";
import { createEnvironment } from "./Environment.js";
import { createEgg, createLemon, createIngredientPot, createBowl, createPan, createWhisk } from "../objects/Ingredient.js";
import { createPlate, createKnifeBlock } from "../objects/Tool.js";
import { getStyleMaterials, PALETTE, applySoftShadows } from "./StyleConfig.js";
import { createWickerBasket, createHerbPot, createFoldedTowel, createCuttingBoard, createIngredientCrate, createHangingRail } from "../objects/environment/Decor.js";

const mat = (color, roughness = .76, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const box = (size, materialOrColor, radius = Math.min(.045, Math.min(...size) * .14)) => {
  const material = materialOrColor?.isMaterial ? materialOrColor : mat(materialOrColor);
  const object = new THREE.Mesh(new RoundedBoxGeometry(...size, 2, radius), material); object.castShadow = object.receiveShadow = true; return object;
};

export class KitchenScene {
  constructor(container) {
    this.container = container; this.scene = new THREE.Scene(); this.objects = {}; this.grabbables = [];
    this.materials = getStyleMaterials();
    this.createRenderer(); createEnvironment(this.scene); addLighting(this.scene); this.createRestaurant(); this.createRecipeObjects(); this.bindResize();
  }
  createRenderer() {
    this.camera = new THREE.PerspectiveCamera(48, this.container.clientWidth / this.container.clientHeight, .05, 40);
    this.camera.position.set(0, 1.68, .12);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.14;
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1.05, -1.35); this.controls.enableDamping = true; this.controls.enablePan = false;
    this.controls.minDistance = 2; this.controls.maxDistance = 5; this.controls.maxPolarAngle = Math.PI * .55;
  }
  createRestaurant() {
    const back = box([5.8, 2.8, .18], this.materials.plaster); back.position.set(0, 1.4, .65); this.scene.add(back);
    this.createStoneWallDetails();
    const sideLeft = box([.18, 2.8, 3.7], this.materials.plaster); sideLeft.position.set(-2.9, 1.4, -1.1); this.scene.add(sideLeft);
    const sideRight = sideLeft.clone(); sideRight.position.x = 2.9; this.scene.add(sideRight);
    const ceiling = box([5.8, .16, 3.7], this.materials.plaster); ceiling.position.set(0, 2.82, -1.1); this.scene.add(ceiling);

    this.counter = box([4.8, .12, .82], this.materials.wood); this.counter.position.set(0, .94, -1.25); this.scene.add(this.counter);
    const counterLip = box([4.92, .055, .9], this.materials.woodDark, .018); counterLip.position.set(0, .875, -1.25); this.scene.add(counterLip);
    const front = box([4.8, .9, .16], this.materials.woodDark); front.position.set(0, .45, -1.62); this.scene.add(front);
    for (let x = -2.1; x <= 2.1; x += .7) { const slat = box([.045, .82, .04], this.materials.woodLight); slat.position.set(x, .45, -1.72); this.scene.add(slat); }
    const frontBadge = new THREE.Mesh(new THREE.CircleGeometry(.18, 24), this.materials.ceramic); frontBadge.position.set(0, .5, -1.715); frontBadge.rotation.y = Math.PI; this.scene.add(frontBadge);
    const badgeMark = new THREE.Mesh(new THREE.RingGeometry(.075, .12, 20), this.materials.terracotta); badgeMark.position.set(0, .5, -1.721); badgeMark.rotation.y = Math.PI; this.scene.add(badgeMark);
    const rearCounter = box([5.2, .12, .7], this.materials.stone); rearCounter.position.set(0, .9, .25); this.scene.add(rearCounter);

    for (const x of [-1.75, 0, 1.75]) {
      const cupboard = box([1.55, .78, .62], this.materials.olive); cupboard.position.set(x, .46, .27); this.scene.add(cupboard);
      for (const direction of [-1, 1]) {
        const door = box([.68, .64, .025], this.materials.oliveDark, .025); door.position.set(x + direction * .36, .47, -.055); this.scene.add(door);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(.025, 10, 8), this.materials.brass); knob.position.set(x + direction * .08, .47, -.075); this.scene.add(knob);
      }
    }
    const shelf = box([3.4, .08, .3], this.materials.wood); shelf.position.set(-.45, 2.05, .35); this.scene.add(shelf);
    for (let index = 0; index < 5; index++) {
      const jarMaterial = [this.materials.ceramic, this.materials.terracotta, this.materials.ceramic, this.materials.olive, this.materials.brass][index];
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(.075, .068, .2, 16), jarMaterial); jar.position.set(-1.7 + index * .55, 2.19, .31);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.073, .007, 6, 16), this.materials.woodDark); rim.rotation.x = Math.PI / 2; rim.position.y = .1; jar.add(rim); applySoftShadows(jar); this.scene.add(jar);
    }

    this.createOven(); this.createSink();
    const plates = new THREE.Group();
    for (let index = 0; index < 4; index++) { const plate = createPlate(); plate.position.y = index * .022; plates.add(plate); }
    plates.position.set(1.8, 1, .22); this.scene.add(plates);
    const knives = createKnifeBlock(); knives.position.set(1.25, 1.02, .23); this.scene.add(knives);
    this.createKitchenDecor();
  }
  createStoneWallDetails() {
    const geometry = new RoundedBoxGeometry(.34, .19, .035, 2, .025);
    const positions = [];
    for (let x = -2.7; x < 2.75; x += .38) for (let y = .15; y < 2.72; y += .25) {
      if ((Math.round(x * 10) + Math.round(y * 10)) % 3 === 0) positions.push([x + ((Math.round(y * 10) % 2) * .15), y]);
    }
    const stones = new THREE.InstancedMesh(geometry, this.materials.stone, positions.length);
    const matrix = new THREE.Matrix4();
    positions.forEach(([x, y], index) => {
      const scale = .88 + (index % 4) * .035;
      matrix.compose(new THREE.Vector3(x, y, .535), new THREE.Quaternion(), new THREE.Vector3(scale, .9 + (index % 3) * .05, 1));
      stones.setMatrixAt(index, matrix);
    });
    stones.receiveShadow = true; this.scene.add(stones);
  }
  createKitchenDecor() {
    const basket = createWickerBasket(); basket.position.set(.9, 2.19, .3); basket.scale.setScalar(.8); this.scene.add(basket);
    const herb = createHerbPot(.9); herb.position.set(2.22, .97, .24); this.scene.add(herb);
    const towel = createFoldedTowel(PALETTE.terracotta); towel.position.set(1.72, .98, .22); towel.rotation.y = -.15; this.scene.add(towel);
    const board = createCuttingBoard(); board.position.set(.85, .99, .22); board.rotation.y = .12; this.scene.add(board);
    const crate = createIngredientCrate(); crate.position.set(-2.3, 1.03, .2); crate.scale.setScalar(.72); this.scene.add(crate);
    const rail = createHangingRail(); rail.position.set(.55, 1.65, .52); this.scene.add(rail);
  }
  createOven() {
    const oven = new THREE.Group();
    const body = box([.72, .72, .55], this.materials.oliveDark); oven.add(body);
    const cavity = box([.55, .38, .03], this.materials.ink); cavity.position.set(0, -.06, -.292); oven.add(cavity);
    const glow = box([.48, .3, .015], 0x221b16); glow.position.set(0, -.06, -.315); glow.name = "ovenGlow"; oven.add(glow);
    const rack = new THREE.Group(); rack.position.set(0, -.19, -.34); rack.name = "ovenRack";
    for (let x = -.22; x <= .22; x += .055) { const bar = box([.012, .012, .4], this.materials.steel, .004); bar.position.x = x; rack.add(bar); } oven.add(rack);
    const doorPivot = new THREE.Group(); doorPivot.name = "ovenDoor"; doorPivot.position.set(0, -.27, -.34);
    const door = box([.62, .42, .045], this.materials.oliveDark); door.position.y = .21; doorPivot.add(door);
    const glass = box([.47, .27, .012], new THREE.MeshStandardMaterial({ color: 0x27312d, roughness: .3, metalness: .08, transparent: true, opacity: .72 })); glass.position.set(0, .2, -.03); doorPivot.add(glass);
    const handle = box([.45, .035, .035], this.materials.steel); handle.position.set(0, .38, -.055); doorPivot.add(handle); oven.add(doorPivot);
    for (let index = 0; index < 3; index++) { const knob = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .025, 12), this.materials.brass); knob.rotation.x = Math.PI / 2; knob.position.set(-.16 + index * .16, .25, -.305); oven.add(knob); }
    const steam = new THREE.Group(); steam.name = "ovenSteam"; steam.visible = false;
    const steamMaterial = new THREE.MeshBasicMaterial({ color: 0xfff1d3, transparent: true, opacity: .18, depthWrite: false });
    for (let index = 0; index < 4; index++) { const puff = new THREE.Mesh(new THREE.SphereGeometry(.035 + index * .008, 7, 5), steamMaterial.clone()); puff.userData.offset = index / 4; steam.add(puff); }
    steam.position.set(.2, .38, -.25); oven.add(steam);
    oven.position.set(2.05, 1.3, .12); oven.userData.doorTarget = -1.08; oven.userData.cooking = false; this.scene.add(oven); this.objects.oven = oven;
  }
  createSink() {
    const sink = new THREE.Mesh(new RoundedBoxGeometry(.72, .04, .43, 3, .035), this.materials.steel); sink.position.set(.3, .98, .23); this.scene.add(sink);
    const basin = box([.55, .035, .3], this.materials.ink); basin.position.set(.3, .993, .22); this.scene.add(basin);
    const faucet = new THREE.Mesh(new THREE.TorusGeometry(.12, .018, 8, 20, Math.PI), this.materials.steel); faucet.rotation.y = Math.PI / 2; faucet.position.set(.3, 1.16, .44); this.scene.add(faucet);
  }
  createRecipeObjects() {
    const positions = {
      egg1: [-1.7, 1.06, -1.18], egg2: [-1.52, 1.06, -1.18], egg3: [-1.34, 1.06, -1.18],
      brocciu: [-.98, 1.07, -1.2], sugar: [-.72, 1.07, -1.2], lemon: [-.42, 1.07, -1.2],
      bowl: [.1, 1.12, -1.2], whisk: [.52, 1.14, -1.18], pan: [1.05, 1.035, -1.2]
    };
    this.objects.egg1 = this.createAssetSlot("egg1", "egg", createEgg("egg1"));
    this.objects.egg2 = this.createAssetSlot("egg2", "egg", createEgg("egg2"));
    this.objects.egg3 = this.createAssetSlot("egg3", "egg", createEgg("egg3"));
    this.objects.brocciu = this.createAssetSlot("brocciu", "brocciu", createIngredientPot("brocciu", 0xeee4d0, 0xf8f3e8));
    this.objects.sugar = this.createAssetSlot("sugar", "sugar", createIngredientPot("sugar", 0x9d6b4b, 0xffffff));
    this.objects.lemon = this.createAssetSlot("lemon", "lemon", createLemon());
    this.objects.bowl = this.createAssetSlot("bowl", "bowl", createBowl(), "mixture");
    this.objects.whisk = this.createAssetSlot("whisk", "whisk", createWhisk());
    this.objects.pan = this.createAssetSlot("pan", "pan", createPan(), "food");
    for (const [id, position] of Object.entries(positions)) {
      const object = this.objects[id]; object.position.set(...position); object.userData.home = object.position.clone();
      this.scene.add(object); this.grabbables.push(object);
    }
    this.serviceZone = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .012, 24), new THREE.MeshStandardMaterial({ color: 0xe0b44e, transparent: true, opacity: .65, emissive: 0x5e3a08, emissiveIntensity: .2 }));
    this.serviceZone.position.set(0, 1.02, -1.48); this.scene.add(this.serviceZone);
    const servicePlate = createPlate(); servicePlate.scale.setScalar(1.35); servicePlate.position.set(0, 1.025, -1.48); servicePlate.userData.decorative = true; this.scene.add(servicePlate);
  }
  createAssetSlot(id, assetId, placeholder, persistentNodeName = null) {
    const slot = new THREE.Group();
    slot.userData.id = id; slot.userData.assetId = assetId; slot.userData.type = placeholder.userData.type; slot.userData.grabbable = true;
    placeholder.name = "fallback-visual"; slot.add(placeholder);
    if (persistentNodeName) {
      const persistentNode = placeholder.getObjectByName(persistentNodeName);
      if (persistentNode) { persistentNode.parent.remove(persistentNode); slot.add(persistentNode); }
    }
    slot.traverse((child) => { if (child.isMesh) child.userData.grabRoot = slot; });
    return slot;
  }
  async loadVisualAssets(assetManager) {
    for (const slot of Object.values(this.objects)) {
      const assetId = slot.userData.assetId;
      if (!assetId || !assetManager.hasEnabledAsset(assetId)) continue;
      const asset = await assetManager.instantiate(assetId, { silent: false });
      if (!asset) continue;
      const fallback = slot.getObjectByName("fallback-visual");
      if (fallback) slot.remove(fallback);
      asset.model.name = "gltf-visual"; slot.add(asset.model);
      asset.model.traverse((child) => { if (child.isMesh) child.userData.grabRoot = slot; });
    }
  }
  registerPhysics(physics) {
    const fixedBoxes = [
      ["floor", [0, -.09, 0], [15, .09, 15]],
      ["service-counter", [0, .92, -1.25], [2.4, .08, .41]],
      ["counter-front", [0, .45, -1.62], [2.4, .45, .09]],
      ["rear-worktop", [0, .88, .25], [2.6, .08, .35]],
      ["left-cupboard", [-1.75, .46, .27], [.775, .39, .31]],
      ["center-cupboard", [0, .46, .27], [.775, .39, .31]],
      ["right-cupboard", [1.75, .46, .27], [.775, .39, .31]],
      ["left-wall", [-2.9, 1.4, -1.1], [.09, 1.4, 1.85]],
      ["right-wall", [2.9, 1.4, -1.1], [.09, 1.4, 1.85]],
      ["back-wall", [0, 1.4, .65], [2.9, 1.4, .09]],
      ["oven", [2.05, 1.3, .12], [.36, .36, .275]],
      ["shelf", [-.45, 2.05, .35], [1.7, .055, .15]],
      ["ceiling", [0, 2.82, -1.1], [2.9, .08, 1.85]]
    ];
    for (const [name, position, halfExtents] of fixedBoxes) {
      physics.addFixedBox(
        new THREE.Vector3(...position),
        new THREE.Vector3(...halfExtents),
        null,
        name
      );
    }
    const dynamicShapes = {
      egg1: { type: "sphere", radius: .052 }, egg2: { type: "sphere", radius: .052 }, egg3: { type: "sphere", radius: .052 },
      lemon: { type: "sphere", radius: .056 },
      brocciu: { type: "cylinder", halfHeight: .06, radius: .083 },
      sugar: { type: "cylinder", halfHeight: .06, radius: .083 },
      bowl: { type: "cylinder", halfHeight: .07, radius: .175 },
      whisk: { type: "capsule", halfHeight: .105, radius: .025 },
      pan: { type: "cylinder", halfHeight: .026, radius: .158 }
    };
    for (const [id, shape] of Object.entries(dynamicShapes)) {
      const isEgg = id.startsWith("egg");
      const density = id === "bowl" ? 3.5 : id === "pan" ? 2.5 : isEgg ? .45 : .8;
      physics.addDynamic(this.objects[id], shape, {
        density,
        friction: isEgg ? .54 : .66,
        restitution: isEgg ? .025 : .045,
        linearDamping: isEgg ? .35 : .7,
        angularDamping: isEgg ? .9 : 1.8,
        ccd: true
      });
    }
  }
  bindResize() {
    window.addEventListener("resize", () => { this.camera.aspect = this.container.clientWidth / this.container.clientHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(this.container.clientWidth, this.container.clientHeight); });
  }
  setOvenOpen(open) { this.objects.oven.userData.doorTarget = open ? -1.08 : 0; }
  setOvenCooking(active) { this.objects.oven.userData.cooking = active; }
  update(delta, time) {
    if (!this.renderer.xr.isPresenting) this.controls.update();
    this.serviceZone.material.opacity = .5 + Math.sin(time * 2) * .12;
    const oven = this.objects.oven; const door = oven.getObjectByName("ovenDoor");
    door.rotation.x = THREE.MathUtils.damp(door.rotation.x, oven.userData.doorTarget, 7, delta);
    const glow = oven.getObjectByName("ovenGlow"); const cooking = oven.userData.cooking;
    glow.material.emissive.setHex(cooking ? 0xff631f : 0x000000); glow.material.emissiveIntensity = cooking ? 1.15 + Math.sin(time * 5) * .12 : 0;
    const steam = oven.getObjectByName("ovenSteam"); steam.visible = cooking;
    if (cooking) for (const puff of steam.children) { const phase = (time * .28 + puff.userData.offset) % 1; puff.position.set(Math.sin(phase * 9) * .035, phase * .42, 0); puff.scale.setScalar(.7 + phase); puff.material.opacity = .18 * (1 - phase); }
  }
}
