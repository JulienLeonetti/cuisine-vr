import { OrderPanel } from "./OrderPanel.js";
import { DialogueBubble } from "./DialogueBubble.js";

export class VRUIManager {
  constructor(scene) {
    this.scene = scene; this.lastRecipe = null; this.flashUntil = 0;
    this.orderPanel = new OrderPanel();
    this.orderPanel.mesh.position.set(-1.65, 1.72, -.82); this.orderPanel.mesh.rotation.y = .28; scene.add(this.orderPanel.mesh);
    this.speechPanel = new DialogueBubble({ worldWidth: 1.02 });
    this.speechPanel.mesh.position.set(0, 2.05, -2.12); scene.add(this.speechPanel.mesh);
    this.speechHideAt = 0; this.speechFadeStart = 0;
  }
  showRecipe(name, step, index, total) {
    this.lastRecipe = { name, step, index, total, detail: step.detail };
    if (performance.now() >= this.flashUntil) this.orderPanel.drawRecipe(name, step, index, total);
  }
  setDetail(detail) { if (!this.lastRecipe) return; this.lastRecipe.detail = detail; const value = this.lastRecipe; this.orderPanel.drawRecipe(value.name, value.step, value.index, value.total, detail); }
  flashComplete() { this.flashUntil = performance.now() + 480; if (this.lastRecipe) { const value = this.lastRecipe; this.orderPanel.drawRecipe(value.name, value.step, value.index, value.total, value.detail, true); } }
  showCustomerSpeech(text, duration = 5) {
    this.speechPanel.draw(text); this.speechPanel.setOpacity(1); this.speechPanel.mesh.visible = true;
    this.speechFadeStart = performance.now() + duration * 1000; this.speechHideAt = this.speechFadeStart + 900;
  }
  showComplete() {
    const finalStep = { instruction: "COMMANDE TERMINÉE", detail: "+100 points" };
    this.orderPanel.drawRecipe("Fiadone", finalStep, 9, 10, "+100 points", true);
    this.showCustomerSpeech("Parfait, merci !");
  }
  update(time) {
    if (this.flashUntil && performance.now() > this.flashUntil) { this.flashUntil = 0; if (this.lastRecipe) { const value = this.lastRecipe; this.orderPanel.drawRecipe(value.name, value.step, value.index, value.total, value.detail); } }
    this.orderPanel.mesh.position.y = 1.72 + Math.sin(time * .8) * .008;
    const pulse = this.flashUntil ? 1 + Math.sin(performance.now() * .025) * .025 : 1;
    this.orderPanel.mesh.scale.setScalar(pulse);
    this.speechPanel.mesh.position.y = 2.05 + Math.sin(time * 1.1) * .012;
    if (this.speechHideAt) {
      const now = performance.now();
      if (now >= this.speechHideAt) { this.speechPanel.mesh.visible = false; this.speechHideAt = 0; }
      else if (now > this.speechFadeStart) this.speechPanel.setOpacity(1 - (now - this.speechFadeStart) / (this.speechHideAt - this.speechFadeStart));
    }
  }
}
