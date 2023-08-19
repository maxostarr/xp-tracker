import { XPTracker } from "./xp-tracker.js";

export class EditCharacterFormApplication extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["xp-tracker"],
      template: XPTracker.TEMPLATES.EDIT_CHARACTER_FORM,
      width: 400,
      height: 400,
      resizable: true,
      minimizable: true,
      title: "Edit Character",
    });
  }

  async getData() {
    const { name, xp } = this.object;
    return {
      name,
      xp,
    };
  }

  async _updateObject(event, formData) {
    const character = {
      name: formData.name,
      xp: parseInt(formData.xp),
      id: this.object.id,
    };
    await this.options.trackerInstance.editCharacter(this.object.id, character);
    this.options.trackerInstance.render();
  }
}
