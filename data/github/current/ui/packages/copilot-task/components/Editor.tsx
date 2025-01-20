import type {RemoteProvider} from '@github/codespaces-lsp'
import {useCurrentRepository} from '@github-ui/current-repository'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useNavigate, useSearchParams} from '@github-ui/use-navigate'
import {
  DiffEditor,
  type DiffEditorProps,
  Editor as MonacoEditor,
  type EditorProps as MonacoEditorProps,
} from '@monaco-editor/react'
import {useTheme} from '@primer/react'
import type {editor} from 'monaco-editor'
import {useCallback, useRef} from 'react'
import {useLocation} from 'react-router-dom'

import {useFilesContext} from '../contexts/FilesContext'
import {useIsNewFilePage} from '../hooks/path-match-hooks'
import {useFocusedTask} from '../hooks/use-focused-task'
import {enableLanguageFeatures} from '../lsp/monaco-lsp-connector'
import {useLsps} from '../lsp/use-lsps'
import type {CodeEditorPayload, ConnectedCodespaceData} from '../utilities/copilot-task-types'
import {isDeleted} from '../utilities/file-status-helpers'
import {monacoEditorHeight} from '../utilities/layout'
import {configureMonaco} from '../utilities/monaco'
import {fileUrl} from '../utilities/urls'
import {EditorHeader, type EditorHeaderProps} from './EditorHeader'

function enableLanguageFeaturesForEditorModel(
  editor: editor.ICodeEditor,
  filePath: string,
  initialFileContent: string,
) {
  const newModel = editor.getModel()
  if (newModel) {
    enableLanguageFeatures(newModel, filePath, initialFileContent)
  }
}

type EditorProps = {
  codespaceData: ConnectedCodespaceData
  remoteProvider?: RemoteProvider
} & Pick<EditorHeaderProps, 'isTreeExpanded' | 'onTerminalClick' | 'treeToggleElement' | 'terminalHeaderButtonRef'>

export function Editor({codespaceData, remoteProvider, ...editorHeaderProps}: EditorProps) {
  const {ownerLogin, name} = useCurrentRepository()
  const {addFile, editFile, getCurrentFileContent, getFileStatuses, renameFile} = useFilesContext()
  const {
    blobContents,
    blobLanguage,
    compareRef,
    compareBlobContents,
    fileStatuses: pullFileStatuses,
    path,
    pullRequest,
  } = useRoutePayload<CodeEditorPayload>()
  const isNewFilePage = useIsNewFilePage()
  const localFileStatuses = getFileStatuses()
  const isFileDeleted =
    path in localFileStatuses ? isDeleted(localFileStatuses[path]) : isDeleted(pullFileStatuses?.[path])

  // use a ref to ensure monaco editor callbacks that are subscribed in `onMount` always have the latest data
  const currentPath = useRef(path)
  currentPath.current = path
  const currentBlobContents = useRef(blobContents ?? '')
  currentBlobContents.current = blobContents ?? ''

  const location = useLocation()
  const [searchParams] = useSearchParams()
  const {initialDiffState} = useFocusedTask()
  const editorView = searchParams.get('view')

  const showDiff = editorView?.startsWith('diff') || initialDiffState

  configureMonaco()
  const theme = useTheme()
  let editorColorTheme
  switch (theme.colorScheme) {
    case 'dark':
    case 'dark_dimmed':
      editorColorTheme = 'vs-dark'
      break
    case 'dark_high_contrast':
      editorColorTheme = 'hc-black'
      break
    case 'light_high_contrast':
      editorColorTheme = 'hc-light'
      break
    default:
      editorColorTheme = 'vs'
      break
  }

  const navigate = useNavigate()
  const options: MonacoEditorProps['options'] = {
    ariaLabel: 'Editor',
    readOnly: isFileDeleted,
    fixedOverflowWidgets: true,
    padding: {top: 8},
  }
  const diffOptions: DiffEditorProps['options'] = {
    ariaLabel: 'Diff Editor',
    modifiedAriaLabel: 'Modified Content Editor',
    originalAriaLabel: 'Original Content Editor',
    readOnly: isFileDeleted,
    renderSideBySide: editorView === 'diff-split',
    renderGutterMenu: false, // setting false to prevent AbstractContextKeyService error. see https://github.com/microsoft/monaco-editor/issues/4581
    fixedOverflowWidgets: true,
    padding: {top: 8},
  }

  const value = getCurrentFileContent(path, blobContents)

  const onChange = useCallback(
    (newValue: string | undefined) => {
      editFile({filePath: currentPath.current, originalContent: currentBlobContents.current, newFileContent: newValue})
    },
    [editFile],
  )

  const {registerMonaco} = useLsps(codespaceData, remoteProvider)

  const registerLanguageFeatures = (editor: editor.IStandaloneCodeEditor) => {
    if (currentPath.current) {
      enableLanguageFeaturesForEditorModel(editor, currentPath.current, currentBlobContents.current)
    }
  }

  let language = blobLanguage
  if (language === 'tsx') {
    language = 'typescript'
  }

  const editorHeader = (
    <EditorHeader
      key={`header-${path}`}
      isDeleted={isFileDeleted}
      path={path}
      onSaveFileName={newFileName => {
        if (isNewFilePage) {
          addFile(newFileName)
        } else {
          renameFile({newFilePath: newFileName, oldFilePath: path, originalContent: blobContents})
        }

        navigate(fileUrl({path: newFileName, owner: ownerLogin, repo: name, pullNumber: pullRequest.number, location}))
      }}
      {...editorHeaderProps}
    />
  )

  // If the file is new, we don't show the editor since it complicates monaco model management,
  // and LSP features won't work.
  // Instead, we just show the header and let the user save the file then begin composing.
  if (isNewFilePage) return editorHeader

  return (
    <>
      {editorHeader}
      {showDiff ? (
        <DiffEditor
          height={monacoEditorHeight}
          original={compareRef ? compareBlobContents || '' : blobContents}
          modified={isFileDeleted ? '' : value}
          key={path} // forces re-render of component, for correct Diffing on file change
          language={language || 'javascript'}
          theme={editorColorTheme}
          options={diffOptions}
          onMount={(editor, monaco) => {
            registerMonaco(monaco)
            const modifiedEditor = editor.getModifiedEditor()

            // Handle changes to the modified editor
            modifiedEditor.onDidChangeModelContent(() => {
              onChange?.(modifiedEditor.getValue())
            })

            registerLanguageFeatures(modifiedEditor)
          }}
        />
      ) : (
        <MonacoEditor
          height={monacoEditorHeight}
          defaultLanguage={language || 'javascript'}
          value={value}
          language={language}
          path={path}
          theme={editorColorTheme}
          options={options}
          onChange={onChange}
          onMount={(editor, monaco) => {
            registerMonaco(monaco)

            editor.onDidChangeModel(() => {
              registerLanguageFeatures(editor)
            })

            registerLanguageFeatures(editor)
          }}
        />
      )}
    </>
  )
}
