import type {IFileSyncerClient, ILspClient, PublishDiagnosticsParams} from '@github/codespaces-lsp'
import {
  CopilotLspClient,
  getLanguage,
  getLspServerType,
  LspServerType,
  onRichEditingStatusChange,
  RichEditingStatus,
} from '@github/codespaces-lsp'
import type {Monaco} from '@monaco-editor/react'
import type {
  editor as EditorMonaco,
  IDisposable as IDisposableMonaco,
  IMarkdownString,
  IRange as IRangeMonaco,
  languages as LanguagesMonaco,
  Position,
} from 'monaco-editor'
import type {CompletionItem} from 'vscode-languageserver-types'

import {
  lspToMonacoCompletionItemKind,
  lspToMonacoRange,
  lspToMonacoSeverity,
  monacoToLspPosition,
  monacoToLspRange,
} from './lsp-monaco-conversion-utils'

let monacoLspConnector: MonacoLspConnector | null = null

export function connectMonacoToLsps(
  monacoInstance: Monaco,
  getLspClient: (lspServerType: LspServerType) => Promise<ILspClient | null>,
  workspaceRoot: string,
  readyLspClients: ILspClient[],
  getFileSyncerClient: () => IFileSyncerClient | null,
) {
  if (!monacoLspConnector) {
    monacoLspConnector = new MonacoLspConnector(monacoInstance, getLspClient, workspaceRoot, getFileSyncerClient)

    registerLspServices(monacoLspConnector)

    // Enable language features for pending models that were redered before LSP is connected, and remove from the pending list
    for (const [filepath, models] of pendingModels) {
      for (const modelData of models) {
        const {model, initialFileContent} = modelData
        monacoLspConnector.enableLanguageFeatures(model, filepath, initialFileContent)
      }
      pendingModels.delete(filepath)
    }

    // Connected Monaco to LSPs
  } else {
    if (monacoLspConnector.monacoInstance !== monacoInstance) {
      throw new Error(`Only one Monaco instance can be connected to LSPs. This should not happen.`)
    }

    if (monacoLspConnector.getLspClient !== getLspClient) {
      monacoLspConnector.getLspClient = getLspClient
    }

    if (monacoLspConnector.workspaceRoot !== workspaceRoot) {
      monacoLspConnector.workspaceRoot = workspaceRoot
    }

    if (monacoLspConnector.getFileSyncerClient !== getFileSyncerClient) {
      monacoLspConnector.getFileSyncerClient = getFileSyncerClient
    }

    // Enable language features for already rendered editor models.
    // This is needed if a codespace was not available when the editor models were initially rendered.
    // Missing language features will be automatically enabled when the user starts to interact with the file,
    // but this is just to speed up things by enabling them upfront.
    if (readyLspClients.length > 0) {
      onRichEditingStatusChange(status => {
        if (status === RichEditingStatus.DISABLED) {
          monacoLspConnector?.dispose()
          monacoLspConnector = null
        }
      })
    }
  }
}

export interface ContextOperations {
  openFileInFileExplorer: (filepath: string, options?: {viewMode: 'code' | 'diff'; range?: IRangeMonaco}) => void
  closeFileExplorer: () => void
}

export function registerContextOperations(params: ContextOperations) {
  if (!monacoLspConnector) {
    return
  }
  monacoLspConnector.registerContextOperations(params)
}

type PendingModelData = {
  model: EditorMonaco.ITextModel
  initialFileContent: string
}

const pendingModels = new Map<string, PendingModelData[]>()
export function enableLanguageFeatures(
  model: EditorMonaco.ITextModel | null,
  filepath: string,
  initialFileContent: string,
) {
  if (!monacoLspConnector) {
    //insert or update the model in the pending models
    if (model) {
      const models = pendingModels.get(filepath) || []
      models.push({model, initialFileContent})
      pendingModels.set(filepath, models)
    }

    return
  }

  if (!model) {
    return
  }

  if (!filepath) {
    return
  }

  // Enabling language features for '${model.uri.toString()} (${filepath})
  monacoLspConnector.enableLanguageFeatures(model, filepath, initialFileContent)
}

function registerLspServices(connector: MonacoLspConnector) {
  connector.setupCopilotCompletion()
  connector.registerHoverProvider()
  connector.registerCompletionProvider()

  // Register other LSP services here (such as hover, completions, GTD etc.)
}

/**
 * A class that manages all monaco editor models and their LSP clients, for a given file.
 */
class EditableFile {
  private models: Set<EditorMonaco.ITextModel> = new Set()
  private lspClients: Map<LspServerType, ILspClient> = new Map()
  public lastSyncedContent: string
  public latestDiagnostics: EditorMonaco.IMarkerData[] = []

  public constructor(
    public filepath: string,
    public fileUri: string,
    public readonly originalContent: string = '',
  ) {
    this.lastSyncedContent = originalContent ?? ''
  }

  public addModel(model: EditorMonaco.ITextModel) {
    this.models.add(model)
    model.onWillDispose(() => {
      this.models.delete(model)
    })
  }

  public hasFileUri(_fileUri: string) {
    return this.fileUri === _fileUri
  }

  public hasModel(model: EditorMonaco.ITextModel) {
    return this.models.has(model)
  }

  public hasAnyModel() {
    return this.models.size > 0
  }

  public hasLspClient(lspServerType: LspServerType) {
    return this.lspClients.has(lspServerType)
  }

  public getVersionId() {
    let versionId = 0
    for (const model of this.models) {
      versionId += model.getVersionId()
    }

    return versionId
  }

  public getLanguageId() {
    return getLanguage(this.filepath)
  }

  public getCurrentValue() {
    const model = this.models.values().next().value as EditorMonaco.ITextModel
    if (!model) {
      return ''
    }

    return model.getValue()
  }

  public addLspClient(lspServerType: LspServerType, lspClient: ILspClient) {
    this.lspClients.set(lspServerType, lspClient)
  }

  public getLspClient(lspServerType: LspServerType) {
    return this.lspClients.get(lspServerType)
  }

  public getModels() {
    return this.models
  }
}

const SupportedLsps = ['go', 'javascript', 'typescript', 'python']

class MonacoLspConnector implements IDisposableMonaco {
  static DefaultLspsForAllModels: LspServerType[] = [LspServerType.Copilot]
  private editableFiles: EditableFile[] = []
  public contextOperations: ContextOperations | null = null
  private disposables: IDisposableMonaco[] = []
  private disposed: boolean = false
  private isSyncingFiles: boolean = false
  public constructor(
    public monacoInstance: Monaco,
    public getLspClient: (lspServerType: LspServerType) => Promise<ILspClient | null>,
    public workspaceRoot: string,
    public getFileSyncerClient: () => IFileSyncerClient | null,
  ) {
    this.startSyncing()
  }

  /**
   * Start syncing the modified file contents to Codespaces (downstream API wil only invoke a netwoirk call if there is a diff)
   * We are using periodic syncing to avoid syncing monaco's change event, as the change event is unrealiable,
   * See: https://github.com/suren-atoyan/monaco-react/issues/402
   */
  private startSyncing() {
    setInterval(async () => {
      if (this.isSyncingFiles) {
        return
      }

      this.isSyncingFiles = true
      for (const editableFile of this.editableFiles) {
        try {
          await this.syncToCodespaces(editableFile)
        } catch (e) {
          // TODO: add telemetry
        }
      }

      this.isSyncingFiles = false
    }, 100)
  }

  /**
   * Register contextual operations that may be mutated in a React context
   * Examples include a function for opening a file in the file explorer
   * @param params A set of contextual operations
   */
  public registerContextOperations(params: ContextOperations) {
    this.contextOperations = {
      openFileInFileExplorer: params.openFileInFileExplorer,
      closeFileExplorer: params.closeFileExplorer,
    }
  }

  /**
   * Enable language features for a given model, and track it with other models for the same file.
   * @param model The monaco editor model
   * @param filepath The file path of the model
   */
  public async enableLanguageFeatures(model: EditorMonaco.ITextModel, filepath: string, initialFileContent: string) {
    const fileUri = `file://${this.workspaceRoot}/${filepath}`
    let editableFile = this.editableFiles.find(x => x.fileUri === fileUri)
    if (editableFile?.hasModel(model)) {
      // Model already registered for ${fileUri}. NOOP
      return
    }

    if (!editableFile) {
      editableFile = new EditableFile(filepath, fileUri, initialFileContent)
      this.editableFiles.push(editableFile)
    }

    editableFile.addModel(model)
    await this.wireModelToLsp(filepath, editableFile, model)
  }

  /**
   * Enable language features for all models that are already rendered in the editor.
   */
  public async enableLanguageFeaturesForAllModels() {
    for (const editableFile of this.editableFiles) {
      for (const model of editableFile.getModels()) {
        await this.wireModelToLsp(editableFile.fileUri, editableFile, model)
      }
    }
  }

  public dispose() {
    if (this.disposed) {
      return
    }

    this.disposed = true
    for (const disposable of this.disposables) {
      try {
        disposable.dispose()
      } catch (e) {
        // Silently ignore
      }
    }
    this.disposables = []

    // Clear all markers for the current model
    for (const model of this.monacoInstance.editor.getModels()) {
      this.monacoInstance.editor.setModelMarkers(model, 'Codespaces LSP', [])
    }
  }

  /**
   * Get the LSP client for a given model.
   * If the LSP client is not already available, it will be setup.
   * @param lspServerType The LSP server type
   * @param monacoModel The monaco editor model
   */
  public async getLspClientForModel(lspServerType: LspServerType, monacoModel: EditorMonaco.ITextModel) {
    const editableFile = this.editableFiles.find(x => x.hasModel(monacoModel)) || null
    if (!editableFile) {
      throw new Error(`Model not registered for ${monacoModel.uri}. This should not happen.`)
    }

    let lspClient = editableFile.getLspClient(lspServerType) || null
    if (!lspClient) {
      lspClient = await this.setupLspClient(lspServerType, editableFile, monacoModel)
    }

    return lspClient
  }

  /**
   * Setup copilot completion for monaco editor.
   */
  public setupCopilotCompletion() {
    const getLspClientForModel = this.getLspClientForModel.bind(this)
    const monacoInstance = this.monacoInstance
    const editableFiles = this.editableFiles
    const textDocumentDidOpen = this.textDocumentDidOpen.bind(this)
    const textDocumentDidClose = this.textDocumentDidClose.bind(this)
    let cachedModel: EditorMonaco.ITextModel | undefined

    const disposable = monacoInstance.languages.registerInlineCompletionsProvider(['*'], {
      provideInlineCompletions: async (model, position) => {
        cachedModel = model

        const editableFile = editableFiles.find(x => x.hasModel(model))
        if (!editableFile) {
          throw Error(`No editable file found for ${model.uri}`)
        }

        const lspClient = await getLspClientForModel(LspServerType.Copilot, model)
        if (lspClient && lspClient instanceof CopilotLspClient) {
          const result = await lspClient.getCopilotCompletion({
            doc: {
              position: monacoToLspPosition(position),
              uri: editableFile.fileUri,
              version: editableFile.getVersionId(),
            },
          })

          if (result.completions.length === 0 && result.cancellationReason === 'DocumentVersionMismatch') {
            // `Document version mismatch. Reopening document`
            await textDocumentDidClose(lspClient, editableFile)
            await textDocumentDidOpen(lspClient, editableFile, model)
          }

          return {
            items: result.completions.map(completion => {
              return {
                range: new monacoInstance.Range(
                  position.lineNumber,
                  position.column,
                  position.lineNumber,
                  completion.text.length,
                ),
                insertText: completion.displayText,
                label: completion.displayText,
              }
            }),
          }
        }
      },
      freeInlineCompletions() {
        // Noop
      },
      handleItemDidShow: completions => {
        if (!cachedModel) {
          return
        }
        const editableFile = editableFiles.find(x => x.hasModel(cachedModel!))
        if (!editableFile) {
          return
        }
        const topCompletion = completions.items[0]
        if (!topCompletion) {
          return
        }
      },
    })
    this.disposables.push(disposable)
  }

  /**
   * Register hover provider for monaco editor.
   */
  public registerHoverProvider() {
    const getLspClientForModel = this.getLspClientForModel.bind(this)
    const monacoInstance = this.monacoInstance
    const editableFiles = this.editableFiles
    const disposable = monacoInstance.languages.registerHoverProvider(SupportedLsps, {
      async provideHover(model, position) {
        const editableFile = editableFiles.find(x => x.hasModel(model))
        if (!editableFile) {
          throw Error(`No editable file found for ${model.uri}`)
        }

        const lang = getLanguage(editableFile.fileUri)
        const lspServerType = getLspServerType(lang)
        if (!lspServerType) {
          // Not a supported language
          return
        }

        const lspClient = await getLspClientForModel(lspServerType, model)

        const lspRes = await lspClient?.getHover({
          textDocument: {
            uri: editableFile.fileUri,
          },
          position: monacoToLspPosition(position),
        })
        if (!lspRes) {
          return
        }

        const monacoHoverContents: IMarkdownString[] = []
        if (lspRes.contents) {
          // check if the contents is an array
          if (Array.isArray(lspRes.contents)) {
            for (const content of lspRes.contents) {
              if (typeof content === 'string') {
                monacoHoverContents.push({
                  value: content,
                })
              } else {
                monacoHoverContents.push({
                  value: content.value,
                })
              }
            }
          } else {
            if (typeof lspRes.contents === 'string') {
              monacoHoverContents.push({
                value: lspRes.contents,
              })
            } else {
              monacoHoverContents.push({
                value: lspRes.contents.value,
              })
            }
          }
        }

        return {
          contents: monacoHoverContents,
          range: lspRes.range ? lspToMonacoRange(lspRes.range) : undefined,
        }
      },
    })
    this.disposables.push(disposable)
  }

  public registerCompletionProvider() {
    const getLspClientForModel = this.getLspClientForModel.bind(this)
    const monacoInstance = this.monacoInstance
    const editableFiles = this.editableFiles
    const diposable = monacoInstance.languages.registerCompletionItemProvider(SupportedLsps, {
      async provideCompletionItems(model, position) {
        const editableFile = editableFiles.find(x => x.hasModel(model))
        if (!editableFile) {
          throw Error(`No editable file found for ${model.uri}`)
        }

        const lang = getLanguage(editableFile.fileUri)
        const lspServerType = getLspServerType(lang)
        if (!lspServerType) {
          // Not a supported language
          return
        }

        const lspClient = await getLspClientForModel(lspServerType, model)

        const lspRes = await lspClient?.getCompletion({
          textDocument: {
            uri: editableFile.fileUri,
          },
          position: monacoToLspPosition(position),
        })

        if (!lspRes) {
          return
        }

        let completionItems: LanguagesMonaco.CompletionItem[] = []
        // Check if it is an array
        if (Array.isArray(lspRes)) {
          completionItems = processCompletionItems(lspRes, model, position)
          return {
            suggestions: completionItems,
          }
        } else {
          completionItems = processCompletionItems(lspRes.items, model, position)
          return {
            incomplete: lspRes.isIncomplete,
            suggestions: completionItems,
          }
        }
      },
    })
    this.disposables.push(diposable)

    function processCompletionItems(items: CompletionItem[], model: EditorMonaco.ITextModel, position: Position) {
      return items.map(lspCompletion => {
        const textEdit = lspCompletion.textEdit
        if (textEdit && 'range' in textEdit) {
          // The replacement range is computed for us
          const monacoRange = lspToMonacoRange(textEdit.range)
          return {
            label: lspCompletion.label,
            kind: lspToMonacoCompletionItemKind(lspCompletion.kind),
            insertText: lspCompletion.label,
            range: monacoRange,
          }
        } else {
          // We need to compute the replacement range ourselves
          const lineContent = model.getLineContent(position.lineNumber)
          const leadingWhitespace = lineContent.match(/^\s*/)?.[0] || ''
          const rawInsertText = lspCompletion.insertText || lspCompletion.label
          const partialInsertText = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: position.column - rawInsertText.length - leadingWhitespace.length,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          })
          const completionText = rawInsertText.startsWith(partialInsertText)
            ? rawInsertText.substring(partialInsertText.length)
            : rawInsertText

          return {
            label: lspCompletion.label,
            kind: lspToMonacoCompletionItemKind(lspCompletion.kind),
            insertText: completionText,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - partialInsertText.length + leadingWhitespace.length,
              endLineNumber: position.lineNumber,
              endColumn: position.column + leadingWhitespace.length + 1,
            },
          }
        }
      })
    }
  }

  /**
   * Report the document open event to the LSP server.
   * It also registers a listener for content changes in the model, to report the changes to the LSP server.
   *
   * @param lspClient LSP client to report the document open event to
   * @param editableFile File to report as open
   * @param currentModel Monaco model that has the file open
   */
  private async textDocumentDidOpen(
    lspClient: ILspClient,
    editableFile: EditableFile,
    currentModel: EditorMonaco.ITextModel,
  ) {
    const textDocument = {
      uri: editableFile.fileUri,
      languageId: editableFile.getLanguageId(),
      version: editableFile.getVersionId(),
      text: editableFile.getCurrentValue(),
    }

    await lspClient.textDocumentDidOpen({
      textDocument,
    })

    const disposable = currentModel.onDidChangeContent(async e => {
      await lspClient.textDocumentDidChange({
        textDocument: {
          uri: editableFile.fileUri,
          version: editableFile.getVersionId(),
        },
        contentChanges: e.changes.map(change => ({
          range: monacoToLspRange(change.range),
          rangeLength: change.rangeLength,
          text: change.text,
        })),
      })
    })
    this.disposables.push(disposable)
  }

  /**
   * Report the document close event to the LSP server.
   * @param lspClient LSP client to report the document close event to
   * @param editableFile File to report as closed
   */
  public async textDocumentDidClose(lspClient: ILspClient, editableFile: EditableFile) {
    await lspClient.textDocumentDidClose({
      textDocument: {
        uri: editableFile.fileUri,
      },
    })
  }

  /**
   * Wire the model to the LSP server.
   * This method will setup the LSP client for the model and apply existing diagnostics markers.
   * @param filepath The file path of the model
   * @param editableFile The editable file
   * @param model The monaco editor model
   */
  private async wireModelToLsp(filepath: string, editableFile: EditableFile, model: EditorMonaco.ITextModel) {
    const lspServerType = getLspServerType(getLanguage(filepath))
    const requiredLsps = lspServerType
      ? [lspServerType, ...MonacoLspConnector.DefaultLspsForAllModels]
      : MonacoLspConnector.DefaultLspsForAllModels
    for (const lsp of requiredLsps) {
      const lspClient = editableFile.getLspClient(lsp)
      if (!lspClient) {
        await this.setupLspClient(lsp, editableFile, model)
      } else {
        // Apply existing diagnostics markers
        this.monacoInstance.editor.setModelMarkers(model, 'Codespaces LSP', editableFile.latestDiagnostics)
      }
    }
  }

  /**
   * Setup LSP client for the given model
   * This method will also register diagnostics handler and report the document open event to the LSP server.
   * @param lspServerType The LSP server type to setup
   * @param editableFile The editable file
   * @param model The monaco editor model
   */
  private async setupLspClient(
    lspServerType: LspServerType,
    editableFile: EditableFile,
    model: EditorMonaco.ITextModel,
  ) {
    const lspClient = await this.getLspClient(lspServerType)
    if (lspClient) {
      editableFile.addLspClient(lspServerType, lspClient)
      lspClient.registerOnDiagnosticsHandler(this.onDiagnosticReceived.bind(this))
      await this.textDocumentDidOpen(lspClient, editableFile, model)
    } else {
      // `LSP client not available yet ${LspServerType[lspServerType]}`)
    }

    return lspClient
  }

  /**
   * Handle diagnostics received from the LSP server.
   * This method will apply the diagnostics markers to the monaco editor.
   * @param params The diagnostics parameters
   */
  private onDiagnosticReceived(params: PublishDiagnosticsParams) {
    const fileUri = params.uri
    const editableFile = this.editableFiles.find(x => x.fileUri === fileUri)
    const models = editableFile?.getModels()

    const markers: EditorMonaco.IMarkerData[] = params.diagnostics
      .map(diag => {
        if (!diag?.range?.start || !diag?.range?.end) {
          return null
        }

        return {
          severity: lspToMonacoSeverity(diag.severity),
          message: diag.message,
          startLineNumber: diag.range.start.line + 1,
          startColumn: diag.range.start.character + 1,
          endLineNumber: diag.range.end.line + 1,
          endColumn: diag.range.end.character + 1,
        }
      })
      .filter(x => x != null) as EditorMonaco.IMarkerData[]

    if (editableFile) {
      editableFile.latestDiagnostics = markers
    }

    if (!models || models.size === 0) {
      // `No tracked models found for ${fileUri} in 'onDiagnosticReceived'.`
      return
    }
    for (const model of models) {
      this.monacoInstance.editor.setModelMarkers(model, 'Codespaces LSP', markers)
    }
  }

  private async syncToCodespaces(editableFile: EditableFile) {
    // If we don't have a model, any new content here is bunk so skip out.
    //
    // This happens consistently with the DiffEditor which triggers removal of models on unmount.
    // The EditableFile hangs around then without a model, but our loop sees it to try and sync.
    // There may be some race condition between the unmount/mount + sync loop at play here.
    if (!editableFile.hasAnyModel()) {
      return
    }
    const oldStr = editableFile.lastSyncedContent
    const newStr = editableFile.getCurrentValue()
    const path = `${this.workspaceRoot}/${editableFile.filepath}`
    const fileSyncerClient = this.getFileSyncerClient()
    if (fileSyncerClient) {
      const result = await fileSyncerClient.syncChanges(path, path, oldStr, newStr)
      if (result) {
        editableFile.lastSyncedContent = newStr
      } else {
        const overwriteResult = await fileSyncerClient.overwriteFile(path, newStr)
        if (overwriteResult) {
          editableFile.lastSyncedContent = newStr
        }
      }
    }
  }
}
