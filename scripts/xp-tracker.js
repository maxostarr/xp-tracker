import { XPTierScheme, XP_TIER_SCHEMES } from "./xp-tier-schema.js";

class XPTrackerData {
  isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    this.journalEntryId = await this._createOrGetJournalEntry();

    XPTracker.log(true, "Journal Entry ID:", this.journalEntryId);
  }

  async _createOrGetJournalEntry() {
    // Check if journal entry exists
    // If not, create it
    // Return journal entry id
    const maybeJournalEntry = game.journal.directory.documents.find(
      (journalEntry) => journalEntry.name === XPTracker.DOCUMENT_NAME,
    );

    if (maybeJournalEntry) {
      return maybeJournalEntry.id;
    }

    return (
      await JournalEntry.create({
        name: XPTracker.DOCUMENT_NAME,
        content: "",
        visible: false,
      })
    ).id;
  }
}

class XPTracker {
  static ID = "xp-tracker";
  static DOCUMENT_NAME = "XP Tracker";

  static TEMPLATES = {
    DEFAULT: `modules/${this.ID}/templates/xp-tracker.html`,
  };

  static log(force, ...args) {
    const shouldLog =
      force ||
      game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.ID);

    if (shouldLog) {
      console.log(this.ID, "|", ...args);
    }
  }

  /**
   * @typedef {Object} Character
   * @property {string} name
   * @property {number} xp
   */

  /**
   * @param {XPTierScheme} xpTierScheme
   * @param {Character[]} characters
   */
  constructor(characters = [], xpTierScheme = XP_TIER_SCHEMES.PF1E) {
    this.xpTierScheme = xpTierScheme;
    this.characters = characters;
    this.application = new XPTrackerApplication();
    this.data = new XPTrackerData();
  }

  async initialize() {
    await this.data.initialize();
  }

  addCharacter(character) {
    this.characters.push(character);
  }

  render() {
    this.application.render({
      renderData: {
        characters: this.characters,
        xpTierScheme: this.xpTierScheme,
      },
    });
  }
}

class XPTrackerApplication extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["xp-tracker"],
      template: XPTracker.TEMPLATES.DEFAULT,
      width: 400,
      height: 400,
      resizable: true,
      minimizable: true,
      title: "XP Tracker",
    });
  }

  getData() {
    return {
      characters: this.renderData.characters.map((character) => {
        return {
          ...character,
          level: this.renderData.xpTierScheme.getLevel(character.xp),
          nextLevelXp: this.renderData.xpTierScheme.getNextLevelXp(
            character.xp,
          ),
        };
      }),
    };
  }
}

Hooks.on("ready", async function () {
  console.log(
    "This code runs once core initialization is ready and game data is available.",
  );

  const xpTracker = new XPTracker([
    {
      name: "Character 1",
      xp: 1000,
    },
    {
      name: "Character 2",
      xp: 2000,
    },
    {
      name: "Character 3",
      xp: 3000,
    },
    {
      name: "Zero",
      xp: 0,
    },
  ]);

  await xpTracker.initialize();

  xpTracker.render(true);
});

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(XPTracker.ID);
});
