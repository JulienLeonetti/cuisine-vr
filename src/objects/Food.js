import * as THREE from "three";

const foodMaterial = (color, roughness = .72) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });

export class FiadoneVisual {
  constructor(bowl, pan) {
    this.bowl = bowl;
    this.pan = pan;
    this.mixture = bowl.getObjectByName("mixture");
    this.food = pan.getObjectByName("food");
    this.mixAmount = 0;
    if (this.mixture) { this.mixture.visible = false; this.mixture.material = foodMaterial(0xf0b43f, .62); }
    if (this.food) { this.food.visible = false; this.food.material = foodMaterial(0xf0cf82, .68); }
  }

  setBowlStage(stage) {
    if (!this.mixture) return;
    const stages = {
      empty: { visible: false, color: 0xf0b43f, scale: .75 },
      eggs: { visible: true, color: 0xf4ba3c, scale: .82 },
      brocciu: { visible: true, color: 0xf2d595, scale: .91 },
      sugar: { visible: true, color: 0xf3dda6, scale: .96 },
      lemon: { visible: true, color: 0xf1d27b, scale: 1 },
      mixed: { visible: true, color: 0xf1cf75, scale: 1.02 }
    };
    const state = stages[stage] || stages.empty;
    this.mixture.visible = state.visible;
    this.mixture.material.color.setHex(state.color);
    this.mixture.scale.setScalar(state.scale);
  }

  setMixProgress(progress) {
    this.mixAmount = THREE.MathUtils.clamp(progress / 100, 0, 1);
    if (!this.mixture) return;
    this.mixture.material.color.lerpColors(new THREE.Color(0xf3dda6), new THREE.Color(0xf1cf75), this.mixAmount);
    this.mixture.scale.y = .9 + this.mixAmount * .1;
  }

  pourIntoPan() {
    if (this.mixture) this.mixture.visible = false;
    if (this.food) { this.food.visible = true; this.food.material.color.setHex(0xf0cf82); this.food.scale.y = .72; }
  }

  setCookProgress(progress) {
    if (!this.food) return;
    this.food.material.color.lerpColors(new THREE.Color(0xf0cf82), new THREE.Color(0xc77632), progress);
    this.food.material.roughness = .68 + progress * .14;
    this.food.scale.y = .72 + Math.sin(progress * Math.PI) * .18;
  }
}
