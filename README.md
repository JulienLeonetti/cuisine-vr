# À Tavula VR

Petit jeu de cuisine corse en Three.js, JavaScript, Vite, WebXR et Rapier. La première commande jouable est un fiadone : casser trois œufs, ajouter les ingrédients, fouetter, verser, cuire puis servir Marcel.

## Lancer le projet

```bash
npm install
npm run dev
```

Le mode écran permet de cliquer-glisser les objets. Pour un Meta Quest, construisez avec `npm run build`, hébergez `dist/` en HTTPS, ouvrez l’URL dans Meta Quest Browser puis choisissez **ENTRER EN VR**. `npm run dev:quest` expose aussi Vite sur le réseau local, mais WebXR nécessite toujours un contexte sécurisé.

## Architecture de jeu

- `src/core/AssetManager.js` : chargement, cache et clonage GLB, Draco et KTX2.
- `src/core/AssetManifest.js` : chemins, activation et échelle de chaque asset final.
- `src/core/PhysicsManager.js` : Rapier à pas fixe, CCD, prises cinématiques et lâchers sûrs.
- `src/interactions/` : systèmes séparés pour les œufs, le mélange, le versement, la cuisson et le service.
- `src/objects/Food.js` : états visuels de la préparation crue et du fiadone cuit.
- `src/placeholders/` : visuels provisoires, indépendants du gameplay.

La prise VR combine un rayon court et une prise de proximité. Les modèles visuels sont enfants de slots physiques stables : remplacer un placeholder par un GLB ne change ni les identifiants de recette ni les colliders.

## Ajouter les vrais GLB

Déposez le fichier au chemin indiqué, puis passez son entrée à `enabled: true` dans `src/core/AssetManifest.js`. Les modèles sont mis en cache et clonés, tandis que les animations squelettiques utilisent `SkeletonUtils`.

Assets GLB encore à fournir :

| Élément | Chemin attendu |
|---|---|
| Client riggé, clips `idle`, `talk`, `happy`, `leave` | `public/models/characters/customer.glb` |
| Comptoir final | `public/models/kitchen/counter.glb` |
| Four final | `public/models/kitchen/oven.glb` |
| Saladier | `public/models/kitchen/bowl.glb` |
| Œuf | `public/models/ingredients/egg.glb` |
| Citron | `public/models/ingredients/lemon.glb` |
| Brocciu et récipient | `public/models/ingredients/brocciu.glb` |
| Pot de sucre | `public/models/ingredients/sugar-pot.glb` |
| Fouet | `public/models/tools/whisk.glb` |
| Moule | `public/models/tools/baking-pan.glb` |
| Préparation crue | `public/models/food/fiadone-raw.glb` |
| Fiadone cuit | `public/models/food/fiadone-baked.glb` |
| Place corse compacte | `public/models/buildings/corsican-village.glb` |
| Décor de cuisine | `public/models/decorations/kitchen-decor.glb` |
| Main gauche riggée | `public/models/hands/hand_left.glb` |
| Main droite riggée | `public/models/hands/hand_right.glb` |

Les fichiers Draco doivent être placés dans `public/decoders/draco/` et les transcodeurs Basis/KTX2 dans `public/decoders/basis/`. Les textures optimisées vont dans `public/textures/` (512 ou 1024 px dans la plupart des cas).

## Audio

L’infrastructure accepte des sons globaux et positionnels. Les chemins prévus sont déclarés dans `AUDIO_MANIFEST` dans `src/core/AudioManager.js` : ambiance village, vent, oiseaux, œuf, fouet, versement, four et validation. En l’absence de fichiers audio, des sons synthétiques légers assurent le feedback.

## Vérifications

```bash
npm run build
npm run test:physics
```

La suite physique couvre les chutes, projections rapides, lâchers au bord du comptoir et prises répétées. Les colliders sont invisibles par défaut. Pour les afficher explicitement :

```text
http://localhost:5173/?physicsDebug=1
```

Le commutateur global se trouve dans `src/core/DebugConfig.js` et reste à `false` pour la version normale.
