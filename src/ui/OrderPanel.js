import * as THREE from "three";

export class OrderPanel {
  constructor({ width = 720, height = 420, worldWidth = 1.2, background = "#fff8e8" } = {}) {
    this.canvas = document.createElement("canvas"); this.canvas.width = width; this.canvas.height = height;
    this.context = this.canvas.getContext("2d"); this.background = background;
    this.texture = new THREE.CanvasTexture(this.canvas); this.texture.colorSpace = THREE.SRGBColorSpace;
    const geometry = new THREE.PlaneGeometry(worldWidth, worldWidth * height / width);
    const material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true, side: THREE.DoubleSide });
    this.mesh = new THREE.Group();
    const shadow = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x17271f, transparent: true, opacity: .7, side: THREE.DoubleSide }));
    shadow.scale.set(1.035, 1.06, 1); shadow.position.z = -.012;
    this.surface = new THREE.Mesh(geometry, material); this.mesh.add(shadow, this.surface);
  }
  roundedRect(context, x, y, width, height, radius) {
    context.beginPath(); context.roundRect(x, y, width, height, radius); context.fill();
  }
  drawRecipe(name, step, index, total, detail = step.detail, complete = false) {
    const ctx = this.context; const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height); ctx.fillStyle = this.background; this.roundedRect(ctx, 0, 0, width, height, 30);
    ctx.fillStyle = complete ? "#52704f" : "#b5533d"; ctx.fillRect(0, 0, 14, height);
    ctx.fillStyle = "#b5533d"; ctx.font = "700 25px system-ui"; ctx.fillText(complete ? "✓ TERMINÉ" : "COMMANDE", 52, 58);
    ctx.fillStyle = "#28382f"; ctx.font = "700 56px Georgia"; ctx.fillText(name.toUpperCase(), 52, 123);
    const progress = Math.min((index + 1) / total, 1);
    ctx.fillStyle = "#ddd5c6"; ctx.beginPath(); ctx.roundRect(52, 151, width - 104, 10, 5); ctx.fill();
    ctx.fillStyle = complete ? "#52704f" : "#c66b48"; ctx.beginPath(); ctx.roundRect(52, 151, (width - 104) * progress, 10, 5); ctx.fill();
    ctx.fillStyle = "#6b776f"; ctx.font = "700 23px system-ui"; ctx.fillText(`ÉTAPE ${Math.min(index + 1, total)} / ${total}`, 52, 207);
    ctx.fillStyle = "#26372e"; ctx.font = "650 33px system-ui"; this.wrapText(step.instruction, 52, 260, width - 104, 41);
    ctx.fillStyle = "#867b6e"; ctx.font = "500 23px system-ui"; this.wrapText(detail, 52, 360, width - 104, 29);
    this.texture.needsUpdate = true;
  }
  drawSpeech(text, title = "MARCEL") {
    const ctx = this.context; const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height); ctx.fillStyle = "#fffaf0"; this.roundedRect(ctx, 0, 0, width, height, 35);
    ctx.fillStyle = "#b5533d"; ctx.font = "700 25px system-ui"; ctx.fillText(title, 44, 55);
    ctx.fillStyle = "#28382f"; ctx.font = "600 34px system-ui"; this.wrapText(text, 44, 115, width - 88, 44);
    this.texture.needsUpdate = true;
  }
  wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" "); let line = "";
    for (const word of words) { const test = `${line}${word} `; if (this.context.measureText(test).width > maxWidth && line) { this.context.fillText(line, x, y); line = `${word} `; y += lineHeight; } else line = test; }
    this.context.fillText(line, x, y);
  }
}
