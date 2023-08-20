import { XPTracker } from "./xp-tracker.js";

export class RewardXPFormApplication extends FormApplication {
  xpPerMember = 0;
  xpRewarded = 0;
  characters = [];

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["xp-tracker"],
      template: XPTracker.TEMPLATES.REWARD_XP_FORM,
      width: 400,
      height: 250,
      resizable: true,
      minimizable: true,
      title: "Reward XP",
    });
  }

  getData() {
    return {
      characters: this.options.trackerInstance.data.getJournalEntryData(),
      xpPerMember: this.xpPerMember,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    const updateXpPerMember = () => {
      if (this.characters.length === 0) {
        this.xpPerMember = this.xpRewarded;
      } else {
        this.xpPerMember = this.options.trackerInstance.settings.rounding(
          this.xpRewarded / this.characters.length,
        );
      }
      html.find("#xp-per-member").text(this.xpPerMember);
    };

    html.find("input[name='xp-rewarded']").on("input", (event) => {
      this.xpRewarded = parseInt(event.target.value);
      updateXpPerMember();
    });

    // When any checkbox with the name "character" is changed, update the
    // selected characters.
    html.find("input[name='character']").on("change", (event) => {
      const characterId = event.target.value;
      if (event.target.checked) {
        this.characters.push(characterId);
      } else {
        this.characters = this.characters.filter((c) => c !== characterId);
      }
      updateXpPerMember();
    });
  }

  async _updateObject(event, formData) {
    await this.options.trackerInstance.rewardXp(
      this.xpPerMember,
      this.characters,
    );

    this.xpPerMember = 0;
    this.xpRewarded = 0;
    this.characters = [];

    this.options.trackerInstance.render();
  }
}
