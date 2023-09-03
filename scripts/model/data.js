import { DOCUMENT_NAME } from './constants.js'

export class XPTrackerData {
  isInitialized = false
  journalEntry = null

  async initialize(initialData = []) {
    if (this.isInitialized) {
      return
    }

    this.isInitialized = true

    this.journalEntry = await this._createOrGetJournalEntry(initialData)
    this.journalEntryId = this.journalEntry.id
  }

  async _createOrGetJournalEntry(initialData) {
    // Check if journal entry exists
    // If not, create it
    // Return journal entry id
    const maybeJournalEntry = game.journal.directory.documents.find(
      (journalEntry) => journalEntry.name === DOCUMENT_NAME,
    )

    if (maybeJournalEntry) {
      return maybeJournalEntry
    }

    // If this player is not the GM, we can't create the journal entry
    if (!game.user.isGM) {
      return
    }

    return await JournalEntry.create({
      name: DOCUMENT_NAME,
      content: JSON.stringify(initialData),
      visible: false,
      ownership: {
        [game.user.id]: 3,
        default: 2
      }
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