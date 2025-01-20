import safeStorage from '@github-ui/safe-storage'
import {CodeIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, Spinner, TabNav} from '@primer/react'
import type React from 'react'
import {Suspense, useCallback, useEffect, useState, type ReactNode} from 'react'
import {CopilotTab, type CopilotTabProps} from './CopilotTab'
import {CodespacesTab} from './CodespacesTab'
import {LocalTab, type LocalTabProps} from './LocalTab'
import {useCodeButtonData} from '../../pull-request-commits/page-data/loaders/use-code-button-data'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {GitHubEditorTab} from './GitHubEditorTab'

const safeLocalStorage = safeStorage('localStorage')

export interface CodeDropdownButtonProps {
  primary: boolean
  size?: 'small' | 'large' | 'medium'
  showGitHubEditorTab?: boolean
  showCodespacesTab?: boolean
  showCopilotTab?: boolean
  isEnterprise: boolean
  localTab?: ReactNode
  codespacesTab?: ReactNode
  copilotTab?: ReactNode
  localTabProps?: LocalTabProps
  codespacesPath?: string
  copilotTabProps?: CopilotTabProps
  editorPath?: string | undefined
}

enum ActiveTab {
  Local = 'local',
  Codespaces = 'cloud',
  Copilot = 'copilot',
  GitHubEditor = 'github-editor',
}

export function CodeDropdownButton(props: CodeDropdownButtonProps) {
  const {
    primary,
    size,
    showCodespacesTab,
    showCopilotTab,
    showGitHubEditorTab,
    isEnterprise,
    localTab,
    codespacesTab,
    copilotTab,
    localTabProps,
    copilotTabProps,
    codespacesPath,
    editorPath,
  } = props
  const localStorageDefaultTabKey = 'code-button-default-tab'
  const [activeTab, setActiveTab] = useState<string>(ActiveTab.Local)

  const onCodespacesTabClick = useCallback((ev?: React.MouseEvent) => {
    setActiveTab(ActiveTab.Codespaces)
    safeLocalStorage.setItem(localStorageDefaultTabKey, ActiveTab.Codespaces)
    ev?.preventDefault()
  }, [])

  const onLocalTabClick = useCallback((ev?: React.MouseEvent) => {
    setActiveTab(ActiveTab.Local)
    safeLocalStorage.setItem(localStorageDefaultTabKey, ActiveTab.Local)
    ev?.preventDefault()
  }, [])

  const onCopilotTabClick = useCallback((ev?: React.MouseEvent) => {
    setActiveTab(ActiveTab.Copilot)
    safeLocalStorage.setItem(localStorageDefaultTabKey, ActiveTab.Copilot)
    ev?.preventDefault()
  }, [])

  const onGitHubEditorTabClick = useCallback((ev?: React.MouseEvent) => {
    setActiveTab(ActiveTab.GitHubEditor)
    safeLocalStorage.setItem(localStorageDefaultTabKey, ActiveTab.GitHubEditor)
    ev?.preventDefault()
  }, [])

  useEffect(() => {
    const defaultActiveTab = safeLocalStorage.getItem(localStorageDefaultTabKey)
    if (defaultActiveTab === ActiveTab.Codespaces && showCodespacesTab) {
      onCodespacesTabClick()
    }
    // Only run after the initial render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tabLinkStyles = {
    height: '40px',
    width: '50%',
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderTop: 0,
    color: 'fg.muted',
    ':hover': {
      backgroundColor: 'unset',
      borderColor: 'border.default',
    },
    '&.selected': {
      backgroundColor: 'canvas.overlay',
    },
    ':not(&.selected)': {
      border: 0,
    },
  }

  const showTabNav = !isEnterprise && (showCodespacesTab || showCopilotTab)

  return (
    <ActionMenu>
      <ActionMenu.Button
        variant={primary ? 'primary' : undefined}
        leadingVisual={() => <CodeIcon className="hide-sm" />}
        size={size ? size : 'medium'}
      >
        Code
      </ActionMenu.Button>
      <ActionMenu.Overlay width="auto" align="end">
        <ActionList className="react-overview-code-button-action-list py-0">
          {showTabNav && (
            <TabNav>
              <TabNav.Link
                as={Button}
                selected={activeTab === ActiveTab.Local}
                onClick={onLocalTabClick}
                sx={{
                  ...tabLinkStyles,
                  borderLeft: 0,
                }}
              >
                Local
              </TabNav.Link>
              {!isEnterprise && showCodespacesTab && (
                <TabNav.Link
                  as={Button}
                  selected={activeTab === ActiveTab.Codespaces}
                  onClick={onCodespacesTabClick}
                  sx={{
                    ...tabLinkStyles,
                    borderRight: showCopilotTab ? null : 0,
                  }}
                >
                  Codespaces
                </TabNav.Link>
              )}
              {showCopilotTab && (
                <TabNav.Link
                  as={Button}
                  selected={activeTab === ActiveTab.Copilot}
                  onClick={onCopilotTabClick}
                  sx={{
                    ...tabLinkStyles,
                    borderRight: 0,
                  }}
                >
                  Copilot
                </TabNav.Link>
              )}
              {showGitHubEditorTab && (
                <TabNav.Link
                  as={Button}
                  selected={activeTab === ActiveTab.GitHubEditor}
                  onClick={onGitHubEditorTabClick}
                  sx={{
                    ...tabLinkStyles,
                    borderRight: 0,
                  }}
                >
                  GitHub Editor
                </TabNav.Link>
              )}
            </TabNav>
          )}
          {activeTab === ActiveTab.Local && (localTab || renderLocalTab(localTabProps))}
          {activeTab === ActiveTab.Codespaces && (codespacesTab || renderCodespacesTab(codespacesPath))}
          {activeTab === ActiveTab.Copilot && (copilotTab || renderCopilotTab(copilotTabProps))}
          {activeTab === ActiveTab.GitHubEditor && renderGitHubEditorTab(editorPath)}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

function renderLocalTab(localTabProps?: LocalTabProps) {
  if (!localTabProps) return null

  return <LocalTab {...localTabProps} />
}

function renderCopilotTab(copilotTabProps?: CopilotTabProps) {
  if (!copilotTabProps) return null

  return <CopilotTab {...copilotTabProps} />
}

function renderCodespacesTab(codespacesPath?: string) {
  if (!codespacesPath) return null

  return (
    <ErrorBoundary fallback={<span>Codespaces data failed to load.</span>}>
      <Suspense
        fallback={
          <Box sx={{display: 'flex', justifyContent: 'center'}}>
            <Spinner sx={{margin: 2}} />
          </Box>
        }
      >
        <SuspendedCodespacesTab codespacesPath={codespacesPath} />
      </Suspense>
    </ErrorBoundary>
  )
}

function SuspendedCodespacesTab(props: {codespacesPath: string}) {
  const data = useCodeButtonData().data
  return <CodespacesTab codespacesPath={props.codespacesPath} {...data} />
}

function renderGitHubEditorTab(editorPath?: string | undefined) {
  if (!editorPath) return null
  return <GitHubEditorTab editorPath={editorPath} />
}
