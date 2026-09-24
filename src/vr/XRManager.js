import { VRButton } from "three/addons/webxr/VRButton.js";
import { ControllerManager } from "./ControllerManager.js";
import { HandManager } from "./HandManager.js";

export class XRManager {
  constructor(renderer, scene, camera, grabManager) {
    this.renderer = renderer; this.scene = scene; this.camera = camera; this.grabManager = grabManager;
    this.desktopPosition = camera.position.clone();
  }
  async init() {
    this.renderer.xr.enabled = true;
    this.renderer.xr.setReferenceSpaceType("local-floor");
    const sessionOptions = { optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"] };
    const button = VRButton.createButton(this.renderer, sessionOptions);
    button.textContent = "ENTRER EN VR";
    document.body.appendChild(button);
    this.controllers = new ControllerManager(this.renderer, this.scene, this.grabManager);
    this.hands = new HandManager(this.renderer, this.scene);
    this.renderer.xr.addEventListener("sessionstart", () => {
      this.camera.position.set(0, 0, 0);
      document.body.classList.add("xr-active");
      document.querySelector("#status").textContent = "VR active — gâchette pour saisir.";
    });
    this.renderer.xr.addEventListener("sessionend", () => {
      this.camera.position.copy(this.desktopPosition);
      document.body.classList.remove("xr-active");
    });
    if (!navigator.xr || !(await navigator.xr.isSessionSupported("immersive-vr").catch(() => false))) {
      document.querySelector("#unsupported").hidden = false;
    }
  }
}
