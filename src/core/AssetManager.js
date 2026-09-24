import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import { ASSET_MANIFEST } from "./AssetManifest.js";
import { publicPath } from "./Paths.js";

export class AssetManager {
  constructor() {
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader().setDecoderPath(publicPath("decoders/draco/"));
    this.ktx2Loader = new KTX2Loader().setTranscoderPath(publicPath("decoders/basis/"));
    this.loader.setDRACOLoader(this.dracoLoader);
    this.cache = new Map();
    this.failures = new Set();
    this.manifest = new Map(Object.entries(ASSET_MANIFEST));
  }
  configureRenderer(renderer) {
    this.ktx2Loader.detectSupport(renderer);
    this.loader.setKTX2Loader(this.ktx2Loader);
    return this;
  }
  register(id, configOrUrl, placeholderFactory = null) {
    const config = typeof configOrUrl === "string" ? { url: configOrUrl, enabled: true, placeholderFactory } : configOrUrl;
    this.manifest.set(id, config);
    return this;
  }
  hasEnabledAsset(id) { return this.manifest.get(id)?.enabled === true; }
  async loadGLTF(id, url = this.manifest.get(id)?.url) {
    if (!url) throw new Error(`Aucune URL GLB configurée pour « ${id} »`);
    if (!this.cache.has(url)) this.cache.set(url, this.loader.loadAsync(url));
    return this.cache.get(url);
  }
  async instantiate(id, { fallback = null, silent = true } = {}) {
    const config = this.manifest.get(id);
    if (!config) throw new Error(`Asset inconnu : ${id}`);
    if (!config.enabled) return fallback?.() ?? null;
    try {
      const gltf = await this.loadGLTF(id, config.url);
      const model = cloneSkeleton(gltf.scene);
      model.scale.setScalar(config.scale ?? 1);
      if (config.rotation) model.rotation.set(...config.rotation);
      if (config.position) model.position.set(...config.position);
      model.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = config.castShadow ?? true;
        child.receiveShadow = config.receiveShadow ?? true;
        child.frustumCulled = true;
      });
      return { model, animations: gltf.animations, config };
    } catch (error) {
      if (!silent && !this.failures.has(id)) console.warn(`GLB indisponible pour « ${id} » :`, error);
      this.failures.add(id);
      return fallback?.() ?? null;
    }
  }
  async modelOrPlaceholder(id, placeholderFactory) {
    const asset = await this.instantiate(id, { fallback: () => ({ model: placeholderFactory(), animations: [] }) });
    return asset?.model ?? placeholderFactory();
  }
  dispose() { this.dracoLoader.dispose(); this.ktx2Loader.dispose(); this.cache.clear(); }
}
