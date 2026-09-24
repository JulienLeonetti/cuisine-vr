import * as THREE from "three";

export class GrabManager extends EventTarget {
  constructor(scene, camera, renderer, grabbables, desktopControls = null, physicsManager = null) {
    super();
    this.scene = scene; this.camera = camera; this.renderer = renderer; this.grabbables = grabbables; this.desktopControls = desktopControls; this.physics = physicsManager;
    this.raycaster = new THREE.Raycaster(); this.raycaster.far = 1.35; this.pointer = new THREE.Vector2(); this.held = new Map();
    this.nearGrabDistance = .22; this.controllerPosition = new THREE.Vector3(); this.objectPosition = new THREE.Vector3();
    this.tempMatrix = new THREE.Matrix4(); this.targetMatrix = new THREE.Matrix4(); this.targetPosition = new THREE.Vector3(); this.targetRotation = new THREE.Quaternion(); this.targetScale = new THREE.Vector3();
    this.desktopHeld = null; this.desktopTarget = new THREE.Vector3(); this.desktopRotation = new THREE.Quaternion();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.12); this.offset = new THREE.Vector3();
    this.bindDesktop();
  }

  registerController(controller) {
    controller.addEventListener("selectstart", () => this.grabWithController(controller));
    controller.addEventListener("selectend", () => this.releaseController(controller));
  }

  getRoot(hit) { return hit?.object.userData.grabRoot || (hit?.object.userData.grabbable ? hit.object : null); }
  candidates() { return this.grabbables.filter((object) => object.visible && object.userData.grabbable && !object.userData.heldBy); }

  grabWithController(controller) {
    this.tempMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
    const candidates = this.candidates();
    let object = this.getRoot(this.raycaster.intersectObjects(candidates, true)[0]);
    if (!object) object = this.findNearest(controller, candidates);
    if (!object || !this.beginGrab(object, controller)) return;
    controller.updateWorldMatrix(true, false); object.updateWorldMatrix(true, false);
    const offset = controller.matrixWorld.clone().invert().multiply(object.matrixWorld);
    this.held.set(controller, { object, offset });
    controller.getObjectByName("pointerRay").visible = false;
    this.dispatchEvent(new CustomEvent("grabstart", { detail: { object, source: controller } }));
  }

  findNearest(controller, candidates) {
    controller.getWorldPosition(this.controllerPosition);
    let nearest = null; let nearestDistance = this.nearGrabDistance;
    for (const candidate of candidates) {
      candidate.getWorldPosition(this.objectPosition);
      const distance = this.controllerPosition.distanceTo(this.objectPosition);
      if (distance < nearestDistance) { nearest = candidate; nearestDistance = distance; }
    }
    return nearest;
  }

  releaseController(controller) {
    const entry = this.held.get(controller); if (!entry) return;
    this.releaseGrab(entry.object); this.held.delete(controller);
    controller.getObjectByName("pointerRay").visible = true;
    this.dispatchEvent(new CustomEvent("grabend", { detail: { object: entry.object, source: controller } }));
  }

  bindDesktop() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener("pointerdown", (event) => {
      if (this.renderer.xr.isPresenting || event.button !== 0) return;
      this.setPointer(event);
      const object = this.getRoot(this.raycaster.intersectObjects(this.candidates(), true)[0]);
      if (!object || !this.beginGrab(object, "mouse")) return;
      this.desktopHeld = object;
      const point = new THREE.Vector3(); this.raycaster.ray.intersectPlane(this.dragPlane, point);
      this.offset.copy(object.position).sub(point); this.desktopTarget.copy(object.position); this.desktopRotation.copy(object.quaternion);
      if (this.desktopControls) this.desktopControls.enabled = false;
      canvas.classList.add("dragging");
      this.dispatchEvent(new CustomEvent("grabstart", { detail: { object, source: "mouse" } }));
    });
    window.addEventListener("pointermove", (event) => {
      if (!this.desktopHeld || this.renderer.xr.isPresenting) return;
      this.setPointer(event); const point = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.dragPlane, point)) this.desktopTarget.copy(point.add(this.offset));
    });
    window.addEventListener("pointerup", () => {
      if (!this.desktopHeld) return;
      const object = this.desktopHeld; this.releaseGrab(object); this.desktopHeld = null;
      canvas.classList.remove("dragging"); if (this.desktopControls) this.desktopControls.enabled = true;
      this.dispatchEvent(new CustomEvent("grabend", { detail: { object, source: "mouse" } }));
    });
  }

  setPointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  getHeldObject(id) {
    for (const entry of this.held.values()) if (entry.object.userData.id === id) return entry.object;
    return this.desktopHeld?.userData.id === id ? this.desktopHeld : null;
  }

  beginGrab(object, source) {
    if (!this.physics?.beginGrab(object)) return false;
    object.userData.heldBy = source;
    return true;
  }

  releaseGrab(object) {
    this.physics?.releaseGrab(object);
    delete object.userData.heldBy;
  }

  update() {
    for (const [controller, entry] of this.held) {
      controller.updateWorldMatrix(true, false);
      this.targetMatrix.multiplyMatrices(controller.matrixWorld, entry.offset);
      this.targetMatrix.decompose(this.targetPosition, this.targetRotation, this.targetScale);
      this.physics?.setGrabTarget(entry.object, this.targetPosition, this.targetRotation);
    }
    if (this.desktopHeld) this.physics?.setGrabTarget(this.desktopHeld, this.desktopTarget, this.desktopRotation);
  }
}
