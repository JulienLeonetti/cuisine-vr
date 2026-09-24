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
    ctx.clearRect(0, 0, width, height);
    const background = ctx.createLinearGradient(0, 0, width, height); background.addColorStop(0, "#fffaf0"); background.addColorStop(1, "#efe2c9");
    ctx.fillStyle = background; this.roundedRect(ctx, 0, 0, width, height, 30);
    ctx.fillStyle = complete ? "#587553" : "#b95740"; ctx.fillRect(0, 0, 15, height);
    ctx.fillStyle = complete ? "#587553" : "#293c32"; ctx.beginPath(); ctx.roundRect(48, 28, 230, 48, 24); ctx.fill();
    ctx.fillStyle = "#fff8e9"; ctx.font = "800 22px system-ui"; ctx.fillText(complete ? "✓  TERMINÉ" : "COMMANDE DU JOUR", 71, 59);
    ctx.fillStyle = "#29382f"; ctx.font = "700 56px Georgia"; ctx.fillText(name, 48, 132);
    ctx.fillStyle = "#c76c49"; ctx.beginPath(); ctx.arc(width - 82, 80, 43, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff7e8"; ctx.font = "700 29px Georgia"; ctx.textAlign = "center"; ctx.fillText("AT", width - 82, 90); ctx.textAlign = "left";
    const progress = Math.min((index + 1) / total, 1);
    ctx.fillStyle = "#d8cebc"; ctx.beginPath(); ctx.roundRect(48, 155, width - 96, 10, 5); ctx.fill();
    ctx.fillStyle = complete ? "#587553" : "#c66b48"; ctx.beginPath(); ctx.roundRect(48, 155, (width - 96) * progress, 10, 5); ctx.fill();
    ctx.fillStyle = "#b95740"; ctx.beginPath(); ctx.arc(78, 223, 35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff8e9"; ctx.font = "800 24px system-ui"; ctx.textAlign = "center"; ctx.fillText(String(Math.min(index + 1, total)).padStart(2, "0"), 78, 232); ctx.textAlign = "left";
    ctx.fillStyle = "#68746c"; ctx.font = "800 21px system-ui"; ctx.fillText(`ÉTAPE ${Math.min(index + 1, total)} / ${total}`, 132, 211);
    ctx.fillStyle = "#26372e"; ctx.font = "650 31px system-ui"; this.wrapText(step.instruction, 132, 251, width - 180, 38);
    ctx.fillStyle = "#817667"; ctx.font = "500 22px system-ui"; this.wrapText(detail, 48, 365, width - 96, 28);
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
