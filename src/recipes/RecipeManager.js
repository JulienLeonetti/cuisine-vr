import * as THREE from "three";
import { InteractionManager } from "../interactions/InteractionManager.js";
import { DropZone } from "../interactions/DropZone.js";
import { ServiceZone } from "../interactions/ServiceZone.js";
import { EggCrackSystem } from "../interactions/EggCrackSystem.js";
import { MixSystem } from "../interactions/MixSystem.js";
import { PourSystem } from "../interactions/PourSystem.js";
import { CookingSystem } from "../interactions/CookingSystem.js";
import { ServiceSystem } from "../interactions/ServiceSystem.js";
import { FiadoneVisual } from "../objects/Food.js";

export class RecipeManager extends EventTarget {
  constructor(recipe, ui, audio) {
    super(); this.recipe = recipe; this.ui = ui; this.audio = audio;
    this.index = 0; this.eggsTaken = new Set(); this.eggsInBowl = 0; this.score = 0; this.finished = false;
  }
  get step() { return this.recipe.steps[this.index]; }

  connect({ kitchen, grabManager, customerManager, physicsManager }) {
    this.kitchen = kitchen; this.grab = grabManager; this.customer = customerManager; this.physics = physicsManager;
    this.interactions = new InteractionManager(grabManager);
    this.bowlZone = new DropZone(kitchen.objects.bowl, .28, new THREE.Vector3(0, .06, 0));
    this.panZone = new DropZone(kitchen.objects.pan, .3);
    this.ovenZone = new DropZone(kitchen.objects.oven, .62, new THREE.Vector3(0, -.1, -.38));
    this.serviceZone = new ServiceZone(kitchen.serviceZone, .36);
    this.visual = new FiadoneVisual(kitchen.objects.bowl, kitchen.objects.pan);
    this.eggCrack = new EggCrackSystem(kitchen.scene, kitchen.objects.bowl, physicsManager, this.audio);
    this.mix = new MixSystem(kitchen.objects.bowl, this.audio);
    this.pour = new PourSystem(this.bowlZone, this.panZone, this.audio);
    this.cooking = new CookingSystem(kitchen, this.ovenZone, this.audio);
    this.service = new ServiceSystem(this.serviceZone, physicsManager);
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
    if (this.step.id === "take-eggs" && id?.startsWith("egg")) {
      this.eggsTaken.add(id); this.ui.setDetail(`${this.eggsTaken.size} / 3 œufs repérés`);
      if (this.eggsTaken.size === 3) this.next();
    }
  }

  onRelease(object) {
    const id = object.userData.id;
    if (this.step.id === "take-eggs" && id?.startsWith("egg")) return this.returnHome(object);
    if (this.step.id === "crack-eggs" && this.eggCrack.canCrack(object, this.bowlZone)) {
      this.eggCrack.crack(object); this.eggsInBowl += 1; this.visual.setBowlStage("eggs"); this.pulse(this.kitchen.objects.bowl);
      this.ui.setDetail(`${this.eggsInBowl} / 3 œufs cassés`); if (this.eggsInBowl === 3) this.next(); return;
    }
    const ingredientForStep = { brocciu: "brocciu", sugar: "sugar", lemon: "lemon" }[this.step.id];
    if (ingredientForStep === id && this.pour.ingredientDropped(object)) {
      object.visible = false; this.physics.setEnabled(object, false); this.audio.pour(); this.visual.setBowlStage(this.step.id); this.pulse(this.kitchen.objects.bowl); this.next(); return;
    }
    if (this.step.id === "pour" && id === "bowl" && this.pour.bowlPoured(object)) {
      this.returnHome(object); this.visual.pourIntoPan(); this.next(); return;
    }
    if (this.step.id === "oven" && id === "pan" && this.cooking.insert(object)) {
      object.visible = false; this.physics.setEnabled(object, false); this.next(); return;
    }
    if (this.step.id === "serve" && id === "pan" && this.service.serve(object)) { this.complete(); return; }
    if (!object.userData.heldBy) this.returnHome(object);
  }

  update(delta) {
    this.eggCrack.update(delta); if (this.finished) return;
    if (this.step.id === "mix") {
      const progress = this.mix.update(this.grab.getHeldObject("whisk"), delta); this.visual.setMixProgress(progress);
      this.ui.setDetail(`Mélange : ${Math.round(progress)} %`);
      if (progress >= 100) { this.visual.setBowlStage("mixed"); this.next(); }
    }
    if (this.step.id === "cook") {
      const progress = this.cooking.update(delta); this.visual.setCookProgress(progress); this.ui.setDetail(`Cuisson : ${Math.round(progress * 100)} %`);
      if (this.cooking.finished) {
        this.cooking.finish(); this.audio.success();
        const pan = this.kitchen.objects.pan; const ovenPosition = new THREE.Vector3(2.05, 1.08, -.18);
        pan.visible = true; pan.userData.home.copy(ovenPosition); this.physics.setEnabled(pan, true, ovenPosition, new THREE.Quaternion()); this.next();
      }
    }
  }

  returnHome(object) { if (object.userData.home) this.physics.teleport(object, object.userData.home, new THREE.Quaternion()); }
  pulse(object) { const start = performance.now(); const animate = (time) => { const t = Math.min((time - start) / 400, 1); object.scale.setScalar(1 + Math.sin(t * Math.PI) * .08); if (t < 1) requestAnimationFrame(animate); else object.scale.setScalar(1); }; requestAnimationFrame(animate); }
  complete() {
    this.finished = true; this.score = 100; this.audio.success(); this.customer.happy(); this.ui.showComplete();
    this.dispatchEvent(new CustomEvent("score", { detail: this.score })); document.querySelector("#status").textContent = "Commande terminée — +100 points";
  }
}
