import { XRHandModelFactory } from "three/addons/webxr/XRHandModelFactory.js";

export class HandManager {
  constructor(renderer, scene) {
    this.hands = []; this.mode = "hands";
    const factory = new XRHandModelFactory();
    for (let index = 0; index < 2; index++) {
      const hand = renderer.xr.getHand(index);
      const model = factory.createHandModel(hand, "mesh"); model.name = index === 0 ? "hand-left" : "hand-right"; hand.add(model);
      scene.add(hand); this.hands.push(hand);
    }
  }
  setVisible(visible) { for (const hand of this.hands) hand.visible = visible; }
}
