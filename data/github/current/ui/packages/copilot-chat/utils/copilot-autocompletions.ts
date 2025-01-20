import {isFileReference, makeCopilotChatReference, makeSymbolReference, referenceID} from './copilot-chat-helpers'
import type {CopilotChatManager} from './copilot-chat-manager'
import type {CopilotChatState} from './copilot-chat-reducer'
import type {
  CopilotChatReference,
  CopilotChatRepo,
  DocsetReference,
  FileReference,
  SuggestionSymbolReference,
} from './copilot-chat-types'

export class CopilotAutocompleteManager {
  manager: CopilotChatManager
  fileSuggestions = new Map<string, FileReference>()
  symbolSuggestions = new Map<string, SuggestionSymbolReference>()
  knowledgeSuggestions = new Map<string, DocsetReference>()
  repoFileSuggestions = new Map<string, Map<string, FileReference>>()

  constructor(manager: CopilotChatManager) {
    this.manager = manager
  }

  filenameFromPath(path: string): string {
    const parts = path.split('/')
    return parts[parts.length - 1]!
  }

  async fetchAutocompleteSuggestions(repo: CopilotChatRepo, symbolQuery: string): Promise<void> {
    const [symbols, files] = await Promise.all([
      this.manager.service.querySymbols(repo, symbolQuery),
      this.manager.service.listRepoFiles(repo),
    ])

    if (symbols.ok) {
      const symbolResults = symbols.payload.flatMap(suggestion => {
        if (!suggestion.symbol) return []
        return [makeSymbolReference(suggestion, repo)]
      })
      this.symbolSuggestions = new Map(symbolResults.map($result => [$result.name, $result]))
    }

    if (this.repoFileSuggestions.has(repo.name)) {
      this.fileSuggestions = this.repoFileSuggestions.get(repo.name)!
      return
    }

    if (files.ok) {
      const filesByPath = new Map<string, FileReference>()
      this.repoFileSuggestions.set(repo.name, filesByPath)
      // Large repos could have hundreds of thousands of files, so we process them in chunks
      // to avoid blocking the main thread for too long.
      // This could eventually be done in a web worker too.
      const chunkSize = 5000
      let index = 0

      const processChunk = () => {
        const end = Math.min(index + chunkSize, files.payload.length)
        for (; index < end; index++) {
          const $file = files.payload[index]
          if ($file) {
            const ref = makeCopilotChatReference($file, repo)
            filesByPath.set(ref.path, ref)
          }
        }

        if (index < files.payload.length) {
          setTimeout(processChunk, 0) // Schedule the next chunk
        } else {
          this.fileSuggestions = filesByPath
          return
        }
      }

      processChunk() // Start processing the first chunk
    }
  }

  findReference(uniqueID: string, state: CopilotChatState): CopilotChatReference | undefined {
    return state.currentReferences.find(value => uniqueID === referenceID(value))
  }

  /**
   * Adds a new reference to the list of references in the CopilotChatState.
   * If the reference already exists, it will not be added again.
   * @param newReference The new reference to be added.
   * @param state The current CopilotChatState.
   */
  async addToReferences(newReference: CopilotChatReference, state: CopilotChatState) {
    const uniqueID = referenceID(newReference)
    const existingReference = this.findReference(uniqueID, state)

    if (existingReference) return

    let referenceToAdd = newReference
    if (isFileReference(newReference)) {
      const response = await this.manager.service.fetchLanguageForFileReference(newReference)
      if (response.ok && response.payload.language) {
        const {languageName, languageId} = response.payload.language
        referenceToAdd = {...newReference, languageName, languageId}
      }
    }

    this.manager.addReference(referenceToAdd, 'autocomplete')
  }
}
