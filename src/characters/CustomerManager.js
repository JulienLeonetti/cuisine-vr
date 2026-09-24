import { Customer, CustomerState } from "./Customer.js";

export class CustomerManager {
  constructor(scene, ui, audio) {
    this.ui = ui; this.audio = audio; this.customer = new Customer("Marcel", "Fiadone");
    this.customer.root.position.set(0, 0, -2.55); scene.add(this.customer.root); this.started = false;
  }
  async loadAssets(assetManager) { await this.customer.loadAsset(assetManager); }
  startOrder() {
    if (this.started) return; this.started = true; this.customer.setState(CustomerState.ORDERING);
    const text = "Bonjour ! Je voudrais un fiadone."; this.ui.showCustomerSpeech(text);
    setTimeout(() => this.audio.speak(text), 500);
    setTimeout(() => { if (this.customer.state === CustomerState.ORDERING) this.customer.setState(CustomerState.WAITING); }, 3200);
  }
  happy() { this.customer.setState(CustomerState.HAPPY); this.audio.speak("Parfait, merci !"); }
  update(delta, time) { this.customer.update(delta, time); }
}
