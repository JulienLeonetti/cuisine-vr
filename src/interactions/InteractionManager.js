export class InteractionManager extends EventTarget {
  constructor(grabManager) {
    super(); this.grabManager = grabManager;
    grabManager.addEventListener("grabstart", (event) => this.dispatchEvent(new CustomEvent("grabstart", { detail: event.detail })));
    grabManager.addEventListener("grabend", (event) => this.dispatchEvent(new CustomEvent("grabend", { detail: event.detail })));
  }
}
