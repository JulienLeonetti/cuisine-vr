import * as THREE from "three";
import { isDebugEnabled } from "./DebugConfig.js";

let RAPIER;

const ZERO = Object.freeze({ x: 0, y: 0, z: 0 });
const FIXED_TIMESTEP = 1 / 120;
const MAX_FRAME_TIME = .1;
const MAX_SUBSTEPS = 12;
const MAX_RELEASE_SPEED = 3.5;
const KINEMATIC_SAMPLE_DISTANCE = .018;

export class PhysicsManager {
  constructor({ resetHeight = -2 } = {}) {
    this.resetHeight = resetHeight;
    this.world = null;
    this.records = new Map();
    this.fixedColliderHandles = new Set();
    this.accumulator = 0;
    this.enabled = true;
    this.debugEnabled = isDebugEnabled("physicsDebug");
    this.debugRenderer = null;
  }

  async init(scene) {
    RAPIER = (await import("@dimforge/rapier3d-compat")).default;
    await RAPIER.init();
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this.world.timestep = FIXED_TIMESTEP;
    this.world.integrationParameters.numSolverIterations = 7;
    this.world.integrationParameters.numInternalPgsIterations = 2;
    this.world.integrationParameters.maxCcdSubsteps = 4;
    this.world.integrationParameters.normalizedAllowedLinearError = .0005;
    this.world.integrationParameters.normalizedPredictionDistance = .003;
    if (this.debugEnabled && scene) this.createDebugRenderer(scene);
  }

  addFixedBox(position, halfExtents, rotation = null, name = "fixed") {
    const descriptor = RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z);
    if (rotation) descriptor.setRotation(rotation);
    const body = this.world.createRigidBody(descriptor);
    const colliderDescriptor = RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z)
      .setFriction(.82)
      .setRestitution(.02);
    const collider = this.world.createCollider(colliderDescriptor, body);
    this.fixedColliderHandles.add(collider.handle);
    body.userData = { name };
    return body;
  }

  addDynamic(object, shape, options = {}) {
    object.updateWorldMatrix(true, false);
    const position = object.getWorldPosition(new THREE.Vector3());
    const rotation = object.getWorldQuaternion(new THREE.Quaternion());
    const bodyDescriptor = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(position.x, position.y, position.z)
      .setRotation(rotation)
      .setLinearDamping(options.linearDamping ?? .65)
      .setAngularDamping(options.angularDamping ?? 1.8)
      .setCcdEnabled(options.ccd ?? true)
      .setSoftCcdPrediction(options.softCcdPrediction ?? .22)
      .setAdditionalSolverIterations(options.solverIterations ?? 4)
      .setCanSleep(true);
    const body = this.world.createRigidBody(bodyDescriptor);
    const colliderDescriptor = this.createCollider(shape)
      .setFriction(options.friction ?? .62)
      .setRestitution(options.restitution ?? .035)
      .setDensity(options.density ?? 1);
    const collider = this.world.createCollider(colliderDescriptor, body);
    const record = {
      object, body, collider, shape, held: false,
      homePosition: object.userData.home?.clone() ?? position.clone(),
      homeRotation: object.quaternion.clone(),
      lastSafePosition: position.clone(),
      lastSafeRotation: rotation.clone(),
      previousTarget: position.clone(),
      velocity: new THREE.Vector3(),
      lastTargetTime: performance.now()
    };
    this.records.set(object, record);
    object.userData.physicsBody = body;
    object.userData.colliderShape = shape;
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
    const record = this.records.get(object); if (!record) return false;
    const bodyPosition = record.body.translation();
    const bodyRotation = record.body.rotation();
    record.held = true;
    record.lastSafePosition.set(bodyPosition.x, bodyPosition.y, bodyPosition.z);
    record.lastSafeRotation.set(bodyRotation.x, bodyRotation.y, bodyRotation.z, bodyRotation.w);
    record.previousTarget.copy(record.lastSafePosition);
    record.velocity.set(0, 0, 0);
    record.lastTargetTime = performance.now();
    record.body.setLinvel(ZERO, true); record.body.setAngvel(ZERO, true);
    record.body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
    return true;
  }

  setGrabTarget(object, desiredPosition, desiredRotation) {
    const record = this.records.get(object); if (!record?.held) return;
    const safe = this.constrainKinematicTarget(record, desiredPosition, desiredRotation);
    const now = performance.now();
    const delta = Math.max((now - record.lastTargetTime) / 1000, 1 / 120);
    record.velocity.copy(safe.position).sub(record.previousTarget).divideScalar(delta).clampLength(0, MAX_RELEASE_SPEED);
    record.previousTarget.copy(safe.position); record.lastTargetTime = now;
    record.lastSafePosition.copy(safe.position); record.lastSafeRotation.copy(safe.rotation);
    record.body.setNextKinematicTranslation(safe.position);
    record.body.setNextKinematicRotation(safe.rotation);
  }

  constrainKinematicTarget(record, desiredPosition, desiredRotation) {
    const start = record.lastSafePosition;
    const distance = start.distanceTo(desiredPosition);
    const samples = Math.min(32, Math.max(1, Math.ceil(distance / KINEMATIC_SAMPLE_DISTANCE)));
    const safePosition = start.clone();
    const safeRotation = record.lastSafeRotation.clone();
    for (let index = 1; index <= samples; index++) {
      const alpha = index / samples;
      const candidatePosition = start.clone().lerp(desiredPosition, alpha);
      const candidateRotation = record.lastSafeRotation.clone().slerp(desiredRotation, alpha);
      if (!this.isPositionFree(record, candidatePosition, candidateRotation)) break;
      safePosition.copy(candidatePosition); safeRotation.copy(candidateRotation);
    }
    return { position: safePosition, rotation: safeRotation };
  }

  isPositionFree(record, position, rotation) {
    let blocked = false;
    this.world.intersectionsWithShape(
      position,
      rotation,
      record.collider.shape,
      (collider) => {
        if (this.fixedColliderHandles.has(collider.handle)) { blocked = true; return false; }
        return true;
      },
      undefined,
      undefined,
      record.collider,
      record.body
    );
    return !blocked;
  }

  safeReleasePosition(record) {
    const position = record.lastSafePosition.clone();
    const rotation = record.lastSafeRotation.clone();
    if (this.isPositionFree(record, position, rotation)) return { position, rotation };
    if (this.isPositionFree(record, record.lastSafePosition, record.lastSafeRotation)) {
      return { position: record.lastSafePosition.clone(), rotation: record.lastSafeRotation.clone() };
    }
    for (let offset = .01; offset <= .35; offset += .01) {
      const lifted = position.clone(); lifted.y += offset;
      if (this.isPositionFree(record, lifted, rotation)) return { position: lifted, rotation };
    }
    return { position: record.homePosition.clone(), rotation: record.homeRotation.clone() };
  }

  releaseGrab(object) {
    const record = this.records.get(object); if (!record) return;
    const safe = this.safeReleasePosition(record);
    record.held = false;
    record.body.setTranslation(safe.position, true); record.body.setRotation(safe.rotation, true);
    record.body.setLinvel(ZERO, true); record.body.setAngvel(ZERO, true);
    record.body.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
    record.body.enableCcd(true);
    record.body.setLinvel(record.velocity.clone().clampLength(0, MAX_RELEASE_SPEED), true);
    this.syncObject(record);
  }

  setEnabled(object, enabled, position = null, rotation = null) {
    const record = this.records.get(object); if (!record) return;
    record.body.setEnabled(enabled);
    if (enabled) this.teleport(object, position ?? record.homePosition, rotation ?? record.homeRotation);
  }

  teleport(object, position = object.userData.home, rotation = object.quaternion) {
    const record = this.records.get(object); if (!record || !position) return;
    const safe = this.findSafeTeleport(record, position, rotation);
    record.body.setTranslation(safe.position, true); record.body.setRotation(safe.rotation, true);
    record.body.setLinvel(ZERO, true); record.body.setAngvel(ZERO, true);
    record.lastSafePosition.copy(safe.position); record.lastSafeRotation.copy(safe.rotation);
    this.syncObject(record);
  }

  findSafeTeleport(record, position, rotation) {
    if (this.isPositionFree(record, position, rotation)) return { position: position.clone(), rotation: rotation.clone() };
    for (let offset = .01; offset <= .4; offset += .01) {
      const lifted = position.clone(); lifted.y += offset;
      if (this.isPositionFree(record, lifted, rotation)) return { position: lifted, rotation: rotation.clone() };
    }
    return { position: record.homePosition.clone(), rotation: record.homeRotation.clone() };
  }

  resetObject(record) {
    record.object.visible = true;
    record.body.setEnabled(true);
    this.teleport(record.object, record.homePosition, record.homeRotation);
  }

  syncObject(record) {
    const translation = record.body.translation(); const rotation = record.body.rotation();
    record.object.position.set(translation.x, translation.y, translation.z);
    record.object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    record.object.updateMatrixWorld(true);
  }

  update(delta) {
    if (!this.enabled || !this.world) return;
    this.accumulator += Math.min(delta, MAX_FRAME_TIME);
    let substeps = 0;
    while (this.accumulator >= FIXED_TIMESTEP && substeps < MAX_SUBSTEPS) {
      this.world.step();
      this.accumulator -= FIXED_TIMESTEP;
      substeps += 1;
    }
    if (substeps === MAX_SUBSTEPS) this.accumulator = 0;
    for (const record of this.records.values()) {
      if (!record.body.isEnabled()) continue;
      const translation = record.body.translation();
      if (translation.y < this.resetHeight) { this.resetObject(record); continue; }
      this.syncObject(record);
    }
    if (this.debugEnabled) this.updateDebugRenderer();
  }

  createDebugRenderer(scene) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .78, depthTest: false });
    this.debugRenderer = new THREE.LineSegments(geometry, material);
    this.debugRenderer.renderOrder = 999;
    scene.add(this.debugRenderer);
  }

  updateDebugRenderer() {
    if (!this.debugRenderer) return;
    const buffers = this.world.debugRender();
    this.debugRenderer.geometry.setAttribute("position", new THREE.BufferAttribute(buffers.vertices, 3));
    this.debugRenderer.geometry.setAttribute("color", new THREE.BufferAttribute(buffers.colors, 4));
    this.debugRenderer.geometry.computeBoundingSphere();
  }
}
