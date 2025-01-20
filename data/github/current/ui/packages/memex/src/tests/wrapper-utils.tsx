import {ToastContext} from '../client/components/toasts/toast-container'
import {SidePanelContext} from '../client/hooks/use-side-panel'
import {ViewTypeContext} from '../client/hooks/use-view-type'
import {ColumnsContext, ColumnsStableContext} from '../client/state-providers/columns/columns-state-provider'
import {
  ProjectDetailsContext,
  ProjectNumberContext,
  ProjectStateContext,
  SetProjectContext,
} from '../client/state-providers/memex/memex-state-provider'
import {ProjectMigrationContext} from '../client/state-providers/project-migration/project-migration-state-provider'
import {
  SuggestionsContext,
  SuggestionsStableContext,
} from '../client/state-providers/suggestions/suggestions-state-provider'
import {
  TrackedByItemsContext,
  TrackedByItemsStableContext,
} from '../client/state-providers/tracked-by-items/tracked-by-items-state-provider'
import {ArchiveStatusContext} from '../client/state-providers/workflows/archive-status-state-provider'
import {type QueryClientInitialData, QueryClientWrapper} from './test-app-wrapper'

type ContextValues = {
  ArchiveStatus: GetContextType<typeof ArchiveStatusContext>
  Columns: GetContextType<typeof ColumnsContext>
  ColumnsStable: GetContextType<typeof ColumnsStableContext>
  ProjectDetails: GetContextType<typeof ProjectDetailsContext>
  ProjectNumber: GetContextType<typeof ProjectNumberContext>
  SetProject: GetContextType<typeof SetProjectContext>
  SidePanel: GetContextType<typeof SidePanelContext>
  Suggestions: GetContextType<typeof SuggestionsContext>
  SuggestionsStable: GetContextType<typeof SuggestionsStableContext>
  ProjectMigration: GetContextType<typeof ProjectMigrationContext>
  ToastContainer: GetContextType<typeof ToastContext>
  TrackedByItems: GetContextType<typeof TrackedByItemsContext>
  TrackedByItemsStable: GetContextType<typeof TrackedByItemsStableContext>
  ProjectState: GetContextType<typeof ProjectStateContext>
  ViewType: GetContextType<typeof ViewTypeContext>
}

// Inner-most to outer-most
const contextOrder: Array<keyof ContextValues> = [
  'ViewType',
  'ToastContainer',
  'SidePanel',
  'ProjectMigration',
  'TrackedByItemsStable',
  'TrackedByItems',
  'SuggestionsStable',
  'Suggestions',
  'ArchiveStatus',
  'ColumnsStable',
  'Columns',
  'ProjectDetails',
  'ProjectNumber',
  'SetProject',
  'ProjectState',
]

type GetContextType<C extends React.Context<any>> = C extends React.Context<infer T> ? T : unknown

function wrapWithContext<T extends React.Context<any>>(
  Context: T,
  value: GetContextType<T> | undefined,
  children: JSX.Element,
) {
  if (!value) {
    return children
  }
  return <Context.Provider value={value}>{children}</Context.Provider>
}

const contextMap = {
  ArchiveStatus: ArchiveStatusContext,
  Columns: ColumnsContext,
  ColumnsStable: ColumnsStableContext,
  ProjectDetails: ProjectDetailsContext,
  ProjectNumber: ProjectNumberContext,
  SetProject: SetProjectContext,
  SidePanel: SidePanelContext,
  Suggestions: SuggestionsContext,
  SuggestionsStable: SuggestionsStableContext,
  ProjectMigration: ProjectMigrationContext,
  ToastContainer: ToastContext,
  TrackedByItems: TrackedByItemsContext,
  TrackedByItemsStable: TrackedByItemsStableContext,
  ProjectState: ProjectStateContext,
  ViewType: ViewTypeContext,
}

/**
 * A helper function that will create a wrapper component with
 * contexts provided based on what a test needs.
 * @param contextValues An object mapping a context name (like 'ColumnsStable' or 'Global') to the
 * value to provide that context in the test wrapper.
 * @returns A wrapper that can be passed to the `render` or `renderHook`
 * testing function with the appropriate contexts provided
 *
 * * @example <caption>This will stub out the `setProject`
 * API for the `setProjectContext`. When this wrapper is passed to a render / renderHook function, the component / hook
 * under test will be able to consume those contexts.</caption>
 * const setProject = stubSetProject()
 * const {result} = renderHook(() => useToggleMemexClose, {
 *   wrapper: createWrapperWithContexts({
        SetProject: setProjectContext({setProject}),
 *   })
 * })
 */
export function createWrapperWithContexts(
  contextValues: Partial<Readonly<ContextValues> & {QueryClient: QueryClientInitialData}>,
) {
  const wrapper: React.ComponentType<React.PropsWithChildren<any>> = ({children}) => {
    let wrappedChildren = <>{children}</>
    for (const contextName of contextOrder) {
      wrappedChildren = wrapWithContext(contextMap[contextName], contextValues[contextName], wrappedChildren)
    }
    if (contextValues.QueryClient) {
      wrappedChildren = (
        <QueryClientWrapper initialData={contextValues.QueryClient}>{wrappedChildren}</QueryClientWrapper>
      )
    }
    return wrappedChildren
  }

  return wrapper
}
