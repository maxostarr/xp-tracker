import { TEMPLATES } from "../constants.js";

export class ChangeSummaryDialog extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["xp-tracker"],
      template: TEMPLATES.CHANGE_SUMMARY_DIALOG,
      width: 400,
      height: 400,
      resizable: true,
      minimizable: true,
      title: "Change Summary",
    });
  }

  getData() {
    const headings = this.object[0].changes.map((change) => change.property);

    return {
      rows: this.object,
      headings,
    };
  }
}
