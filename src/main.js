import { Game } from "./core/Game.js";

const game = new Game(document.querySelector("#scene-container"));
game.init().catch((error) => {
  console.error(error);
  document.querySelector("#status").textContent = "Impossible de démarrer le jeu. Consultez la console.";
});
