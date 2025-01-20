import {themeGet, useTheme} from '@primer/react'
import {memo, useCallback, useEffect, useMemo} from 'react'
import type {Environment} from 'react-relay'
import {
  createBrowserRouter,
  defer,
  Outlet,
  type RouteObject,
  RouterProvider,
  useMatch,
  useRouteError,
} from 'react-router-dom'
import {createGlobalStyle} from 'styled-components'

import {CommandProvider} from './commands/command-provider'
import type {CommandTreeSpec, ItemSpec} from './commands/command-tree'
import {useCommands} from './commands/hook'
import {AutomationPage} from './components/automation/automation-page'
import {ProjectErrorFallback} from './components/error-boundaries/project-error-fallback'
import {IssueCreatorProvider} from './components/issue-creator'
import {LiveUpdate} from './components/live-update'
import {PresenceUsersProvider} from './components/presence-avatars'
import {ProjectMigrationOverlayView} from './components/project-migration-overlay-view'
import {SidePanel} from './components/side-panel'
import {TemplateDialogWrapper} from './components/template-dialog/template-dialog'
import ToastContainer from './components/toasts/toast-container'
import {TopBar} from './components/top-bar'
import {MemexTitle} from './components/top-bar/memex-title'
import {RouteTitle} from './components/top-bar/route-title'
import {TrackPathChanges} from './components/track-path-changes'
import {ViewsProvider} from './components/views'
import {getEnabledFeatures} from './helpers/feature-flags'
import {getInitialState} from './helpers/initial-state'
import {requireAdminRoute, requireAutomationEnabledRoute, requirePermittedRoute} from './helpers/route-helper'
import {filterFalseyValues} from './helpers/util'
import {ViewerPrivileges} from './helpers/viewer-privileges'
import {BulkUpdateItemsProvider} from './hooks/use-bulk-update-items-context'
import {useProjectViewRouteMatch} from './hooks/use-project-view-route-match'
import {useRootElement} from './hooks/use-root-element'
import {useViews} from './hooks/use-views'
import {ArchivePage} from './pages/archive/components/archive-page'
import {InsightsChartView} from './pages/insights/components/insights-chart-view'
import {InsightsPage} from './pages/insights/components/insights-page'
import {useInsightsEnabledFeatures} from './pages/insights/hooks/use-insights-features'
import {AccessSettingsView} from './pages/settings/components/access-settings/access-settings-view'
import {ColumnSettingsView} from './pages/settings/components/column-settings-view'
import {GeneralSettingsView} from './pages/settings/components/general-settings-view'
import {SettingsPage} from './pages/settings/components/settings-page'
import {ProjectView} from './project-view'
import {usePrefetchCollaborators} from './queries/collaborators'
import {usePrefetchOrganizationAccessRole} from './queries/organization-access'
import {useNavigate} from './router'
import {useProjectRouteParams} from './router/use-project-route-params'
import {
  Origin404Redirect,
  PROJECT_ARCHIVE_ROUTE,
  PROJECT_INSIGHTS_NUMBER_ROUTE,
  PROJECT_INSIGHTS_ROUTE,
  PROJECT_ROUTE,
  PROJECT_SETTINGS_ACCESS_ROUTE,
  PROJECT_SETTINGS_FIELD_ROUTE,
  PROJECT_SETTINGS_ROUTE,
  PROJECT_VIEW_ROUTE,
  PROJECT_WORKFLOW_CLIENT_ID_ROUTE,
  PROJECT_WORKFLOWS_ROUTE,
} from './routes'
import {ChartStateProvider} from './state-providers/charts/chart-state-provider'
import {ColumnsStateProvider} from './state-providers/columns/columns-state-provider'
import {CreatedWithTemplateMemexProvider} from './state-providers/created-with-template-memex/created-with-template-memex-provider'
import {ActivePagesProvider} from './state-providers/data-refresh/use-active-pages'
import {HistoryProvider} from './state-providers/history/history'
import {MemexStateProvider} from './state-providers/memex/memex-state-provider'
import {AddFieldModalContextProvider} from './state-providers/modals/add-field-modal-state-provider'
import {ProjectMigrationStateProvider} from './state-providers/project-migration/project-migration-state-provider'
import {RelayProvider} from './state-providers/relay'
import {RepositoriesStateProvider} from './state-providers/repositories/repositories-state-provider'
import {SuggestionsStateProvider} from './state-providers/suggestions/suggestions-state-provider'
import {TemplateDialogStateProvider} from './state-providers/template-dialog/template-dialog-state-provider'
import {TrackedByItemsStateProvider} from './state-providers/tracked-by-items/tracked-by-items-state-provider'
import {UserNoticesStateProvider} from './state-providers/user-notices/user-notices-provider'
import {ViewOptionsMenuRefContextProvider} from './state-providers/view-options/use-view-options-menu-ref'
import {ArchiveStatusProvider} from './state-providers/workflows/archive-status-state-provider'
import {WorkflowsStateProvider} from './state-providers/workflows/workflows-state-provider'

/**
 * CSS that makes scrollbars black
 */

const GlobalStyle = createGlobalStyle<{$colorScheme?: string}>`
  html {
    color-scheme: ${props => (props.$colorScheme?.startsWith('dark') ? 'dark' : 'light')};
  }

  /* stylelint-disable-next-line selector-no-qualifying-type */
  body.is-dragging {
    overflow-x: hidden;
  }

  /* stylelint-disable-next-line selector-no-qualifying-type */
  body.is-dragging,
  body.is-dragging *,
  body.is-resizing,
  body.is-resizing * {
    user-select: none !important;
  }

  /* stylelint-disable-next-line selector-no-qualifying-type */
  body.is-dragging,
  body.is-dragging * {
    cursor: grabbing !important;

    & a:hover {
      color: inherit;
      text-decoration: inherit;
    }
  }

  /* stylelint-disable-next-line selector-no-qualifying-type */
  body.is-resizing-slicer-panel * {
    cursor: col-resize;

    /* stylelint-disable-next-line selector-max-id, selector-no-qualifying-type, selector-max-specificity */
    & #memex-root {
      pointer-events: none;

      /* stylelint-disable-next-line selector-max-compound-selectors, selector-max-id, selector-no-qualifying-type, selector-max-specificity */
      #slicer-panel-resizer-sash {
        pointer-events: auto;
      }
    }
  }

  /* stylelint-disable-next-line selector-max-id, selector-max-specificity */
  #memex-root {
    background-color: ${themeGet('colors.canvas.default')};

     /* stylelint-disable-next-line selector-max-id, selector-max-specificity, selector-no-qualifying-type */
    mark.find-in-project-highlight {
      /* stylelint-disable-next-line color-named */
      background-color: yellow;
       /* stylelint-disable-next-line color-named */
      color: black;
    }
  }

  code {
    font-size: 0.9em;
    background-color: ${themeGet('colors.neutral.muted')};
    /* stylelint-disable-next-line primer/spacing */
    padding: 0.1em;
    /* stylelint-disable-next-line primer/borders */
    border-radius: 0.25em;
  }

  .hide-copy-project-button-in-memex {
    display: none;
  }
`

function RootBoundary() {
  const error = useRouteError()

  useEffect(() => {
    if (!(error instanceof Error)) return
    const timeout = setTimeout(() => {
      throw error
    })
    return () => {
      clearTimeout(timeout)
    }
  }, [error])

  if (error) {
    return <ProjectErrorFallback />
  }

  return null
}

const AppRoutes = memo(function AppRoutes({children = null}: {children?: React.ReactNode}) {
  const {isInsightsChartViewEnabled} = useInsightsEnabledFeatures()
  const {isOrganization} = getInitialState()
  const prefetchOrganizationAccessRole = usePrefetchOrganizationAccessRole()
  const prefetchCollaborators = usePrefetchCollaborators()
  const requireInsightsChartViewEnabledRoute = useCallback(
    (obj: RouteObject) => {
      if (isInsightsChartViewEnabled) return obj
      return null
    },
    [isInsightsChartViewEnabled],
  )

  const router = useMemo(() => {
    const projectViewElements = (
      /* Currently, undo history is only supported in views (ie, settings changes are not undoable). */
      <HistoryProvider>
        {/* To avoid nested PageLayouts with multiple `main` elements, we only render the side panel on main project views. */}
        <SidePanel
          mainAppContent={
            <>
              <TopBar isProjectPath>
                <MemexTitle />
              </TopBar>
              <ProjectView />
            </>
          }
        />
      </HistoryProvider>
    )
    const automationPageElement = (
      <>
        <TopBar>
          <RouteTitle title="Workflows" />
        </TopBar>
        <AutomationPage />
      </>
    )
    return createBrowserRouter([
      {
        path: PROJECT_ROUTE.path,
        errorElement: <RootBoundary />,
        element: (
          <AppContainer>
            <NavigationCommands />
            <LiveUpdate />
            <TemplateDialogWrapper />
            <ProjectMigrationOverlayView />
            <Outlet />
            <TrackPathChanges />
            {children}
          </AppContainer>
        ),
        children: filterFalseyValues([
          {
            path: PROJECT_ROUTE.path,
            element: projectViewElements,
          },
          {
            path: PROJECT_VIEW_ROUTE.path,
            element: projectViewElements,
          },
          requirePermittedRoute({
            children: filterFalseyValues([
              {
                path: PROJECT_ARCHIVE_ROUTE.path,
                element: (
                  <>
                    <TopBar>
                      <RouteTitle title="Archive" />
                    </TopBar>
                    <ArchivePage />
                  </>
                ),
              },
              {
                path: PROJECT_SETTINGS_ROUTE.path,
                element: (
                  <>
                    <TopBar>
                      <RouteTitle title="Settings" />
                    </TopBar>
                    <SettingsPage />
                  </>
                ),
                children: filterFalseyValues([
                  requireAdminRoute({
                    path: PROJECT_SETTINGS_ACCESS_ROUTE.path,
                    element: <AccessSettingsView />,
                    loader: async () => {
                      return defer({
                        collaborators: prefetchCollaborators(),
                        organizationAccessRole: isOrganization ? await prefetchOrganizationAccessRole() : null,
                      })
                    },
                  }),
                  {
                    path: PROJECT_SETTINGS_FIELD_ROUTE.path,
                    element: <ColumnSettingsView />,
                  },

                  {
                    path: PROJECT_SETTINGS_ROUTE.path,
                    element: <GeneralSettingsView />,
                  },
                ]),
              },
              requireAutomationEnabledRoute({
                children: filterFalseyValues([
                  {
                    path: PROJECT_WORKFLOWS_ROUTE.path,
                    element: automationPageElement,
                  },
                  {
                    path: PROJECT_WORKFLOW_CLIENT_ID_ROUTE.path,
                    element: automationPageElement,
                  },
                ]),
              }),
              requirePermittedRoute({
                children: filterFalseyValues([
                  requireInsightsChartViewEnabledRoute({
                    path: PROJECT_INSIGHTS_ROUTE.path,
                    element: (
                      <>
                        <TopBar>
                          <RouteTitle title="Insights" />
                        </TopBar>

                        <InsightsPage />
                      </>
                    ),
                    children: [
                      {
                        path: PROJECT_INSIGHTS_ROUTE.path,
                        element: <InsightsChartView />,
                      },
                      {
                        path: PROJECT_INSIGHTS_NUMBER_ROUTE.path,
                        element: <InsightsChartView />,
                      },
                    ],
                  }),
                ]),
              }),
            ]),
          }),
          {path: '*', element: <Origin404Redirect />},
        ]),
      },
    ])
  }, [
    children,
    isOrganization,
    prefetchCollaborators,
    prefetchOrganizationAccessRole,
    requireInsightsChartViewEnabledRoute,
  ])

  return <RouterProvider router={router} />
})

export const App = memo(function App({children = null}: {children?: React.ReactNode}) {
  return (
    <MemexStateProvider>
      <AppRoutes>{children}</AppRoutes>
    </MemexStateProvider>
  )
})

/**
 * Container component for the application, to be used inside of a router.
 * Includes the application context and DOM nodes present for each route.
 */
export const AppContainer: React.FC<{children: React.ReactNode; environment?: Environment}> = ({
  children,
  environment,
}) => {
  useSetRootThemeDataAttributes()
  const {colorScheme} = useTheme()

  return (
    <>
      <GlobalStyle $colorScheme={colorScheme} />
      <div role="region" id="__primerPortalRoot__" style={{zIndex: 10, position: 'absolute', width: '100%'}} />
      <RelayProvider environment={environment}>
        <ToastContainer>
          <PresenceUsersProvider>
            <RepositoriesStateProvider>
              <ColumnsStateProvider>
                <CommandProvider>
                  <ActivePagesProvider>
                    <BulkUpdateItemsProvider>
                      <ViewsProvider>
                        <ArchiveStatusProvider>
                          <SuggestionsStateProvider>
                            <TrackedByItemsStateProvider>
                              <WorkflowsStateProvider>
                                <ChartStateProvider>
                                  <ViewOptionsMenuRefContextProvider>
                                    <AddFieldModalContextProvider>
                                      <ProjectMigrationStateProvider>
                                        <UserNoticesStateProvider>
                                          <TemplateDialogStateProvider>
                                            <CreatedWithTemplateMemexProvider>
                                              <IssueCreatorProvider>{children}</IssueCreatorProvider>
                                            </CreatedWithTemplateMemexProvider>
                                          </TemplateDialogStateProvider>
                                        </UserNoticesStateProvider>
                                      </ProjectMigrationStateProvider>
                                    </AddFieldModalContextProvider>
                                  </ViewOptionsMenuRefContextProvider>
                                </ChartStateProvider>
                              </WorkflowsStateProvider>
                            </TrackedByItemsStateProvider>
                          </SuggestionsStateProvider>
                        </ArchiveStatusProvider>
                      </ViewsProvider>
                    </BulkUpdateItemsProvider>
                  </ActivePagesProvider>
                </CommandProvider>
              </ColumnsStateProvider>
            </RepositoriesStateProvider>
          </PresenceUsersProvider>
        </ToastContainer>
      </RelayProvider>
    </>
  )
}

const NavigationCommands = memo(function NavigationCommands() {
  const navigate = useNavigate()
  const {isReadonly} = ViewerPrivileges()

  const {isInsightsEnabled} = useInsightsEnabledFeatures()
  const {returnToViewLinkTo} = useViews()
  const {projectViewRoutesMatch} = useProjectViewRouteMatch()
  const settingsRouteMatch = useMatch(PROJECT_SETTINGS_ROUTE.pathWithChildPaths)
  const workflowsRouteMatch = useMatch(PROJECT_WORKFLOWS_ROUTE.pathWithChildPaths)
  const insightsRouteMatch = useMatch(PROJECT_INSIGHTS_ROUTE.pathWithChildPaths)
  const archiveRouteMatch = useMatch(PROJECT_ARCHIVE_ROUTE.pathWithChildPaths)
  const {memex_automation_enabled} = getEnabledFeatures()
  const {ownerIdentifier, ownerType, projectNumber} = useProjectRouteParams()
  useCommands(() => {
    const items: Array<ItemSpec> = []
    const commandSpec: CommandTreeSpec = ['n', 'Navigate to...', items]

    if (!projectViewRoutesMatch) {
      items.push(['p', 'Navigate to project views', 'navigate', () => navigate(returnToViewLinkTo)])
    }

    if (!isReadonly && !settingsRouteMatch) {
      items.push([
        's',
        'Navigate to settings',
        'navigate',
        () => navigate(PROJECT_SETTINGS_ROUTE.generatePath({ownerType, ownerIdentifier, projectNumber})),
      ])
    }

    if (!isReadonly && !workflowsRouteMatch && memex_automation_enabled) {
      items.push([
        'w',
        'Navigate to workflows',
        'navigate',
        () => navigate(PROJECT_WORKFLOWS_ROUTE.generatePath({ownerType, ownerIdentifier, projectNumber})),
      ])
    }

    if (!isReadonly && isInsightsEnabled && !insightsRouteMatch) {
      items.push([
        'i',
        'Navigate to insights',
        'navigate',
        () => navigate(PROJECT_INSIGHTS_ROUTE.generatePath({ownerType, ownerIdentifier, projectNumber})),
      ])
    }

    if (!isReadonly && !archiveRouteMatch) {
      items.push([
        'a',
        'Navigate to archive',
        'navigate',
        () => navigate(PROJECT_ARCHIVE_ROUTE.generatePath({ownerType, ownerIdentifier, projectNumber})),
      ])
    }

    if (items.length === 0) return null

    return commandSpec
  }, [
    projectViewRoutesMatch,
    isReadonly,
    settingsRouteMatch,
    workflowsRouteMatch,
    memex_automation_enabled,
    isInsightsEnabled,
    insightsRouteMatch,
    archiveRouteMatch,
    navigate,
    returnToViewLinkTo,
    ownerType,
    ownerIdentifier,
    projectNumber,
  ])

  return null
})

/**
 * Given the current theme, adds a data attribute to an
 * element with the current applied color scheme, if
 * a valid one was applied
 */
const useSetRootThemeDataAttributes = () => {
  const {resolvedColorScheme} = useTheme()
  const rootElement = useRootElement()
  useEffect(() => {
    if (rootElement && resolvedColorScheme) {
      rootElement.setAttribute('data-current-theme-color-scheme', resolvedColorScheme)
    }
  }, [resolvedColorScheme, rootElement])
}
