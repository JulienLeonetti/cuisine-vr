import * as THREE from "three";

export class DialogueBubble {
  constructor({ worldWidth = 1.02 } = {}) {
    this.canvas = document.createElement("canvas"); this.canvas.width = 768; this.canvas.height = 260;
    this.context = this.canvas.getContext("2d");
    this.texture = new THREE.CanvasTexture(this.canvas); this.texture.colorSpace = THREE.SRGBColorSpace;
    const geometry = new THREE.PlaneGeometry(worldWidth, worldWidth * 260 / 768);
    this.mesh = new THREE.Group();
    const shadow = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x14231c, transparent: true, opacity: .52, side: THREE.DoubleSide }));
    shadow.scale.set(1.025, 1.07, 1); shadow.position.set(.012, -.012, -.01);
    const panel = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: this.texture, transparent: true, side: THREE.DoubleSide }));
    const tailGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.1, -.17, 0), new THREE.Vector3(.03, -.17, 0), new THREE.Vector3(-.03, -.29, 0)]);
    tailGeometry.setIndex([0, 1, 2]); tailGeometry.computeVertexNormals();
    const tail = new THREE.Mesh(tailGeometry, new THREE.MeshBasicMaterial({ color: 0xfff8e9, side: THREE.DoubleSide }));
    this.mesh.add(shadow, panel, tail);
    this.opacity = 1;
  }

  setOpacity(value) {
    this.opacity = value;
    this.mesh.traverse((child) => { if (child.material) { child.material.transparent = true; child.material.opacity = value * (child === this.mesh.children[0] ? .52 : 1); } });
  }

  draw(text, title = "MARCEL") {
    const ctx = this.context; const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fff8e9"; ctx.beginPath(); ctx.roundRect(0, 0, width, height, 34); ctx.fill();
    ctx.fillStyle = "#bd5c42"; ctx.beginPath(); ctx.roundRect(36, 28, 166, 50, 25); ctx.fill();
    ctx.fillStyle = "#fff8e9"; ctx.font = "800 25px system-ui"; ctx.textAlign = "center"; ctx.fillText(title, 119, 62);
    ctx.textAlign = "left"; ctx.fillStyle = "#d5a34e"; ctx.font = "700 64px Georgia"; ctx.fillText("“", 35, 143);
    ctx.fillStyle = "#26382f"; ctx.font = "600 36px system-ui"; this.wrapText(text, 95, 135, width - 140, 47);
    this.texture.needsUpdate = true;
  }

  wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" "); let line = "";
    for (const word of words) {
      const test = `${line}${word} `;
      if (this.context.measureText(test).width > maxWidth && line) { this.context.fillText(line, x, y); line = `${word} `; y += lineHeight; }
      else line = test;
    }
    this.context.fillText(line, x, y);
  }
}
