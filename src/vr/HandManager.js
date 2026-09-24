import { XRHandModelFactory } from "three/addons/webxr/XRHandModelFactory.js";

export class HandManager {
  constructor(renderer, scene) {
    this.hands = [];
    const factory = new XRHandModelFactory();
    for (let index = 0; index < 2; index++) {
      const hand = renderer.xr.getHand(index);
      hand.add(factory.createHandModel(hand, "spheres"));
      scene.add(hand); this.hands.push(hand);
    }
  }
}
