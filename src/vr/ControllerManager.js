import * as THREE from "three";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";

export class ControllerManager {
  constructor(renderer, scene, grabManager) {
    this.renderer = renderer; this.scene = scene; this.grabManager = grabManager;
    this.controllers = [];
    const modelFactory = new XRControllerModelFactory();
    for (let index = 0; index < 2; index++) {
      const controller = renderer.xr.getController(index);
      controller.userData.hand = index === 0 ? "left" : "right";
      const ray = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]),
        new THREE.LineBasicMaterial({ color: 0xffd27d, transparent: true, opacity: .8 })
      );
      ray.name = "pointerRay"; ray.scale.z = 2; controller.add(ray);
      scene.add(controller);
      const grip = renderer.xr.getControllerGrip(index);
      grip.add(modelFactory.createControllerModel(grip)); scene.add(grip);
      grabManager.registerController(controller);
      this.controllers.push(controller);
    }
  }
}
