import {TerminalFeatures, TerminalPanel, TerminalVisibility} from '@github/codespaces-editor'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useTreePane} from '@github-ui/repos-file-tree-view'
import type {WebCommitDialogState} from '@github-ui/web-commit-dialog'
import {Box, SplitPageLayout, useResizeObserver, useTheme} from '@primer/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useCallback, useRef, useState} from 'react'

import {CommitPanel} from '../components/CommitPanel'
import {Editor} from '../components/Editor'
import {FileTree} from '../components/FileTree'
import {Header} from '../components/Header'
import {RightPanelType, RightSidePanel} from '../components/RightSidePanel'
import {useCopilotContext} from '../contexts/CopilotContext'
import {useFilesContext} from '../contexts/FilesContext'
import {useCodespaces as useCodespaces} from '../lsp/use-codespaces'
import {
  type CodeEditorPayload,
  type CopilotTaskBasePayload,
  type FocusedTaskData,
  TaskTypes,
} from '../utilities/copilot-task-types'
import {contentHeight} from '../utilities/layout'

export const appOffsetTop = (rootElement?: HTMLElement | null) => {
  return rootElement?.getBoundingClientRect().top ?? 0
}

function useAppOffsetTop() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [offsetTop, setOffsetTop] = useState(() => appOffsetTop(rootRef?.current))
  const resizeObserver = useCallback(() => {
    setOffsetTop(appOffsetTop(rootRef?.current))
  }, [])

  useResizeObserver(resizeObserver, rootRef)

  return {offsetTop, rootRef}
}

const queryClient = new QueryClient()

export function CopilotTask() {
  const payload = useRoutePayload<CopilotTaskBasePayload>()
  const {getFileStatuses} = useFilesContext()
  const {getCommandSuggestion} = useCopilotContext()
  const {pullRequest, repo} = payload
  const [commitDialogState, setCommitDialogState] = useState<WebCommitDialogState>('closed')
  const [terminalVisibility, setTerminalVisibility] = useState<TerminalVisibility>(TerminalVisibility.Hidden)
  const fileTreeId = 'repos-file-tree'
  const openFileTreePaneRef = useRef<string | undefined>()
  const textAreaId = 'text-area-id' // TODO: replace with actual text area id
  const commitButtonRef = useRef<HTMLButtonElement>(null)
  const treePaneProps = useTreePane(
    fileTreeId,
    openFileTreePaneRef,
    true,
    textAreaId, // TODO: replace with actual text area id
    undefined,
    'copilotTaskFileTreeExpanded',
    {useFilesButtonBreakpoint: false, getTooltipDirection: expanded => (expanded ? 'sw' : 'se')},
  )

  const {isTreeExpanded, treeToggleElement} = treePaneProps

  const terminalSuggestionsEnabled = useFeatureFlag('hadron_terminal_completions')
  const commentFixGenerationEnabled = useFeatureFlag('hadron_comment_fix_generation')
  const hadronSuggestionsUI = useFeatureFlag('copilot_hadron_suggestions_ui')

  // Because we're handling content a little weirdly from React's point of view,
  // none of the normal state actually is guaranteed to change on an external edit
  // (like suggestion applying). This bit of state allows for us to trigger re-render
  // in those cases where the data flow + components don't do it for us. Would love
  // a better solution, as this type of forcing rendering is discouraged in React.
  const [, notifyEdited] = useState({})

  const {focusedTask: task} = useRoutePayload<CodeEditorPayload>()
  const [currentTask, setCurrentTask] = useState<FocusedTaskData | undefined>(task)

  const terminalHeaderButtonRef = useRef<HTMLButtonElement>(null)
  const panelCloseButtonRef = useRef<HTMLButtonElement>(null)
  const suggestionsHeaderButtonRef = useRef<HTMLButtonElement>(null)
  const [rightSidePanelType, setRightSidePanelType] = useState<RightPanelType>(() => {
    if (commentFixGenerationEnabled && currentTask?.type === TaskTypes.Generative) {
      return RightPanelType.GenerateFix
    } else if (hadronSuggestionsUI && currentTask) {
      return RightPanelType.Suggestions
    } else if (payload.showOverview) {
      return RightPanelType.Overview
    } else {
      return RightPanelType.None
    }
  })
  const copilotHeaderButtonRef = useRef<HTMLButtonElement>(null)
  const overviewHeaderButtonRef = useRef<HTMLButtonElement>(null)
  const {offsetTop, rootRef} = useAppOffsetTop()

  const theme = useTheme()

  const onCommitClick = useCallback(() => {
    setCommitDialogState('pending')
  }, [])

  const onCommitPanelClose = useCallback(() => {
    setCommitDialogState('closed')
  }, [])

  const onTerminalVisibilityChange = useCallback((visibility: TerminalVisibility) => {
    setTerminalVisibility(visibility)
    if (visibility === TerminalVisibility.Hidden) {
      terminalHeaderButtonRef.current?.focus()
    }
  }, [])

  const onTerminalButtonClick = useCallback(() => {
    setTerminalVisibility(visibility =>
      visibility === TerminalVisibility.Visible ? TerminalVisibility.Hidden : TerminalVisibility.Visible,
    )
  }, [])

  const onRightSidePanelClose = useCallback(() => {
    switch (rightSidePanelType) {
      case RightPanelType.Chat:
        copilotHeaderButtonRef.current?.focus()
        break
      case RightPanelType.Suggestions:
        suggestionsHeaderButtonRef.current?.focus()
        break
      case RightPanelType.Overview:
        overviewHeaderButtonRef.current?.focus()
        break
    }
    setRightSidePanelType(RightPanelType.None)
  }, [rightSidePanelType])

  const onPanelButtonClick = useCallback(
    (type: RightPanelType) => {
      const visible = rightSidePanelType !== type
      setRightSidePanelType(visible ? type : RightPanelType.None)
      if (visible) {
        setTimeout(() => {
          panelCloseButtonRef.current?.focus()
        }, 0)
      }
    },
    [rightSidePanelType],
  )

  const onCopilotButtonClick = useCallback(() => {
    onPanelButtonClick(RightPanelType.Chat)
  }, [onPanelButtonClick])

  const onSuggestionsClick = useCallback(() => {
    onPanelButtonClick(RightPanelType.Suggestions)
  }, [onPanelButtonClick])

  const onOverviewClick = useCallback(() => {
    onPanelButtonClick(RightPanelType.Overview)
  }, [onPanelButtonClick])

  const codespaceData = useCodespaces(repo, pullRequest)
  const allSuggestions: Record<string, FocusedTaskData> = {}
  if (task) {
    allSuggestions[task.sourceId.toString()] = task
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div ref={rootRef} data-hpc>
        <SplitPageLayout sx={{bg: 'canvas.inset', px: 2, pb: 2}}>
          <SplitPageLayout.Header divider="none" padding="none" sx={{bg: 'canvas.inset'}}>
            <Header
              subjectNumber={pullRequest.number}
              subjectTitle={pullRequest.title}
              onCommitClick={onCommitClick}
              onCopilotClick={onCopilotButtonClick}
              copilotHeaderButtonRef={copilotHeaderButtonRef}
              onSuggestionsClick={onSuggestionsClick}
              suggestionsHeaderButtonRef={suggestionsHeaderButtonRef}
              commitButtonRef={commitButtonRef}
              onOverviewClick={onOverviewClick}
              overviewHeaderButtonRef={overviewHeaderButtonRef}
            />
          </SplitPageLayout.Header>
          <SplitPageLayout.Content
            as="div"
            padding="none"
            width="full"
            hidden={{narrow: isTreeExpanded}}
            sx={{
              '@media print': {
                display: 'flex !important',
              },
              height: contentHeight(offsetTop),
              overflowY: 'hidden',
              bg: 'canvas.inset',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                border: '1px solid',
                borderColor: 'border.default',
                borderRadius: 2,
                bg: 'canvas.default',
                overflow: 'hidden',
                boxShadow: 2,
                mr: 2,
                height: contentHeight(offsetTop),
              }}
            >
              <div className="bgColor-default">
                <FileTree
                  {...treePaneProps}
                  textAreaId={textAreaId}
                  offsetTop={offsetTop}
                  treeToggleElement={treeToggleElement}
                />
              </div>
              <Box sx={{flexGrow: 1, overflow: 'hidden'}}>
                <Editor
                  codespaceData={codespaceData}
                  isTreeExpanded={isTreeExpanded}
                  remoteProvider={codespaceData.remoteProvider}
                  terminalHeaderButtonRef={terminalHeaderButtonRef}
                  treeToggleElement={treeToggleElement}
                  onTerminalClick={onTerminalButtonClick}
                />
              </Box>
              <TerminalPanel
                remoteProvider={codespaceData.remoteProvider}
                terminalVisibility={terminalVisibility}
                tunnelProperties={
                  codespaceData.isCodespaceReady
                    ? codespaceData.codespaceInfo?.environment_data.connection?.tunnelProperties
                    : undefined
                }
                onVisibilityChange={onTerminalVisibilityChange}
                theme={theme.theme ?? []}
                bufferCleaner={content => content}
                logger={() => {}}
                onStatusChange={() => {}}
                features={
                  terminalSuggestionsEnabled
                    ? [TerminalFeatures.AutoForwardPorts, TerminalFeatures.TerminalSuggestions]
                    : [TerminalFeatures.AutoForwardPorts]
                }
                requestCompletion={async (input: string, terminalContext?: string) => {
                  const suggestion = await getCommandSuggestion(input, terminalContext ?? '')
                  return suggestion ?? ''
                }}
              />
            </Box>
          </SplitPageLayout.Content>
          <RightSidePanel
            onClose={onRightSidePanelClose}
            panelType={rightSidePanelType}
            allSuggestions={allSuggestions}
            currentTask={currentTask}
            setCurrentTask={setCurrentTask}
            notifyEdited={notifyEdited}
          />
        </SplitPageLayout>
      </div>
      {commitDialogState !== 'closed' && (
        <CommitPanel
          dialogState={commitDialogState}
          fileStatuses={getFileStatuses()}
          setDialogState={setCommitDialogState}
          onClose={onCommitPanelClose}
          commitButtonRef={commitButtonRef}
        />
      )}
    </QueryClientProvider>
  )
}
