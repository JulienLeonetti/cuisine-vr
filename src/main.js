import { Game } from "./core/Game.js";

const game = new Game(document.querySelector("#scene-container"));
game.init().catch((error) => {
  console.error("Échec de l'initialisation du jeu :", error);
  document.querySelector("#status").textContent = "Le décor est affiché, mais un système du jeu n’a pas pu démarrer. Consultez la console.";
});
