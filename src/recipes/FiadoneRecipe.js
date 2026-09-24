import { Recipe } from "./Recipe.js";
export class FiadoneRecipe extends Recipe {
  constructor() {
    super({ id: "fiadone", name: "Fiadone", steps: [
      { id: "take-eggs", instruction: "Repérez et prenez les 3 œufs", detail: "Prenez chaque œuf avec la gâchette." },
      { id: "crack-eggs", instruction: "Cassez les œufs sur le saladier", detail: "Frappez puis relâchez chaque œuf près du bord." },
      { id: "brocciu", instruction: "Ajoutez le brocciu", detail: "Déposez le récipient dans le saladier." },
      { id: "sugar", instruction: "Ajoutez le sucre", detail: "Versez le pot dans le saladier." },
      { id: "lemon", instruction: "Ajoutez le citron", detail: "Pressez-le au-dessus du saladier." },
      { id: "mix", instruction: "Fouettez la préparation", detail: "Bougez et tournez le fouet dans le saladier." },
      { id: "pour", instruction: "Versez dans le moule", detail: "Amenez le saladier au-dessus du moule." },
      { id: "oven", instruction: "Enfournez le moule", detail: "Posez le moule dans le four ouvert à droite." },
      { id: "cook", instruction: "Laissez cuire le fiadone", detail: "La minuterie est accélérée." },
      { id: "serve", instruction: "Servez le fiadone", detail: "Posez le moule sur l’assiette dorée." }
    ]});
  }
}
