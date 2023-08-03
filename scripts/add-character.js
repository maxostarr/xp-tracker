import { XPTracker } from "./xp-tracker.js";

export class AddCharacterFormApplication extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["xp-tracker"],
      template: XPTracker.TEMPLATES.ADD_CHARACTER_FORM,
      width: 400,
      height: 250,
      resizable: true,
      minimizable: true,
      title: "Add Character",
    });
  }

  async _updateObject(event, formData) {
    const xp =
      formData["starting-at"] === "xp"
        ? parseInt(formData["starting-value"])
        : this.options.trackerInstance.xpTierScheme.getStartingXpForLevel(
            parseInt(formData["starting-value"]),
          );

    const character = {
      name: formData.name,
      xp,
      id: crypto.randomUUID(),
    };
    await this.options.trackerInstance.addCharacter(character);
    this.options.trackerInstance.render();
  }
}
