import * as THREE from "three";

let RAPIER;

const ZERO = { x: 0, y: 0, z: 0 };

export class PhysicsManager {
  constructor({ resetHeight = -2 } = {}) {
    this.resetHeight = resetHeight;
    this.world = null;
    this.records = new Map();
    this.enabled = true;
  }

  async init() {
    RAPIER = (await import("@dimforge/rapier3d-compat")).default;
    await RAPIER.init();
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this.world.timestep = 1 / 72;
  }

  addFixedBox(position, halfExtents, rotation = null) {
    const descriptor = RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z);
    if (rotation) descriptor.setRotation(rotation);
    const body = this.world.createRigidBody(descriptor);
    const collider = RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z).setFriction(.85);
    this.world.createCollider(collider, body);
    return body;
  }

  addDynamic(object, shape, options = {}) {
    object.updateWorldMatrix(true, false);
    const position = object.getWorldPosition(new THREE.Vector3());
    const rotation = object.getWorldQuaternion(new THREE.Quaternion());
    const bodyDescriptor = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(position.x, position.y, position.z)
      .setRotation(rotation)
      .setLinearDamping(options.linearDamping ?? 1.1)
      .setAngularDamping(options.angularDamping ?? 2.4)
      .setCcdEnabled(true);
    const body = this.world.createRigidBody(bodyDescriptor);
    const colliderDescriptor = this.createCollider(shape)
      .setFriction(options.friction ?? .72)
      .setRestitution(options.restitution ?? .08)
      .setDensity(options.density ?? 1);
    const collider = this.world.createCollider(colliderDescriptor, body);
    const record = {
      object, body, collider, held: false,
      homePosition: object.userData.home?.clone() ?? position.clone(),
      homeRotation: object.quaternion.clone(),
      lastPosition: position.clone(), velocity: new THREE.Vector3(), lastTime: performance.now()
    };
    this.records.set(object, record);
    object.userData.physicsBody = body;
    return body;
  }

  createCollider(shape) {
    switch (shape.type) {
      case "sphere": return RAPIER.ColliderDesc.ball(shape.radius);
      case "capsule": return RAPIER.ColliderDesc.capsule(shape.halfHeight, shape.radius);
      case "cylinder": return RAPIER.ColliderDesc.cylinder(shape.halfHeight, shape.radius);
      case "roundBox": return RAPIER.ColliderDesc.roundCuboid(shape.x, shape.y, shape.z, shape.borderRadius ?? .01);
      default: return RAPIER.ColliderDesc.cuboid(shape.x, shape.y, shape.z);
    }
  }

  beginGrab(object) {
    const record = this.records.get(object); if (!record) return;
    record.held = true; record.lastTime = performance.now();
    object.getWorldPosition(record.lastPosition);
    record.body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
    record.body.setLinvel(ZERO, true); record.body.setAngvel(ZERO, true);
  }

  updateGrabbedObject(object) {
    const record = this.records.get(object); if (!record?.held) return;
    const position = object.getWorldPosition(new THREE.Vector3());
    const rotation = object.getWorldQuaternion(new THREE.Quaternion());
    const now = performance.now(); const delta = Math.max((now - record.lastTime) / 1000, 1 / 120);
    record.velocity.copy(position).sub(record.lastPosition).divideScalar(delta).clampLength(0, 5);
    record.lastPosition.copy(position); record.lastTime = now;
    record.body.setNextKinematicTranslation(position);
    record.body.setNextKinematicRotation(rotation);
  }

  releaseGrab(object) {
    const record = this.records.get(object); if (!record) return;
    const position = object.getWorldPosition(new THREE.Vector3());
    const rotation = object.getWorldQuaternion(new THREE.Quaternion());
    record.held = false;
    record.body.setTranslation(position, true); record.body.setRotation(rotation, true);
    record.body.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
    record.body.setLinvel(record.velocity, true); record.body.setAngvel(ZERO, true);
  }

  setEnabled(object, enabled) {
    const record = this.records.get(object); if (!record) return;
    record.body.setEnabled(enabled);
    if (enabled) this.teleport(object, object.position, object.quaternion);
  }

  teleport(object, position = object.userData.home, rotation = object.quaternion) {
    const record = this.records.get(object); if (!record || !position) return;
    object.position.copy(position); object.quaternion.copy(rotation);
    object.updateWorldMatrix(true, false);
    const worldPosition = object.getWorldPosition(new THREE.Vector3());
    const worldRotation = object.getWorldQuaternion(new THREE.Quaternion());
    record.body.setTranslation(worldPosition, true); record.body.setRotation(worldRotation, true);
    record.body.setLinvel(ZERO, true); record.body.setAngvel(ZERO, true);
  }

  resetObject(record) {
    record.object.visible = true;
    record.object.position.copy(record.homePosition); record.object.quaternion.copy(record.homeRotation);
    record.body.setEnabled(true); this.teleport(record.object, record.homePosition, record.homeRotation);
  }

  update(delta) {
    if (!this.enabled || !this.world) return;
    this.world.timestep = Math.min(delta, 1 / 45);
    this.world.step();
    for (const record of this.records.values()) {
      if (!record.body.isEnabled() || record.held || record.object.userData.heldBy) continue;
      const translation = record.body.translation(); const rotation = record.body.rotation();
      if (translation.y < this.resetHeight) { this.resetObject(record); continue; }
      record.object.position.set(translation.x, translation.y, translation.z);
      record.object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    }
  }
}
