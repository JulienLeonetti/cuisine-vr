import * as THREE from "three";
import { AssetManager } from "./AssetManager.js";
import { AudioManager } from "./AudioManager.js";
import { PhysicsManager } from "./PhysicsManager.js";
import { KitchenScene } from "../scene/KitchenScene.js";
import { XRManager } from "../vr/XRManager.js";
import { GrabManager } from "../vr/GrabManager.js";
import { CustomerManager } from "../characters/CustomerManager.js";
import { RecipeManager } from "../recipes/RecipeManager.js";
import { FiadoneRecipe } from "../recipes/FiadoneRecipe.js";
import { VRUIManager } from "../ui/VRUIManager.js";

export class Game {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.assets = new AssetManager();
    this.audio = new AudioManager();
  }
  async init() {
    this.kitchen = new KitchenScene(this.container);
    this.kitchen.renderer.setAnimationLoop(() => this.update());
    this.audio.configureCamera(this.kitchen.camera);
    this.assets.configureRenderer(this.kitchen.renderer);
    await this.kitchen.loadVisualAssets(this.assets);
    this.physics = new PhysicsManager();
    await this.physics.init(this.kitchen.scene);
    this.kitchen.registerPhysics(this.physics);
    this.ui = new VRUIManager(this.kitchen.scene);
    this.customer = new CustomerManager(this.kitchen.scene, this.ui, this.audio);
    await this.customer.loadAssets(this.assets);
    this.recipe = new RecipeManager(new FiadoneRecipe(), this.ui, this.audio);
    this.grab = new GrabManager(this.kitchen.scene, this.kitchen.camera, this.kitchen.renderer, this.kitchen.grabbables, this.kitchen.controls, this.physics);
    this.xr = new XRManager(this.kitchen.renderer, this.kitchen.scene, this.kitchen.camera, this.grab);
    this.recipe.connect({ kitchen: this.kitchen, grabManager: this.grab, customerManager: this.customer, physicsManager: this.physics });
    this.bindUI();
    try {
      await this.xr.init();
    } catch (error) {
      console.warn("WebXR indisponible, poursuite en mode écran :", error);
      document.querySelector("#unsupported").hidden = false;
    }
    this.customer.startOrder();
    this.recipe.start();
    document.querySelector("#status").textContent = "Cuisine prête — entrez en VR ou testez à la souris.";
  }
  bindUI() {
    const sound = document.querySelector("#sound-toggle");
    sound.addEventListener("click", () => { this.audio.enabled = !this.audio.enabled; sound.classList.toggle("muted", !this.audio.enabled); });
    this.recipe.addEventListener("stepchange", (event) => {
      const { step, index, total } = event.detail;
      document.querySelector("#desktop-step").textContent = `${index + 1}. ${step.instruction}`;
      document.querySelector("#desktop-progress").style.width = `${((index + 1) / total) * 100}%`;
    });
    this.recipe.addEventListener("score", (event) => { document.querySelector("#desktop-score").textContent = String(event.detail).padStart(3, "0"); });
  }
  update() {
    const delta = Math.min(this.clock.getDelta(), .05);
    const time = this.clock.elapsedTime;
    this.grab?.update(); this.recipe?.update(delta); this.physics?.update(delta); this.customer?.update(delta, time); this.ui?.update(time); this.kitchen.update(delta, time);
    this.kitchen.renderer.render(this.kitchen.scene, this.kitchen.camera);
  }
}
