import { ID } from "./constants.js";
import { XP_TIER_SCHEMES } from "./xp-tier-schema.js";

export class XPTrackerSettings {
  static ROUNDING_OPTIONS = {
    FLOOR: {
      name: "Floor",
      function: Math.floor,
    },
    ROUND: {
      name: "Round",
      function: Math.round,
    },
    CEIL: {
      name: "Up",
      function: Math.ceil,
    },
  };

  static XP_TIER_SCHEMES = XP_TIER_SCHEMES;

  static XP_TIER_SCHEME = {
    id: "xpTierScheme",
    name: "XP Tier Scheme",
    default: Object.keys(XP_TIER_SCHEMES)[0],
    type: String,
    choices: Object.keys(XP_TIER_SCHEMES).reduce((acc, key) => {
      acc[key] = XP_TIER_SCHEMES[key].name;
      return acc;
    }, {}),
  };

  static ROUNDING = {
    id: "rounding",
    name: "Rounding",
    default: this.ROUNDING_OPTIONS.ROUND,
    type: String,
    choices: Object.keys(this.ROUNDING_OPTIONS).reduce((acc, key) => {
      acc[key] = this.ROUNDING_OPTIONS[key].name;
      return acc;
    }, {}),
  };
  constructor(trackerInstance) {
    this.trackerInstance = trackerInstance;
    const settings = [
      XPTrackerSettings.XP_TIER_SCHEME,
      XPTrackerSettings.ROUNDING,
    ];

    settings.forEach((setting) => {
      console.log("Registering: ", setting);
      game.settings.register(ID, setting.id, {
        name: `XP Tracker ${setting.name}`,
        hint: `XP Tracker ${setting.name}`,
        scope: "world",
        config: true,
        default: setting.default,
        type: setting.type,
        choices: setting.choices,
        onChange: (value) => {
          console.log("onChange: ", setting.name, value);
          this.trackerInstance[setting.id] = value;
          this.trackerInstance.application.render();
        },
      });
    });
  }

  get xpTierScheme() {
    return XPTrackerSettings.XP_TIER_SCHEMES[
      game.settings.get(ID, XPTrackerSettings.XP_TIER_SCHEME.id)
    ];
  }

  get rounding() {
    return XPTrackerSettings.ROUNDING_OPTIONS[
      game.settings.get(ID, XPTrackerSettings.ROUNDING.id)
    ].function;
  }
}
