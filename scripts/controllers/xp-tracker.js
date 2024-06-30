import { TEMPLATES } from "../model/constants.js"

export class XPTrackerApplication extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["xp-tracker"],
      template: TEMPLATES.DEFAULT,
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
      game.user.isGM && {
        label: "",
        class: "settings",
        icon: "fas fa-cog",
        onclick: () => this.options.trackerInstance.showSettingsForm(),
      },
      game.user.isGM && {
        label: "",
        class: "import-export",
        icon: "fas fa-file-import",
        onclick: () => this.options.trackerInstance.showImportExportForm(),
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
      isGM: game.user.isGM,
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
