import * as THREE from "three";

export const PALETTE = Object.freeze({
  cream: 0xfff3dc,
  warmWhite: 0xf8ecd3,
  limestone: 0xcdbb9c,
  limestoneDark: 0xa99779,
  wood: 0x9b5734,
  woodDark: 0x563624,
  woodLight: 0xc17a49,
  terracotta: 0xbd5c42,
  terracottaDark: 0x833f35,
  olive: 0x5f744c,
  oliveDark: 0x344b39,
  lemon: 0xf2c94c,
  sea: 0x75b8c5,
  sky: 0x9ed3db,
  ink: 0x24352d,
  brass: 0xd2a24e,
  steel: 0xb8c2be
});

function canvasTexture(size, painter) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  painter(context, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 2;
  return texture;
}

function woodTexture() {
  const texture = canvasTexture(256, (ctx, size) => {
    ctx.fillStyle = "#9d5c37"; ctx.fillRect(0, 0, size, size);
    for (let line = 0; line < 34; line++) {
      const y = (line / 34) * size;
      ctx.strokeStyle = line % 4 === 0 ? "#70402666" : "#c9855550";
      ctx.lineWidth = line % 4 === 0 ? 3 : 1;
      ctx.beginPath();
      for (let x = 0; x <= size; x += 8) {
        const wave = Math.sin(x * .055 + line * 1.7) * 3;
        if (x === 0) ctx.moveTo(x, y + wave); else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
    for (const [x, y] of [[50, 70], [170, 182]]) {
      ctx.strokeStyle = "#5e34225c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, 24, 8, -.15, 0, Math.PI * 2); ctx.stroke();
    }
  });
  texture.repeat.set(3, 1);
  return texture;
}

function plasterTexture() {
  const texture = canvasTexture(128, (ctx, size) => {
    ctx.fillStyle = "#eadfc6"; ctx.fillRect(0, 0, size, size);
    for (let index = 0; index < 600; index++) {
      const shade = 205 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgba(${shade},${shade - 5},${shade - 18},.13)`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
    }
  });
  texture.repeat.set(4, 3);
  return texture;
}

let cachedMaterials;

export function getStyleMaterials() {
  if (cachedMaterials) return cachedMaterials;
  const woodMap = woodTexture();
  const plasterMap = plasterTexture();
  cachedMaterials = {
    wood: new THREE.MeshStandardMaterial({ color: 0xffffff, map: woodMap, roughness: .62 }),
    woodDark: new THREE.MeshStandardMaterial({ color: PALETTE.woodDark, roughness: .72 }),
    woodLight: new THREE.MeshStandardMaterial({ color: PALETTE.woodLight, roughness: .66 }),
    plaster: new THREE.MeshStandardMaterial({ color: PALETTE.warmWhite, map: plasterMap, roughness: .93 }),
    stone: new THREE.MeshStandardMaterial({ color: PALETTE.limestone, roughness: .96 }),
    terracotta: new THREE.MeshStandardMaterial({ color: PALETTE.terracotta, roughness: .8 }),
    olive: new THREE.MeshStandardMaterial({ color: PALETTE.olive, roughness: .78 }),
    oliveDark: new THREE.MeshStandardMaterial({ color: PALETTE.oliveDark, roughness: .8 }),
    ceramic: new THREE.MeshStandardMaterial({ color: PALETTE.cream, roughness: .4 }),
    steel: new THREE.MeshStandardMaterial({ color: PALETTE.steel, roughness: .28, metalness: .72 }),
    brass: new THREE.MeshStandardMaterial({ color: PALETTE.brass, roughness: .34, metalness: .56 }),
    ink: new THREE.MeshStandardMaterial({ color: PALETTE.ink, roughness: .78 })
  };
  return cachedMaterials;
}

export function applySoftShadows(root, cast = true, receive = true) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = cast;
    child.receiveShadow = receive;
  });
  return root;
}
