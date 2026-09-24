# À Tavula VR

Prototype de cuisine corse en WebXR, optimisé pour les contrôleurs Meta Quest. Le mode écran sert au développement, mais toutes les actions de jeu fonctionnent indépendamment avec les contrôleurs en session immersive.

La simulation utilise `@dimforge/rapier3d-compat` : le décor possède des colliders fixes et les ingrédients des corps rigides dynamiques. Pendant une prise, un objet passe en mode cinématique puis redevient dynamique au lâcher. Les objets tombés sous la scène sont automatiquement replacés à leur point d’origine.

## Développement sur ordinateur

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:5173`. À la souris, cliquer-glisser un objet pour simuler sa manipulation.

## Tester avec un Meta Quest

WebXR exige un contexte sécurisé : HTTPS, ou `localhost` lorsque le navigateur et le serveur sont sur le même appareil.

1. Construire le projet avec `npm run build`.
2. Héberger le dossier `dist/` sur un hébergement HTTPS (Cloudflare Pages, Netlify, Vercel ou équivalent).
3. Ouvrir l’URL HTTPS dans Meta Quest Browser.
4. Appuyer sur **ENTRER EN VR** et autoriser l’accès WebXR.
5. Utiliser la gâchette des contrôleurs pour pointer, saisir et relâcher.

Pour exposer Vite sur le réseau local :

```bash
npm run dev:quest
```

L’adresse LAN seule n’est généralement pas considérée comme sécurisée par WebXR. Utiliser un certificat HTTPS approuvé ou un tunnel HTTPS pour tester directement depuis le casque.

## Remplacer les placeholders

`AssetManager.loadModel()` charge les GLB. Les futurs fichiers sont classés dans :

- `public/models/environment/`
- `public/models/ingredients/`
- `public/models/tools/`
- `public/models/characters/`
- `public/models/hands/`
- `public/models/food/`

La recette se trouve dans `src/recipes/FiadoneRecipe.js`, et son comportement dans `src/recipes/RecipeManager.js`.

Les placeholders visuels remplaçables sont isolés dans `src/objects/placeholders/`. Les formes de collision se règlent dans `KitchenScene.registerPhysics()`.
