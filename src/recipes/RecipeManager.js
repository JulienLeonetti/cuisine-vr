import * as THREE from "three";
import { InteractionManager } from "../interactions/InteractionManager.js";
import { DropZone } from "../interactions/DropZone.js";
import { MixZone } from "../interactions/MixZone.js";
import { CookingZone } from "../interactions/CookingZone.js";
import { ServiceZone } from "../interactions/ServiceZone.js";

export class RecipeManager extends EventTarget {
  constructor(recipe, ui, audio) {
    super(); this.recipe = recipe; this.ui = ui; this.audio = audio;
    this.index = 0; this.eggsTaken = new Set(); this.eggsInBowl = 0; this.score = 0; this.finished = false;
  }
  get step() { return this.recipe.steps[this.index]; }
  connect({ kitchen, grabManager, customerManager, physicsManager }) {
    this.kitchen = kitchen; this.grab = grabManager; this.customer = customerManager; this.physics = physicsManager;
    this.interactions = new InteractionManager(grabManager);
    this.bowlZone = new DropZone(kitchen.objects.bowl, .25, new THREE.Vector3(0, .06, 0));
    this.panZone = new DropZone(kitchen.objects.pan, .28);
    this.ovenZone = new DropZone(kitchen.objects.oven, .58, new THREE.Vector3(0, -.1, -.38));
    this.serviceZone = new ServiceZone(kitchen.serviceZone, .34);
    this.mixZone = new MixZone(kitchen.objects.bowl, .27);
    this.cooking = new CookingZone(5);
    this.interactions.addEventListener("grabstart", (event) => this.onGrab(event.detail.object));
    this.interactions.addEventListener("grabend", (event) => this.onRelease(event.detail.object));
  }
  start() { this.showStep(); }
  showStep() {
    this.ui.showRecipe(this.recipe.name, this.step, this.index, this.recipe.steps.length);
    this.dispatchEvent(new CustomEvent("stepchange", { detail: { step: this.step, index: this.index, total: this.recipe.steps.length } }));
  }
  next() { this.audio.success(); this.ui.flashComplete(); this.index += 1; if (this.index < this.recipe.steps.length) this.showStep(); }
  onGrab(object) {
    const id = object.userData.id;
    if (this.step.id === "take-eggs" && id.startsWith("egg")) {
      this.eggsTaken.add(id); this.ui.setDetail(`${this.eggsTaken.size} / 3 œufs saisis`);
      if (this.eggsTaken.size === 3) this.next();
    } else if (this.step.id === "take-whisk" && id === "whisk") this.next();
    else if (this.step.id === "remove" && id === "pan") this.next();
  }
  onRelease(object) {
    const id = object.userData.id;
    if (this.step.id === "take-eggs" && id.startsWith("egg")) return this.returnHome(object);
    if (this.step.id === "crack-eggs" && id.startsWith("egg") && this.bowlZone.contains(object)) {
      object.visible = false; this.physics.setEnabled(object, false); this.eggsInBowl += 1; this.audio.crack(); this.showMixture(); this.ui.setDetail(`${this.eggsInBowl} / 3 œufs`);
      if (this.eggsInBowl === 3) this.next(); return;
    }
    const ingredientForStep = { brocciu: "brocciu", sugar: "sugar", lemon: "lemon" }[this.step.id];
    if (ingredientForStep === id && this.bowlZone.contains(object)) { object.visible = false; this.physics.setEnabled(object, false); this.audio.pour(); this.pulse(this.kitchen.objects.bowl); this.next(); return; }
    if (this.step.id === "pour" && id === "bowl" && this.panZone.contains(object)) {
      this.returnHome(object); object.getObjectByName("mixture").visible = false; this.kitchen.objects.pan.getObjectByName("food").visible = true; this.audio.pour(); this.next(); return;
    }
    if (this.step.id === "oven" && id === "pan" && this.ovenZone.contains(object)) {
      object.visible = false; this.physics.setEnabled(object, false); this.audio.oven(); this.cooking.start(); this.setOvenGlow(true); this.next(); return;
    }
    if (this.step.id === "serve" && id === "pan" && this.serviceZone.contains(object)) {
      object.position.copy(this.kitchen.serviceZone.position).add(new THREE.Vector3(0, .045, 0)); this.physics.teleport(object, object.position); this.physics.setEnabled(object, false); object.userData.grabbable = false; this.complete(); return;
    }
    if (!object.userData.heldBy) this.returnHome(object);
  }
  update(delta) {
    if (this.finished) return;
    if (this.step.id === "mix") {
      const whisk = this.grab.getHeldObject("whisk");
      if (whisk) { const progress = this.mixZone.update(whisk); this.ui.setDetail(`Progression : ${Math.round(progress)} %`); if (progress >= 100) { this.kitchen.objects.bowl.getObjectByName("mixture").material.color.set(0xe6b95e); this.next(); } }
    }
    if (this.step.id === "cook") {
      const progress = this.cooking.update(delta); this.ui.setDetail(`Cuisson : ${Math.round(progress * 100)} %`);
      if (this.cooking.finished) {
        this.cooking.stop(); this.setOvenGlow(false); this.audio.success();
        const pan = this.kitchen.objects.pan; pan.visible = true; pan.position.set(-2.05, 1.08, -.18); pan.userData.home.copy(pan.position); this.physics.setEnabled(pan, true); pan.getObjectByName("food").material.color.set(0xc8843f); this.next();
      }
    }
  }
  showMixture() { this.kitchen.objects.bowl.getObjectByName("mixture").visible = true; this.pulse(this.kitchen.objects.bowl); }
  setOvenGlow(active) { const glow = this.kitchen.objects.oven.getObjectByName("ovenGlow"); glow.material.emissive = new THREE.Color(active ? 0xff631f : 0x000000); glow.material.emissiveIntensity = active ? 1.5 : 0; }
  returnHome(object) { if (object.userData.home) object.position.copy(object.userData.home); object.rotation.set(0, 0, 0); this.physics.teleport(object, object.position, object.quaternion); }
  pulse(object) { const start = performance.now(); const animate = (time) => { const t = Math.min((time - start) / 400, 1); object.scale.setScalar(1 + Math.sin(t * Math.PI) * .12); if (t < 1) requestAnimationFrame(animate); else object.scale.setScalar(1); }; requestAnimationFrame(animate); }
  complete() {
    this.finished = true; this.score = 100; this.audio.success(); this.customer.happy(); this.ui.showComplete(); this.dispatchEvent(new CustomEvent("score", { detail: this.score })); document.querySelector("#status").textContent = "Commande terminée — +100 points";
  }
}
