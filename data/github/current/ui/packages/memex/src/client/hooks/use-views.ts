import {createContext, useContext} from 'react'
import type {To} from 'react-router-dom'

import type {
  StatViewsCreateNew,
  StatViewsDelete,
  StatViewsDuplicate,
  StatViewsOpen,
  StatViewsRename,
  StatViewsReset,
  StatViewsSave,
  StatViewsSaveAsNew,
} from '../api/stats/contracts'
import type {
  PageView,
  PageViewCreateRequest,
  PageViewDeleteRequest,
  PageViewUpdateRequest,
  ViewTypeParam,
} from '../api/view/contracts'
import type {UseApiRequest} from './use-api-request'
import type {BaseViewsState, CurrentView, NormalizedPageView, ViewIsDirtyStates} from './use-view-state-reducer/types'
import type {ViewStateActions} from './use-view-state-reducer/view-state-action-types'

export const ViewContext = createContext<{
  /** all views available to view */
  views: ReadonlyArray<
    BaseViewsState['views'][number] & ViewIsDirtyStates & Pick<NormalizedPageView, 'number' | 'id' | 'name'>
  >
  /** A method that calls to create a new view with the given request params */
  createView: UseApiRequest<PageViewCreateRequest, void, PageView>
  /** A method that calls to update a view with the given request params */
  updateView: UseApiRequest<PageViewUpdateRequest, void, PageView>
  /** A method that calls to destroy a view */
  destroyView: UseApiRequest<PageViewDeleteRequest>
  /** the current view state */
  currentView: CurrentView | undefined
  /** updates the current view state to a new view */
  setCurrentViewNumber: (viewNumber: number, stats?: Omit<StatViewsOpen, 'name'>) => void
  /** If any of the states of the serverViewState are dirty, so is this */
  isViewStateDirty: boolean
  /** resets sort/search/filter/group/etc state to the serverViewState's state (as it was when it was last loaded/saved) */
  resetViewState: (viewNumber: number, stats: Omit<StatViewsReset, 'name'>) => void
  /** A method that duplicates the current memex view state to a new view (if possible) */
  duplicateCurrentViewState: (
    viewNumber: number,
    name: string | undefined,
    stats: Omit<StatViewsDuplicate, 'name'> | Omit<StatViewsSaveAsNew, 'name'>,
  ) => Promise<void>
  /** A method that calls updateView with the current state of the memex */
  saveCurrentViewState: (viewNumber: number, stats: Omit<StatViewsSave, 'name'>) => Promise<void>
  /** A method that creates a new default view, proviced that we don't have an existing request in flight */
  createNewDefaultView: (
    overrides: Partial<{layout: ViewTypeParam}>,
    stats: Omit<StatViewsCreateNew, 'name' | 'context'>,
  ) => Promise<void> | undefined
  /** Method to destory the current view, optionally calling a callback if the view was destroyed */
  destroyCurrentView: (viewNumber: number, stats: Omit<StatViewsDelete, 'name'>, cb?: () => void) => Promise<void>
  /** unsaved views after navigation */
  renameView: (viewNumber: number, newName: string, stats: Omit<StatViewsRename, 'name'>) => Promise<void>

  viewsMap: BaseViewsState['views']

  viewStateDispatch: React.Dispatch<ViewStateActions>

  /** When the groupedBy or sortedBy column data isn't loaded yet */
  missingRequiredColumnData: boolean

  /**
   * A {@link To} describing the corrent location to return back to from the configuration pages
   *
   * This describes the /new location if the user is on the configuration page in a new memex project
   * A specific view with search query, if the user last visited a specific view
   * or the base project url if no current view is set (they loaded the settings page directly)
   * */
  returnToViewLinkTo: To

  updateViewServerStates: (viewStates: Array<PageView>) => void

  updateViewPriority: (
    viewNumber: number,
    previousViewId: number | string,
    previousViewNumber?: number,
    oldPreviousViewNumber?: number,
  ) => Promise<void>
} | null>(null)

export const useViews = () => {
  const context = useContext(ViewContext)

  if (!context) {
    throw new Error('useViews must be used within a ViewProvider')
  }

  return context
}
