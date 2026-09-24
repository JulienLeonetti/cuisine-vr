import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { addLighting } from "./Lighting.js";
import { createEnvironment } from "./Environment.js";
import { createEgg, createLemon, createIngredientPot, createBowl, createPan, createWhisk } from "../objects/Ingredient.js";
import { createPlate, createKnifeBlock } from "../objects/Tool.js";

const mat = (color, roughness = .76, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const box = (size, color, radius = Math.min(.045, Math.min(...size) * .14)) => { const object = new THREE.Mesh(new RoundedBoxGeometry(...size, 2, radius), mat(color)); object.castShadow = object.receiveShadow = true; return object; };

export class KitchenScene {
  constructor(container) {
    this.container = container; this.scene = new THREE.Scene(); this.objects = {}; this.grabbables = [];
    this.createRenderer(); createEnvironment(this.scene); addLighting(this.scene); this.createRestaurant(); this.createRecipeObjects(); this.bindResize();
  }
  createRenderer() {
    this.camera = new THREE.PerspectiveCamera(48, this.container.clientWidth / this.container.clientHeight, .05, 40);
    this.camera.position.set(2.25, 1.72, .18);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.08;
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1.05, -1.35); this.controls.enableDamping = true; this.controls.enablePan = false;
    this.controls.minDistance = 2; this.controls.maxDistance = 5; this.controls.maxPolarAngle = Math.PI * .55;
  }
  createRestaurant() {
    const back = box([5.8, 2.8, .18], 0x9a8067); back.position.set(0, 1.4, .65); this.scene.add(back);
    const stoneMaterial = mat(0xb4a38c);
    for (let x = -2.75; x < 2.8; x += .36) for (let y = .18; y < 2.8; y += .25) {
      if ((Math.floor(y * 10) + Math.floor(x * 10)) % 4 !== 0) continue;
      const stone = new THREE.Mesh(new THREE.BoxGeometry(.34, .2, .04), stoneMaterial);
      stone.position.set(x + ((Math.round(y * 10) % 2) * .16), y, .53); this.scene.add(stone);
    }
    const sideLeft = box([.18, 2.8, 3.7], 0xeee4cd); sideLeft.position.set(-2.9, 1.4, -1.1); this.scene.add(sideLeft);
    const sideRight = sideLeft.clone(); sideRight.position.x = 2.9; this.scene.add(sideRight);
    const ceiling = box([5.8, .16, 3.7], 0xe8d9bc); ceiling.position.set(0, 2.82, -1.1); this.scene.add(ceiling);

    this.counter = box([4.8, .12, .82], 0x9b603d); this.counter.position.set(0, .94, -1.25); this.scene.add(this.counter);
    const counterLip = box([4.92, .055, .9], 0x6d402d, .018); counterLip.position.set(0, .875, -1.25); this.scene.add(counterLip);
    const front = box([4.8, .9, .16], 0x694634); front.position.set(0, .45, -1.62); this.scene.add(front);
    for (let x = -2.1; x <= 2.1; x += .7) { const slat = box([.045, .82, .04], 0xb1774c); slat.position.set(x, .45, -1.72); this.scene.add(slat); }
    const frontBadge = new THREE.Mesh(new THREE.CircleGeometry(.18, 24), mat(0xf0d49c)); frontBadge.position.set(0, .5, -1.715); frontBadge.rotation.y = Math.PI; this.scene.add(frontBadge);
    const badgeMark = new THREE.Mesh(new THREE.CircleGeometry(.12, 20), mat(0xa54f3b)); badgeMark.position.set(0, .5, -1.721); badgeMark.rotation.y = Math.PI; this.scene.add(badgeMark);
    const rearCounter = box([5.2, .12, .7], 0xc4af8f); rearCounter.position.set(0, .9, .25); this.scene.add(rearCounter);

    for (const x of [-1.75, 0, 1.75]) { const cupboard = box([1.55, .78, .62], 0x6d805d); cupboard.position.set(x, .46, .27); this.scene.add(cupboard); }
    const shelf = box([3.4, .08, .3], 0x8d593b); shelf.position.set(-.45, 2.05, .35); this.scene.add(shelf);
    for (let index = 0; index < 5; index++) { const jar = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .2, 12), mat([0xd8bd78,0xb66745,0xf0e1bd,0x72805d,0xd5a654][index])); jar.position.set(-1.7 + index * .55, 2.19, .31); this.scene.add(jar); }

    this.createOven(); this.createSink();
    const plates = new THREE.Group();
    for (let index = 0; index < 4; index++) { const plate = createPlate(); plate.position.y = index * .022; plates.add(plate); }
    plates.position.set(1.8, 1, .22); this.scene.add(plates);
    const knives = createKnifeBlock(); knives.position.set(1.25, 1.02, .23); this.scene.add(knives);
  }
  createOven() {
    const oven = new THREE.Group();
    const body = box([.72, .72, .55], 0x47514d); oven.add(body);
    const cavity = box([.55, .38, .03], 0x111715); cavity.position.set(0, -.06, -.292); oven.add(cavity);
    const handle = box([.45, .035, .035], 0xc8cac4); handle.position.set(0, .19, -.33); oven.add(handle);
    const glow = box([.48, .3, .015], 0x221b16); glow.position.set(0, -.06, -.315); glow.name = "ovenGlow"; oven.add(glow);
    oven.position.set(-2.05, 1.3, .12); this.scene.add(oven); this.objects.oven = oven;
  }
  createSink() {
    const sink = new THREE.Mesh(new THREE.BoxGeometry(.72, .04, .43), mat(0xb7bcb8, .3, .5)); sink.position.set(.3, .98, .23); this.scene.add(sink);
    const basin = box([.55, .035, .3], 0x596762); basin.position.set(.3, .993, .22); this.scene.add(basin);
    const faucet = new THREE.Mesh(new THREE.TorusGeometry(.12, .018, 8, 16, Math.PI), mat(0xc5cbc8, .25, .7)); faucet.rotation.y = Math.PI / 2; faucet.position.set(.3, 1.16, .44); this.scene.add(faucet);
  }
  createRecipeObjects() {
    const positions = {
      egg1: [-1.7, 1.06, -1.18], egg2: [-1.52, 1.06, -1.18], egg3: [-1.34, 1.06, -1.18],
      brocciu: [-.98, 1.07, -1.2], sugar: [-.72, 1.07, -1.2], lemon: [-.42, 1.07, -1.2],
      bowl: [.1, 1.12, -1.2], whisk: [.52, 1.14, -1.18], pan: [1.05, 1.035, -1.2]
    };
    this.objects.egg1 = createEgg("egg1"); this.objects.egg2 = createEgg("egg2"); this.objects.egg3 = createEgg("egg3");
    this.objects.brocciu = createIngredientPot("brocciu", 0xeee4d0, 0xf8f3e8);
    this.objects.sugar = createIngredientPot("sugar", 0x9d6b4b, 0xffffff);
    this.objects.lemon = createLemon(); this.objects.bowl = createBowl(); this.objects.whisk = createWhisk(); this.objects.pan = createPan();
    for (const [id, position] of Object.entries(positions)) {
      const object = this.objects[id]; object.position.set(...position); object.userData.home = object.position.clone();
      this.scene.add(object); this.grabbables.push(object);
    }
    this.serviceZone = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .012, 24), new THREE.MeshStandardMaterial({ color: 0xe0b44e, transparent: true, opacity: .65, emissive: 0x5e3a08, emissiveIntensity: .2 }));
    this.serviceZone.position.set(0, 1.02, -1.48); this.scene.add(this.serviceZone);
  }
  registerPhysics(physics) {
    const fixedBoxes = [
      [[0, -.06, 0], [15, .06, 15]],
      [[0, .94, -1.25], [2.4, .06, .41]],
      [[0, .45, -1.62], [2.4, .45, .08]],
      [[0, .9, .25], [2.6, .06, .35]],
      [[-1.75, .46, .27], [.775, .39, .31]],
      [[0, .46, .27], [.775, .39, .31]],
      [[1.75, .46, .27], [.775, .39, .31]],
      [[-2.9, 1.4, -1.1], [.09, 1.4, 1.85]],
      [[2.9, 1.4, -1.1], [.09, 1.4, 1.85]],
      [[0, 1.4, .65], [2.9, 1.4, .09]],
      [[-2.05, 1.3, .12], [.36, .36, .275]],
      [[0, 2.82, -1.1], [2.9, .08, 1.85]]
    ];
    for (const [position, halfExtents] of fixedBoxes) {
      physics.addFixedBox(
        new THREE.Vector3(...position),
        new THREE.Vector3(...halfExtents)
      );
    }
    const dynamicShapes = {
      egg1: { type: "sphere", radius: .052 }, egg2: { type: "sphere", radius: .052 }, egg3: { type: "sphere", radius: .052 },
      lemon: { type: "sphere", radius: .068 },
      brocciu: { type: "cylinder", halfHeight: .06, radius: .083 },
      sugar: { type: "cylinder", halfHeight: .06, radius: .083 },
      bowl: { type: "cylinder", halfHeight: .07, radius: .175 },
      whisk: { type: "capsule", halfHeight: .105, radius: .025 },
      pan: { type: "cylinder", halfHeight: .026, radius: .158 }
    };
    for (const [id, shape] of Object.entries(dynamicShapes)) {
      const density = id === "bowl" ? 3.5 : id === "pan" ? 2.5 : .8;
      physics.addDynamic(this.objects[id], shape, { density, restitution: id.startsWith("egg") ? .02 : .08 });
    }
  }
  bindResize() {
    window.addEventListener("resize", () => { this.camera.aspect = this.container.clientWidth / this.container.clientHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(this.container.clientWidth, this.container.clientHeight); });
  }
  update(delta, time) { if (!this.renderer.xr.isPresenting) this.controls.update(); this.serviceZone.material.opacity = .5 + Math.sin(time * 2) * .12; }
}
