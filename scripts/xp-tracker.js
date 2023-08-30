import { DOCUMENT_NAME, ID } from "./constants.js"
import { XPTrackerSettings } from "./settings.js"
import { AddCharacterFormApplication } from "./add-character.js"
import { ChangeSummaryDialog } from "./change-summary.js"
import { EditCharacterFormApplication } from "./edit-character.js"
import { RewardXPFormApplication } from "./reward-xp.js"
import { SettingsForm } from "./settings-form.js"

class XPTrackerData {
  isInitialized = false
  journalEntry = null

  async initialize(initialData = []) {
    if (this.isInitialized) {
      return
    }

    this.isInitialized = true

    this.journalEntry = await this._createOrGetJournalEntry(initialData)
    this.journalEntryId = this.journalEntry.id

    XPTracker.log(true, "Journal Entry ID:", this.journalEntryId)
  }

  async _createOrGetJournalEntry(initialData) {
    // Check if journal entry exists
    // If not, create it
    // Return journal entry id
    const maybeJournalEntry = game.journal.directory.documents.find(
      (journalEntry) => journalEntry.name === XPTracker.DOCUMENT_NAME,
    )

    if (maybeJournalEntry) {
      return maybeJournalEntry
    }

    return await JournalEntry.create({
      name: XPTracker.DOCUMENT_NAME,
      content: JSON.stringify(initialData),
      visible: false,
    })
  }

  async _updateJournalEntry(data) {
    const firstPageId = this.journalEntry.pages.toJSON()[0]._id
    const firstPage = this.journalEntry.pages.get(firstPageId)
    await firstPage.update({
      text: {
        content: JSON.stringify(data),
      },
    })
  }

  getJournalEntryData() {
    const journalDataRaw = this.journalEntry.pages.toJSON()[0].text.content
    const journalData = JSON.parse(journalDataRaw)
    return journalData
  }

  async addCharacter(character) {
    const journalData = this.getJournalEntryData()
    journalData.push(character)
    await this._updateJournalEntry(journalData)
  }

  async deleteCharacter(characterId) {
    const journalData = this.getJournalEntryData()
    const characterIndex = journalData.findIndex(
      (character) => character.id === characterId,
    )
    journalData.splice(characterIndex, 1)
    await this._updateJournalEntry(journalData)
  }

  async editCharacter(characterId, newCharacter) {
    const journalData = this.getJournalEntryData()
    const characterIndex = journalData.findIndex(
      (character) => character.id === characterId,
    )
    journalData[characterIndex] = newCharacter
    await this._updateJournalEntry(journalData)
  }
}

export class XPTracker {
  static ID = ID
  static DOCUMENT_NAME = DOCUMENT_NAME

  static TEMPLATES = {
    DEFAULT: `modules/${this.ID}/templates/xp-tracker.html`,
    ADD_CHARACTER_FORM: `modules/${this.ID}/templates/add-character.html`,
    REWARD_XP_FORM: `modules/${this.ID}/templates/reward-xp.html`,
    EDIT_CHARACTER_FORM: `modules/${this.ID}/templates/edit-character.html`,
    CHANGE_SUMMARY_DIALOG: `modules/${this.ID}/templates/change-summary.html`,
    SETTINGS_FORM: `modules/${this.ID}/templates/settings-form.html`,
  }

  getSceneControlButtons(sceneControlButtons) {
    console.log(sceneControlButtons)

    const notesButton = sceneControlButtons.find(
      (button) => button.name === "notes",
    )

    notesButton.tools.push({
      name: "xp-tracker",
      title: "XP Tracker",
      icon: "fas fa-chart-line",
      visible: true,
      onClick: () => {
        this.application.render(true, {
          focus: true,
        })
      },
    })
  }

  static log(force, ...args) {
    const shouldLog =
      force || game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.ID)

    if (shouldLog) {
      console.log(this.ID, "|", ...args)
    }
  }

  /**
   * @typedef {Object} Character
   * @property {string} name
   * @property {number} xp
   */

  constructor() {
    this.data = new XPTrackerData()
    this.rounding = Math.floor
    this.sortBy = "default"
    this.sortOrder = "asc"
  }

  async initialize(initialData = []) {
    await this.data.initialize(initialData)

    this.settings = new XPTrackerSettings(this)

    this.application = new XPTrackerApplication({
      data: this.data,
      trackerInstance: this,
    })

    Hooks.on(
      "getSceneControlButtons",
      this.getSceneControlButtons.bind(this),
    )
    
  }

  async addCharacter(character) {
    await this.data.addCharacter({ ...character, id: crypto.randomUUID() })
  }

  async editCharacter(characterId, newCharacter) {
    const changes = []
    const journalData = this.data.getJournalEntryData()
    const character = journalData.find(
      (character) => character.id === characterId,
    )
    if (character.name !== newCharacter.name) {
      changes.push({
        property: "Name",
        old: character.name,
        new: newCharacter.name,
      })
    }

    if (character.xp !== newCharacter.xp) {
      changes.push({
        property: "XP",
        old: character.xp,
        new: newCharacter.xp,
      })
    }

    new ChangeSummaryDialog([
      {
        name: character.name,
        changes,
      },
    ]).render(true, {
      focus: true,
    })

    await this.data.editCharacter(characterId, newCharacter)
  }

  showNewCharacterForm() {
    new AddCharacterFormApplication(
      {},
      {
        trackerInstance: this,
      },
    ).render(true, {
      focus: true,
    })
  }

  showRewardXPForm() {
    new RewardXPFormApplication(
      {},
      {
        trackerInstance: this,
      },
    ).render(true, {
      focus: true,
    })
  }

  showSettingsForm() {
    new SettingsForm(
      {},
      {
        trackerInstance: this,
      },
    ).render(true, {
      focus: true,
    })
  }

  setSortBy(sortBy) {
    if (sortBy === this.sortBy) {
      if (this.sortOrder === "desc") {
        this.sortBy = "default"
        this.application.render()
        return
      }

      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc"
    } else {
      this.sortOrder = "asc"
    }

    this.sortBy = sortBy
    this.application.render()
  }

  showEditCharacterForm(characterId) {
    const character = this.data
      .getJournalEntryData()
      .find((character) => character.id === characterId)
    new EditCharacterFormApplication(character, {
      trackerInstance: this,
    }).render(true, {
      focus: true,
    })
  }

  async rewardXp(xp, characters) {
    const journalData = this.data.getJournalEntryData()
    const changes = []
    journalData.forEach((character) => {
      if (!characters || characters.includes(character.id)) {
        changes.push({
          name: character.name,
          changes: [
            {
              property: "XP",
              old: character.xp,
              new: character.xp + xp,
            },
          ],
        })
        character.xp += xp
      }
    })

    new ChangeSummaryDialog(changes).render(true, {
      focus: true,
    })

    await this.data._updateJournalEntry(journalData)
  }

  render() {
    this.application.render(true)
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
      popOut: true,
      title: "XP Tracker",
    })
  }

  _getHeaderButtons() {
    return [
      {
        label: "",
        class: "minimize",
        icon: "far fa-window-minimize",
        onclick: function () {
          if (this._minimized) this.maximize()
          else {
            this.minimize()
            //* Dirty hack to prevent "double minimize" after rapidly double-clicking on the minimize button
            var _bkpMinimize = this.minimize
            this.minimize = () => {}
            setTimeout(() => {
              this.minimize = _bkpMinimize
            }, 200)
          }
        }.bind(this),
      },
      {
        label: "",
        class: "settings",
        icon: "fas fa-cog",
        onclick: () => this.options.trackerInstance.showSettingsForm(),
      },
      {
        label: "",
        class: "close",
        icon: "fas fa-times",
        onclick: () => this.close(),
      },
    ]
  }

  getData() {
    const journalData = this.options.data.getJournalEntryData()

    const sortingFunctions = {
      default: () => {},
      name: (a, b) => a.name.localeCompare(b.name),
      xp: (a, b) => b.xp - a.xp,
    }

    journalData.sort((a, b) => {
      return sortingFunctions[this.options.trackerInstance.sortBy](a, b)
    })

    if (this.options.trackerInstance.sortOrder === "desc") {
      journalData.reverse()
    }

    return {
      sortBy: this.options.trackerInstance.sortBy,
      sortOrder: this.options.trackerInstance.sortOrder,
      characters: journalData.map((character) => {
        return {
          ...character,
          xp: Number(character.xp).toLocaleString(),
          level: this.options.trackerInstance.settings.xpTierScheme.getLevel(
            character.xp,
          ),
          nextLevelXp: Number(
            this.options.trackerInstance.settings.xpTierScheme.getNextLevelXp(
              character.xp,
            ),
          ).toLocaleString(),
        }
      }),
    }
  }

  activateListeners(html) {
    super.activateListeners(html)

    const addCharacterButton = html.find("#add-character")
    addCharacterButton.on("click", () => {
      this.options.trackerInstance.showNewCharacterForm()
    })

    const rewardXpButton = html.find("#reward-xp")
    rewardXpButton.on("click", () => {
      // const xp = Number(html.find("#xp-amount").val());
      // const xp = 200;
      // await this.options.trackerInstance.rewardXp(xp);
      // this.render();
      this.options.trackerInstance.showRewardXPForm()
    })

    html.on("click", "#delete-character", async (event) => {
      const characterId =
        event.currentTarget.parentElement.parentElement.dataset.id
      const characterName =
        event.currentTarget.parentElement.parentElement.dataset.name
      const confirmed = await Dialog.confirm({
        title: "Delete Character",
        content: `Are you sure you want to delete ${characterName}?`,
        yes: () => true,
        no: () => false,
        defaultYes: false,
      })
      if (!confirmed) {
        return
      }
      await this.options.data.deleteCharacter(characterId)
      this.render()
    })

    html.on("click", "#edit-character", (event) => {
      const characterId =
        event.currentTarget.parentElement.parentElement.dataset.id
      this.options.trackerInstance.showEditCharacterForm(characterId)
    })

    html.on("click", "#sort-by", (event) => {
      const sortBy = event.currentTarget.dataset.sortType
      this.options.trackerInstance.setSortBy(sortBy)
    })
  }
}

Hooks.once("ready", async function () {
  const xpTracker = new XPTracker()

  await xpTracker.initialize()

  xpTracker.settings.showOnStartup && xpTracker.render(true)
})

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(XPTracker.ID)
})

