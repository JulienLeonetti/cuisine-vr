import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class AssetManager {
  constructor() { this.loader = new GLTFLoader(); this.cache = new Map(); }
  async loadModel(url) {
    if (!this.cache.has(url)) this.cache.set(url, this.loader.loadAsync(url));
    const gltf = await this.cache.get(url);
    return gltf.scene.clone(true);
  }
  async modelOrPlaceholder(url, placeholderFactory) {
    try { return await this.loadModel(url); } catch { return placeholderFactory(); }
  }
}
