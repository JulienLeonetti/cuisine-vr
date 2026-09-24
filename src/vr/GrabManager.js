import * as THREE from "three";

export class GrabManager extends EventTarget {
  constructor(scene, camera, renderer, grabbables, desktopControls = null, physicsManager = null) {
    super();
    this.scene = scene; this.camera = camera; this.renderer = renderer; this.grabbables = grabbables; this.desktopControls = desktopControls; this.physics = physicsManager;
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2(); this.held = new Map();
    this.tempMatrix = new THREE.Matrix4(); this.desktopHeld = null; this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.08);
    this.offset = new THREE.Vector3(); this.bindDesktop();
  }
  registerController(controller) {
    controller.addEventListener("selectstart", () => this.grabWithController(controller));
    controller.addEventListener("selectend", () => this.releaseController(controller));
  }
  getRoot(hit) { return hit?.object.userData.grabRoot || (hit?.object.userData.grabbable ? hit.object : null); }
  candidates() { return this.grabbables.filter((object) => object.visible && !object.userData.heldBy); }
  grabWithController(controller) {
    this.tempMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
    const object = this.getRoot(this.raycaster.intersectObjects(this.candidates(), true)[0]);
    if (!object) return;
    this.beginGrab(object, controller); controller.attach(object); this.held.set(controller, object);
    controller.getObjectByName("pointerRay").visible = false;
    this.dispatchEvent(new CustomEvent("grabstart", { detail: { object, source: controller } }));
  }
  releaseController(controller) {
    const object = this.held.get(controller); if (!object) return;
    this.scene.attach(object); this.releaseGrab(object); this.held.delete(controller);
    controller.getObjectByName("pointerRay").visible = true;
    this.dispatchEvent(new CustomEvent("grabend", { detail: { object, source: controller } }));
  }
  bindDesktop() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener("pointerdown", (event) => {
      if (this.renderer.xr.isPresenting || event.button !== 0) return;
      this.setPointer(event); const object = this.getRoot(this.raycaster.intersectObjects(this.candidates(), true)[0]);
      if (!object) return;
      this.desktopHeld = object; this.beginGrab(object, "mouse");
      if (this.desktopControls) this.desktopControls.enabled = false;
      const point = new THREE.Vector3(); this.raycaster.ray.intersectPlane(this.dragPlane, point); this.offset.copy(object.position).sub(point);
      canvas.classList.add("dragging"); this.dispatchEvent(new CustomEvent("grabstart", { detail: { object, source: "mouse" } }));
    });
    window.addEventListener("pointermove", (event) => {
      if (!this.desktopHeld || this.renderer.xr.isPresenting) return;
      this.setPointer(event); const point = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.dragPlane, point)) { this.desktopHeld.position.copy(point.add(this.offset)); this.desktopHeld.position.y = 1.1; }
    });
    window.addEventListener("pointerup", () => {
      if (!this.desktopHeld) return;
      const object = this.desktopHeld; this.releaseGrab(object); this.desktopHeld = null; canvas.classList.remove("dragging");
      if (this.desktopControls) this.desktopControls.enabled = true;
      this.dispatchEvent(new CustomEvent("grabend", { detail: { object, source: "mouse" } }));
    });
  }
  setPointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }
  getHeldObject(id) { return [...this.held.values(), this.desktopHeld].find((object) => object?.userData.id === id); }
  beginGrab(object, controller) {
    object.userData.heldBy = controller;
    this.physics?.beginGrab(object);
  }
  updateGrabbedObject(object) { this.physics?.updateGrabbedObject(object); }
  releaseGrab(object) {
    delete object.userData.heldBy;
    this.physics?.releaseGrab(object);
  }
  update() {
    for (const controller of this.held.keys()) {
      const object = this.held.get(controller);
      if (object) { object.userData.worldPosition = object.getWorldPosition(new THREE.Vector3()); this.updateGrabbedObject(object); }
    }
    if (this.desktopHeld) this.updateGrabbedObject(this.desktopHeld);
  }
}
