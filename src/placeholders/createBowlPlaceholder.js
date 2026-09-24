import * as THREE from "three";
export function createBowlPlaceholder(ceramicMaterial, mixtureMaterial) {
  const group = new THREE.Group();
  const profile = [new THREE.Vector2(.055, -.07), new THREE.Vector2(.105, -.062), new THREE.Vector2(.158, -.025), new THREE.Vector2(.18, .055), new THREE.Vector2(.176, .068), new THREE.Vector2(.158, .07), new THREE.Vector2(.145, .052), new THREE.Vector2(.13, -.015), new THREE.Vector2(.08, -.052)];
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(profile, 32), ceramicMaterial); bowl.castShadow = bowl.receiveShadow = true;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.168, .009, 8, 32), ceramicMaterial); rim.rotation.x = Math.PI / 2; rim.position.y = .063; rim.castShadow = true;
  const mixture = new THREE.Mesh(new THREE.CylinderGeometry(.145, .14, .012, 32), mixtureMaterial); mixture.position.y = .035; mixture.visible = false; mixture.name = "mixture";
  group.add(bowl, rim, mixture); group.userData.isPlaceholder = true; return group;
}
