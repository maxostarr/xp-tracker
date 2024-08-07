import { XPTrackerSettings } from "../model/settings.js"
import { TEMPLATES } from "../model/constants.js"

export class SettingsForm extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["xp-tracker"],
      template: TEMPLATES.SETTINGS_FORM,
      width: 400,
      height: 400,
      resizable: true,
      minimizable: true,
      title: "Settings",
    })
  }

  getData() {
    const selectedXpTierScheme =
      this.options.trackerInstance.settings.xpTierScheme
    const xpTierSchemeOptions = Object.entries(
      XPTrackerSettings.XP_TIER_SCHEME.choices,
    ).map(([key, value]) => {
      return {
        key,
        value,
        selected: value === selectedXpTierScheme.name,
      }
    })

    const selectedRounding = this.options.trackerInstance.settings.rounding
    const roundingOptions = Object.entries(
      XPTrackerSettings.ROUNDING.choices,
    ).map(([key, value]) => {
      return {
        key,
        value,
        selected: value === selectedRounding,
      }
    })

    const showOnStartup = this.options.trackerInstance.settings.showOnStartup

    return { xpTierSchemeOptions, roundingOptions, showOnStartup }
  }

  _updateObject(event, formData) {
    this.options.trackerInstance.settings.xpTierScheme =
      formData["xpTierScheme"]
    this.options.trackerInstance.settings.rounding = formData["rounding"]
    this.options.trackerInstance.settings.showOnStartup =
      formData["showOnStartup"]
  }
}
