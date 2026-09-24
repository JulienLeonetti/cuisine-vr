import { OrderPanel } from "./OrderPanel.js";

export class VRUIManager {
  constructor(scene) {
    this.scene = scene; this.lastRecipe = null; this.flashUntil = 0;
    this.orderPanel = new OrderPanel();
    this.orderPanel.mesh.position.set(-1.65, 1.72, -.82); this.orderPanel.mesh.rotation.y = .28; scene.add(this.orderPanel.mesh);
    this.speechPanel = new OrderPanel({ width: 620, height: 240, worldWidth: .9 });
    this.speechPanel.mesh.position.set(0, 2.32, -2.28); scene.add(this.speechPanel.mesh);
  }
  showRecipe(name, step, index, total) {
    this.lastRecipe = { name, step, index, total, detail: step.detail };
    if (performance.now() >= this.flashUntil) this.orderPanel.drawRecipe(name, step, index, total);
  }
  setDetail(detail) { if (!this.lastRecipe) return; this.lastRecipe.detail = detail; const value = this.lastRecipe; this.orderPanel.drawRecipe(value.name, value.step, value.index, value.total, detail); }
  flashComplete() { this.flashUntil = performance.now() + 480; if (this.lastRecipe) { const value = this.lastRecipe; this.orderPanel.drawRecipe(value.name, value.step, value.index, value.total, value.detail, true); } }
  showCustomerSpeech(text) { this.speechPanel.drawSpeech(text); this.speechPanel.mesh.visible = true; }
  showComplete() {
    const finalStep = { instruction: "COMMANDE TERMINÉE", detail: "+100 points" };
    this.orderPanel.drawRecipe("Fiadone", finalStep, 11, 12, "+100 points", true);
    this.showCustomerSpeech("Parfait, merci !");
  }
  update(time) {
    if (this.flashUntil && performance.now() > this.flashUntil) { this.flashUntil = 0; if (this.lastRecipe) { const value = this.lastRecipe; this.orderPanel.drawRecipe(value.name, value.step, value.index, value.total, value.detail); } }
    this.orderPanel.mesh.position.y = 1.72 + Math.sin(time * .8) * .008;
  }
}
