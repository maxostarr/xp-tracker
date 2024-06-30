import { XPTrackerSettings } from "./model/settings.js"
import { AddCharacterFormApplication } from "./controllers/add-character.js"
import { ChangeSummaryDialog } from "./controllers/change-summary.js"
import { EditCharacterFormApplication } from "./controllers/edit-character.js"
import { RewardXPFormApplication } from "./controllers/reward-xp.js"
import { SettingsForm } from "./controllers/settings-form.js"
import { XPTrackerApplication } from "./controllers/xp-tracker.js"
import { XPTrackerData } from "./model/data.js"
import { ImportExportFormApplication } from "./controllers/import-export-form.js"

export class XPTracker {
  getSceneControlButtons(sceneControlButtons) {
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

    Hooks.on("getSceneControlButtons", this.getSceneControlButtons.bind(this))
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

  showImportExportForm() {
    new ImportExportFormApplication(
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

Hooks.once("ready", async function () {
  const xpTracker = new XPTracker()

  await xpTracker.initialize()

  xpTracker.settings.showOnStartup && xpTracker.render(true)
})

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(XPTracker.ID)
})
