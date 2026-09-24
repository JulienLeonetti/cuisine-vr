import * as THREE from "three";
export function createWhiskPlaceholder(handleMaterial, metalMaterial) {
  const group = new THREE.Group(); const handle = new THREE.Mesh(new THREE.CapsuleGeometry(.022, .14, 6, 12), handleMaterial); handle.position.y = .16; handle.castShadow = true; group.add(handle);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.025, .018, .035, 12), metalMaterial); collar.position.y = .055; collar.castShadow = true; group.add(collar);
  for (let index = 0; index < 4; index++) { const angle = index * Math.PI / 4; const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .06, 0), new THREE.Vector3(Math.cos(angle) * .045, .015, Math.sin(angle) * .045), new THREE.Vector3(Math.cos(angle) * .052, -.07, Math.sin(angle) * .052), new THREE.Vector3(0, -.125, 0)]); group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 12, .0025, 5, false), metalMaterial)); }
  group.userData.isPlaceholder = true; return group;
}
