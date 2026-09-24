import { Recipe } from "./Recipe.js";
export class FiadoneRecipe extends Recipe {
  constructor() {
    super({ id: "fiadone", name: "Fiadone", steps: [
      { id: "take-eggs", instruction: "Prenez les 3 œufs", detail: "Saisissez chaque œuf avec la gâchette." },
      { id: "crack-eggs", instruction: "Cassez les œufs dans le saladier", detail: "0 / 3 œufs" },
      { id: "brocciu", instruction: "Ajoutez le brocciu", detail: "Déposez le pot dans le saladier." },
      { id: "sugar", instruction: "Ajoutez le sucre", detail: "Déposez le sucre dans le saladier." },
      { id: "lemon", instruction: "Ajoutez le citron", detail: "Pressez-le au-dessus du saladier." },
      { id: "take-whisk", instruction: "Prenez le fouet", detail: "Gâchette pour le saisir." },
      { id: "mix", instruction: "Mélangez la préparation", detail: "Progression : 0 %" },
      { id: "pour", instruction: "Versez dans le moule", detail: "Approchez le saladier du moule." },
      { id: "oven", instruction: "Mettez le moule au four", detail: "Placez-le dans la zone du four." },
      { id: "cook", instruction: "Cuisson…", detail: "Encore 5 secondes" },
      { id: "remove", instruction: "Sortez le fiadone", detail: "Prenez le moule cuit." },
      { id: "serve", instruction: "Servez le client", detail: "Posez le fiadone sur le cercle doré." }
    ]});
  }
}
