import {
  createFileSyncerClient,
  createLspClient,
  type IFileSyncerClient,
  type ILspClient,
  LspServerType,
  type RemoteProvider,
} from '@github/codespaces-lsp'
import type {Monaco} from '@monaco-editor/react'
import type {languages} from 'monaco-editor'
import {useCallback, useEffect, useRef, useState} from 'react'

import type {ConnectedCodespaceData} from '../utilities/copilot-task-types'
import {connectMonacoToLsps} from './monaco-lsp-connector'

const DEFAULT_MODEL_CONFIG = {
  hovers: false,
  completionItems: false,
  diagnostics: false,
  definitions: false,
}

const DEFAULT_DIAGNOSTICS_OPTIONS = {
  noSemanticValidation: true,
  noSyntaxValidation: true,
}

interface JsTsLanguageOptions {
  compilerOptions: languages.typescript.CompilerOptions
  diagnosticsOptions: languages.typescript.DiagnosticsOptions
  modeConfiguration: languages.typescript.ModeConfiguration
}

export function useLsps(codespaceData: ConnectedCodespaceData, remoteProvider?: RemoteProvider) {
  const [requiredLsps, setRequiredLsps] = useState<Set<LspServerType>>(new Set([LspServerType.Copilot]))
  const lspClientsRef = useRef<ILspClient[]>([])
  const fileSyncerRef = useRef<IFileSyncerClient | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const originalJsTsOptions = useRef<{js?: JsTsLanguageOptions; ts?: JsTsLanguageOptions}>({})

  const {codespaceInfo, isCodespaceReady, workspaceRoot} = codespaceData

  const disableBrowserLsp = useCallback(
    (lspType: LspServerType) => {
      if (!monacoRef.current || !lspType) {
        return
      }

      if (lspType === LspServerType.Typescript) {
        // Disable typescript default LSP features and to use the LSP provided by the codespace
        originalJsTsOptions.current = {
          js: {
            compilerOptions: {...monacoRef.current.languages.typescript.javascriptDefaults.getCompilerOptions()},
            diagnosticsOptions: {...monacoRef.current.languages.typescript.javascriptDefaults.getDiagnosticsOptions()},
            modeConfiguration: {...monacoRef.current.languages.typescript.javascriptDefaults.modeConfiguration},
          },
          ts: {
            compilerOptions: {...monacoRef.current.languages.typescript.typescriptDefaults.getCompilerOptions()},
            diagnosticsOptions: {...monacoRef.current.languages.typescript.typescriptDefaults.getDiagnosticsOptions()},
            modeConfiguration: {...monacoRef.current.languages.typescript.typescriptDefaults.modeConfiguration},
          },
        }
        monacoRef.current.languages.typescript.javascriptDefaults.setCompilerOptions({})
        monacoRef.current.languages.typescript.typescriptDefaults.setCompilerOptions({})
        monacoRef.current.languages.typescript.javascriptDefaults.setDiagnosticsOptions(DEFAULT_DIAGNOSTICS_OPTIONS)
        monacoRef.current.languages.typescript.typescriptDefaults.setDiagnosticsOptions(DEFAULT_DIAGNOSTICS_OPTIONS)
        monacoRef.current.languages.typescript.javascriptDefaults.setModeConfiguration(DEFAULT_MODEL_CONFIG)
        monacoRef.current.languages.typescript.typescriptDefaults.setModeConfiguration(DEFAULT_MODEL_CONFIG)

        // Clear all markers for the current model
        for (const model of monacoRef.current.editor.getModels()) {
          monacoRef.current.editor.setModelMarkers(model, 'Codespaces LSP', [])
        }
      }
    },
    [monacoRef],
  )

  const enableBrowserLsp = useCallback(
    (lspType: LspServerType) => {
      if (!monacoRef.current || !lspType) {
        return
      }

      if (lspType === LspServerType.Typescript) {
        // Return to the default options
        if (originalJsTsOptions.current?.js) {
          monacoRef.current.languages.typescript.javascriptDefaults.setCompilerOptions(
            originalJsTsOptions.current.js.compilerOptions,
          )
          monacoRef.current.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
            originalJsTsOptions.current.js.diagnosticsOptions,
          )
          monacoRef.current.languages.typescript.javascriptDefaults.setModeConfiguration(
            originalJsTsOptions.current.js.modeConfiguration,
          )
        }

        if (originalJsTsOptions.current?.ts) {
          monacoRef.current.languages.typescript.typescriptDefaults.setCompilerOptions(
            originalJsTsOptions.current.ts.compilerOptions,
          )
          monacoRef.current.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
            originalJsTsOptions.current.ts.diagnosticsOptions,
          )
          monacoRef.current.languages.typescript.typescriptDefaults.setModeConfiguration(
            originalJsTsOptions.current.ts.modeConfiguration,
          )
        }
      }
    },
    [monacoRef],
  )

  /**
   * Create LSP clients once codespace is ready
   */
  useEffect(() => {
    if (!isCodespaceReady || !codespaceInfo?.environment_data?.connection?.tunnelProperties || !remoteProvider) {
      return
    }

    const missingLspClients = [...requiredLsps].filter(
      lsp => !lspClientsRef.current.some(lspClient => lspClient.type === lsp),
    )
    if (missingLspClients.length > 0) {
      const createLspClientInner = async (lspType: LspServerType) => {
        try {
          const lspClient = await createLspClient(lspType, remoteProvider, workspaceRoot)
          lspClientsRef.current = [...lspClientsRef.current, lspClient]

          // Disable browser LSP features if the codespace provides a LSP for the same language
          disableBrowserLsp(lspType)
        } catch {
          // log and proceed with next lsp
        }
      }

      for (const lsp of missingLspClients) {
        createLspClientInner(lsp)
      }
    }
  }, [codespaceInfo, isCodespaceReady, requiredLsps, workspaceRoot, remoteProvider, disableBrowserLsp, monacoRef])

  const getLspClient = useCallback(
    async (lspServerType: LspServerType) => {
      const client = lspClientsRef.current.find(x => x.type === lspServerType)
      if (client) {
        if (!client.disposed) {
          // Using existing client for ${LspServerType[lspServerType]}`)
          return Promise.resolve(client)
        } else {
          // Enabling browser LSP features if the codespace LSP is gone (can happen if the codespace is disconnected/removed)
          enableBrowserLsp(lspServerType)

          // Remove disposed client to trigger recreation
          lspClientsRef.current = lspClientsRef.current.filter(x => x !== client)

          return null
        }
      }

      if (!requiredLsps.has(lspServerType)) {
        setRequiredLsps(prev => new Set([...prev, lspServerType]))
      }

      return null
    },
    [enableBrowserLsp, lspClientsRef, requiredLsps],
  )

  /**
   * Create File Syncer client once codespace is ready
   */
  useEffect(() => {
    if (!isCodespaceReady || !remoteProvider) {
      return
    }

    if (fileSyncerRef.current) {
      return
    }

    const createFileSyncerClientInner = async () => {
      try {
        fileSyncerRef.current = await createFileSyncerClient(remoteProvider)
      } catch {
        // TODO: consider adding retry logic in the future
      }
    }

    createFileSyncerClientInner()
  }, [codespaceInfo, isCodespaceReady, remoteProvider])

  const getFileSyncerClient = useCallback(() => {
    return fileSyncerRef.current
  }, [fileSyncerRef])

  const registerMonaco = useCallback(
    (monacoInstance: Monaco) => {
      if (monacoInstance) {
        configureJsTs(monacoInstance)
        monacoRef.current = monacoInstance
        connectMonacoToLsps(monacoInstance, getLspClient, workspaceRoot, lspClientsRef.current, getFileSyncerClient)
      }
    },
    [getFileSyncerClient, getLspClient, lspClientsRef, workspaceRoot],
  )

  return {registerMonaco}
}

function configureJsTs(monacoInstance: Monaco) {
  // 'monacoInstance' may not available on the first render, so we need to setEagerModelSync after it is available.
  monacoInstance.languages.typescript.javascriptDefaults.setEagerModelSync(true)
  monacoInstance.languages.typescript.typescriptDefaults.setEagerModelSync(true)
  monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions(DEFAULT_DIAGNOSTICS_OPTIONS)
  monacoInstance.languages.typescript.javascriptDefaults.setDiagnosticsOptions(DEFAULT_DIAGNOSTICS_OPTIONS)
}
