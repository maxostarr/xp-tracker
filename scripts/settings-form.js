import { XPTrackerSettings } from "./settings.js";
import { XPTracker } from "./xp-tracker.js";

export class SettingsForm extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["xp-tracker"],
      template: XPTracker.TEMPLATES.SETTINGS_FORM,
      width: 400,
      height: 400,
      resizable: true,
      minimizable: true,
      title: "Settings",
    });
  }

  getData() {
    const selectedXpTierScheme =
      this.options.trackerInstance.settings.xpTierScheme;
    console.log(
      "🚀 ~ file: settings-form.js:19 ~ SettingsForm ~ getData ~ selectedXpTierScheme:",
      selectedXpTierScheme,
    );
    const xpTierSchemeOptions = Object.entries(
      XPTrackerSettings.XP_TIER_SCHEME.choices,
    ).map(([key, value]) => {
      console.log(
        "🚀 ~ file: settings-form.js:27 ~ SettingsForm ~ ).map ~ key, value:",
        key,
        value,
      );
      return {
        key,
        value,
        selected: value === selectedXpTierScheme.name,
      };
    });

    const selectedRounding = this.options.trackerInstance.settings.rounding;
    const roundingOptions = Object.entries(
      XPTrackerSettings.ROUNDING.choices,
    ).map(([key, value]) => {
      return {
        key,
        value,
        selected: value === selectedRounding,
      };
    });

    return { xpTierSchemeOptions, roundingOptions };
  }

  _updateObject(event, formData) {
    this.options.trackerInstance.settings.xpTierScheme =
      formData["xpTierScheme"];
    this.options.trackerInstance.settings.rounding = formData["rounding"];
  }
}