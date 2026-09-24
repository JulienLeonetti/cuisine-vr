import { publicPath } from "./Paths.js";

export const ASSET_MANIFEST = Object.freeze({
  customer: { url: publicPath("models/characters/customer.glb"), enabled: false, scale: 1 },
  counter: { url: publicPath("models/kitchen/counter.glb"), enabled: false, scale: 1 },
  oven: { url: publicPath("models/kitchen/oven.glb"), enabled: false, scale: 1 },
  bowl: { url: publicPath("models/kitchen/bowl.glb"), enabled: false, scale: 1 },
  egg: { url: publicPath("models/ingredients/egg.glb"), enabled: false, scale: 1 },
  lemon: { url: publicPath("models/ingredients/lemon.glb"), enabled: false, scale: 1 },
  brocciu: { url: publicPath("models/ingredients/brocciu.glb"), enabled: false, scale: 1 },
  sugar: { url: publicPath("models/ingredients/sugar-pot.glb"), enabled: false, scale: 1 },
  whisk: { url: publicPath("models/tools/whisk.glb"), enabled: false, scale: 1 },
  pan: { url: publicPath("models/tools/baking-pan.glb"), enabled: false, scale: 1 },
  fiadoneRaw: { url: publicPath("models/food/fiadone-raw.glb"), enabled: false, scale: 1 },
  fiadoneBaked: { url: publicPath("models/food/fiadone-baked.glb"), enabled: false, scale: 1 },
  village: { url: publicPath("models/buildings/corsican-village.glb"), enabled: false, scale: 1 },
  kitchenDecor: { url: publicPath("models/decorations/kitchen-decor.glb"), enabled: false, scale: 1 },
  handLeft: { url: publicPath("models/hands/hand_left.glb"), enabled: false, scale: 1 },
  handRight: { url: publicPath("models/hands/hand_right.glb"), enabled: false, scale: 1 }
});
