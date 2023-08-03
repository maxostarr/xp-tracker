import { AddCharacterFormApplication } from "./add-character.js";
import { XPTierScheme, XP_TIER_SCHEMES } from "./xp-tier-schema.js";

class XPTrackerData {
  isInitialized = false;
  journalEntry = null;

  async initialize(initialData = []) {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    this.journalEntry = await this._createOrGetJournalEntry(initialData);
    this.journalEntryId = this.journalEntry.id;

    XPTracker.log(true, "Journal Entry ID:", this.journalEntryId);
  }

  async _createOrGetJournalEntry(initialData) {
    // Check if journal entry exists
    // If not, create it
    // Return journal entry id
    const maybeJournalEntry = game.journal.directory.documents.find(
      (journalEntry) => journalEntry.name === XPTracker.DOCUMENT_NAME,
    );

    if (maybeJournalEntry) {
      return maybeJournalEntry;
    }

    return await JournalEntry.create({
      name: XPTracker.DOCUMENT_NAME,
      content: JSON.stringify(initialData),
      visible: false,
    });
  }

  async _updateJournalEntry(data) {
    const firstPageId = this.journalEntry.pages.toJSON()[0]._id;
    const firstPage = this.journalEntry.pages.get(firstPageId);
    await firstPage.update({
      text: {
        content: JSON.stringify(data),
      },
    });
  }

  getJournalEntryData() {
    const journalDataRaw = this.journalEntry.pages.toJSON()[0].text.content;
    const journalData = JSON.parse(journalDataRaw);
    return journalData;
  }

  async addCharacter(character) {
    const journalData = this.getJournalEntryData();
    journalData.push(character);
    await this._updateJournalEntry(journalData);
  }

  async deleteCharacter(characterId) {
    const journalData = this.getJournalEntryData();
    const characterIndex = journalData.findIndex(
      (character) => character.id === characterId,
    );
    journalData.splice(characterIndex, 1);
    await this._updateJournalEntry(journalData);
  }
}

export class XPTracker {
  static ID = "xp-tracker";
  static DOCUMENT_NAME = "XP Tracker";

  static TEMPLATES = {
    DEFAULT: `modules/${this.ID}/templates/xp-tracker.html`,
    ADD_CHARACTER_FORM: `modules/${this.ID}/templates/add-character.html`,
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
   */
  constructor(xpTierScheme = XP_TIER_SCHEMES.PF1E) {
    this.xpTierScheme = xpTierScheme;
    this.data = new XPTrackerData();
  }

  async initialize(initialData = []) {
    await this.data.initialize(initialData);
    this.application = new XPTrackerApplication({
      data: this.data,
      xpTierScheme: this.xpTierScheme,
      trackerInstance: this,
    });
    this.addCharacterFormApplication = new AddCharacterFormApplication(
      {},
      {
        trackerInstance: this,
      },
    );
  }

  async addCharacter(character) {
    await this.data.addCharacter({ ...character, id: crypto.randomUUID() });
  }

  async showNewCharacterForm() {
    this.addCharacterFormApplication.render(true);
  }

  async rewardXp(xp) {
    const journalData = this.data.getJournalEntryData();
    journalData.forEach((character) => {
      character.xp += xp;
    });
    await this.data._updateJournalEntry(journalData);
  }

  render() {
    this.application.render(true);
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
    const journalData = this.options.data.getJournalEntryData();

    return {
      characters: journalData.map((character) => {
        return {
          ...character,
          xp: Number(character.xp).toLocaleString(),
          level: this.options.xpTierScheme.getLevel(character.xp),
          nextLevelXp: Number(
            this.options.xpTierScheme.getNextLevelXp(character.xp),
          ).toLocaleString(),
        };
      }),
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    const addCharacterButton = html.find("#add-character");
    addCharacterButton.on("click", async () => {
      await this.options.trackerInstance.showNewCharacterForm();
    });

    const rewardXpButton = html.find("#reward-xp");
    rewardXpButton.on("click", async () => {
      // const xp = Number(html.find("#xp-amount").val());
      const xp = 200;
      await this.options.trackerInstance.rewardXp(xp);
      this.render();
    });

    html.on("click", "#delete-character", async (event) => {
      const characterId =
        event.currentTarget.parentElement.parentElement.dataset.id;
      const characterName =
        event.currentTarget.parentElement.parentElement.dataset.name;
      const confirmed = await Dialog.confirm({
        title: "Delete Character",
        content: `Are you sure you want to delete ${characterName}?`,
        yes: () => true,
        no: () => false,
        defaultYes: false,
      });
      if (!confirmed) {
        return;
      }
      await this.options.data.deleteCharacter(characterId);
      this.render();
    });
  }
}

Hooks.once("ready", async function () {
  const testData = [
    {
      name: "Character 1",
      xp: 1000,
      id: crypto.randomUUID(),
    },
    {
      name: "Character 2",
      xp: 2000,
      id: crypto.randomUUID(),
    },
    {
      name: "Character 3",
      xp: 3000,
      id: crypto.randomUUID(),
    },
    {
      name: "Zero",
      xp: 0,
      id: crypto.randomUUID(),
    },
  ];
  const xpTracker = new XPTracker();

  await xpTracker.initialize(testData);

  xpTracker.render(true);
});

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(XPTracker.ID);
});
