import { TEMPLATES } from "../model/constants.js"

export class ImportExportFormApplication extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["xp-tracker"],
      template: TEMPLATES.IMPORT_EXPORT_FORM,
      width: 400,
      height: 400,
      resizable: true,
      minimizable: true,
      title: "Add Character",
    })
  }

  activateListeners(html) {
    super.activateListeners(html)

    html.find("button#import-button").click(this._onImport.bind(this))
    html.find("button#export").click(this._onExport.bind(this))
  }

  async _onImport(event) {
    event.preventDefault()

    const importFile = this.element.find("input#import-file")[0].files[0]
    if (!importFile) {
      const errorDialog = new Dialog({
        title: "Error",
        content: "No file selected.",
        buttons: {
          ok: {
            label: "OK",
          },
        },
      })
      errorDialog.render(true)
      return
    }

    // First confirm the user wants to do this
    const confirmed = await Dialog.confirm({
      title: "Import Data",
      content:
        "Importing data will overwrite your current data. This cannot be undone. Are you sure you want to proceed?",
    })
    if (!confirmed) {
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result)

        await this.options.trackerInstance.data._updateJournalEntry(
          importedData,
        )
        await this.options.trackerInstance.render()
        this.close()
      } catch (error) {
        console.error("Error importing data", error)
        const errorDialog = new Dialog({
          title: "Error",
          content: "There was an error importing the data.",
          buttons: {
            ok: {
              label: "OK",
            },
          },
        })
        errorDialog.render(true)
        return
      }
    }
    reader.readAsText(importFile)
  }

  _onExport(event) {
    console.log("Exporting data")
    event.preventDefault()

    const journalData = this.options.trackerInstance.data.getJournalEntryData()
    const exportData = JSON.stringify(journalData)

    // this.element.find("textarea").val(exportData)
    // Download the JSON file
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "xp-tracker-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }
}
