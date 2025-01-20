import {noop} from '@github-ui/noop'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {createContext, type ReactNode, useCallback, useContext, useMemo, useState} from 'react'
import type {PreloadFetchPolicy} from 'react-relay'
import {useLocation} from 'react-router-dom'
import type {Environment} from 'relay-runtime'

import {VIEW_COLOR_FOREGROUND_MAP} from '../components/sidebar/ColorHelper'
import {CUSTOM_VIEW_ICONS_TO_PRIMER_ICON} from '../components/sidebar/IconHelper'
import useKnownViews from '../hooks/use-known-views'
import type {
  CreateTeamDashboardSearchShortcutInput,
  createTeamViewMutation$data,
} from '../mutations/__generated__/createTeamViewMutation.graphql'
import type {
  CreateDashboardSearchShortcutInput,
  createUserViewMutation$data,
} from '../mutations/__generated__/createUserViewMutation.graphql'
import type {updateTeamViewMutation$data} from '../mutations/__generated__/updateTeamViewMutation.graphql'
import type {
  SearchShortcutColor,
  SearchShortcutIcon,
  updateUserViewMutation$data,
} from '../mutations/__generated__/updateUserViewMutation.graphql'
import type {AppPayload} from '../types/app-payload'
import {issueRegexpWithoutDomain} from '../utils/urls'
import {VALUES} from '../constants/values'
import {QUERIES} from '@github-ui/query-builder/constants/queries'
import {LABELS} from '../constants/labels'
import {VIEW_IDS} from '../constants/view-constants'
import {commitCreateTeamViewMutation} from '../mutations/create-team-view-mutation'
import {commitCreateUserViewMutation} from '../mutations/create-user-view-mutation'
import {commitUpdateTeamViewMutation} from '../mutations/update-team-view-mutation'
import {commitUpdateUserViewMutation} from '../mutations/update-user-view-mutation'

type QueryUpdateCallbacks = {
  viewId: string
  onSuccess?: (response: updateUserViewMutation$data) => void
  onError?: () => void
  relayEnvironment: Environment
}
type QueryCreateCallbacks = {
  onSuccess?: (response: createUserViewMutation$data) => void
  onError?: () => void
  relayEnvironment: Environment
}

type QueryDuplicateCallbacks = QueryCreateCallbacks & {
  viewName: string
  viewIcon: string
  viewDescription: string
  viewColor: string
  viewQuery: string
  relayEnvironment: Environment
}

type TeamQueryCreateCallbacks = {
  teamId: string
  sharedViewsConnectionId: string
  onSuccess?: (response: createTeamViewMutation$data) => void
  onError?: () => void
  relayEnvironment: Environment
}

type TeamQueryDuplicateCallbacks = TeamQueryCreateCallbacks & {
  viewName: string
  viewIcon: string
  viewDescription: string
  viewColor: string
  viewQuery: string
  relayEnvironment: Environment
}

type QueryTeamCreateCallbackInternal = {
  input: CreateTeamDashboardSearchShortcutInput
  sharedViewsConnectionId: string
  onSuccess?: (response: createTeamViewMutation$data) => void
  onError?: () => void
  relayEnvironment: Environment
}

type QueryCreateCallbackInternal = {
  input: CreateDashboardSearchShortcutInput
  onSuccess?: (response: createUserViewMutation$data) => void
  onError?: () => void
  relayEnvironment: Environment
}

type TeamQueryUpdateCallbacks = {
  viewId: string
  onSuccess?: (response: updateTeamViewMutation$data) => void
  onError?: () => void
  relayEnvironment: Environment
}

type ViewType = 'user' | 'team'

type QueryContextType = {
  // We have three different query states: the active query, the view query, and the search query.
  // Active is what's currently being searched, view is the parity of the saved view object, and
  // dirty represents the current text input of the search field.
  viewPosition: number | undefined
  setViewPosition: (q: number | undefined) => void
  isCustomView: (id: string) => boolean
  setIsEditing: (editing: boolean) => void
  isEditing: boolean
  isQueryLoading: boolean
  setIsQueryLoading: (loading: boolean) => void
  saveViewsConnectionId: string | undefined
  setSaveViewsConnectionId: (q: string) => void
  viewTeamId: string | undefined
  setViewTeamId: (teamId: string | undefined) => void
  canEditView: boolean
  setCanEditView: (canEditView: boolean) => void
  activeSearchQuery: string
  setActiveSearchQuery: (query: string) => void
  isNewView: boolean
  setIsNewView: (isNewView: boolean) => void
  executeQuery: ((query: string, fetchPolicy?: PreloadFetchPolicy) => void) | undefined
  setExecuteQuery: (executeQuery: (query: string) => void) => void
  dirtyViewId: string | undefined
  setDirtyViewId: (viewId: string | undefined) => void
  dirtyViewType: ViewType | undefined
  setDirtyViewType: (viewType: ViewType | undefined) => void
  currentViewId: string
  setCurrentViewId: (viewId: string) => void
  currentPage: number | undefined
  setCurrentPage: (page: number | undefined) => void
}

type QueryEditContextType = {
  commitUserViewCreate: ({onSuccess, onError, relayEnvironment}: QueryCreateCallbacks) => void
  commitUserViewDuplicate: ({
    onSuccess,
    onError,
    viewName,
    viewIcon,
    viewDescription,
    viewColor,
    viewQuery,
  }: QueryDuplicateCallbacks) => void
  commitUserViewEdit: ({viewId, onSuccess, onError, relayEnvironment}: QueryUpdateCallbacks) => void
  commitTeamViewCreate: ({teamId, onSuccess, onError, relayEnvironment}: TeamQueryCreateCallbacks) => void
  commitTeamViewEdit: ({viewId, onSuccess, onError, relayEnvironment}: TeamQueryUpdateCallbacks) => void
  commitTeamViewDuplicate: ({
    teamId,
    onSuccess,
    onError,
    viewName,
    viewIcon,
    viewDescription,
    viewColor,
    viewQuery,
    relayEnvironment,
  }: TeamQueryDuplicateCallbacks) => void
  dirtySearchQuery: string | null
  setDirtySearchQuery: (q: string) => void
  dirtyTitle: string
  setDirtyTitle: (title: string) => void
  dirtyDescription: string
  setDirtyDescription: (description: string) => void
  dirtyViewIcon: string
  setDirtyViewIcon: (icon: string) => void
  dirtyViewColor: string
  setDirtyViewColor: (color: string) => void
  bulkJobId: string | null
  setBulkJobId: (bulkJobId: string | null) => void
}

type QueryContextProviderType = {
  children: ReactNode
}

const QueryContext = createContext<QueryContextType>({
  viewPosition: undefined,
  setViewPosition: noop,
  isCustomView: (id: string) => id === '',
  isEditing: false,
  setIsEditing: noop,
  isQueryLoading: false,
  setIsQueryLoading: noop,
  saveViewsConnectionId: undefined,
  setSaveViewsConnectionId: noop,
  viewTeamId: undefined,
  setViewTeamId: noop,
  activeSearchQuery: '',
  setActiveSearchQuery: noop,
  canEditView: false,
  setCanEditView: noop,
  isNewView: false,
  setIsNewView: noop,
  executeQuery: undefined,
  setExecuteQuery: noop,
  dirtyViewId: undefined,
  setDirtyViewId: noop,
  currentViewId: VIEW_IDS.empty,
  setCurrentViewId: noop,
  dirtyViewType: undefined,
  setDirtyViewType: noop,
  currentPage: undefined,
  setCurrentPage: noop,
})

const QueryEditContext = createContext<QueryEditContextType>({
  commitUserViewCreate: noop,
  commitUserViewEdit: noop,
  commitUserViewDuplicate: noop,
  commitTeamViewCreate: noop,
  commitTeamViewEdit: noop,
  commitTeamViewDuplicate: noop,
  dirtySearchQuery: '',
  setDirtySearchQuery: noop,
  dirtyTitle: '',
  setDirtyTitle: noop,
  dirtyDescription: '',
  setDirtyDescription: noop,
  dirtyViewIcon: '',
  setDirtyViewIcon: noop,
  dirtyViewColor: '',
  setDirtyViewColor: noop,
  bulkJobId: null,
  setBulkJobId: noop,
})

const useInitialViewId = () => {
  const {scoped_repository} = useAppPayload<AppPayload>()
  const {pathname} = useLocation()
  if (pathname.match(issueRegexpWithoutDomain)) {
    return scoped_repository ? VIEW_IDS.repository : VIEW_IDS.assignedToMe
  }
  const id = pathname.split('/').pop()
  return id === 'issues' || !id ? VIEW_IDS.empty : id
}

export function QueryContextProvider({children}: QueryContextProviderType) {
  const {
    initial_view_content: {team_id: initialTeamId, can_edit_view: initialCanEditView},
  } = useAppPayload<AppPayload>()

  const {addToast} = useToastContext()
  const {search} = useLocation()
  const urlSearchParams = new URLSearchParams(search)
  const queryParam = urlSearchParams.get('q')
  const urlQuery = !queryParam || queryParam === '' ? QUERIES.defaultRepoLevelOpen : queryParam

  const [canEditView, setCanEditView] = useState(initialCanEditView)
  const [dirtyViewQuery, setDirtyViewQuery] = useState<string | null>(null)
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>(urlQuery)
  const [viewTeamId, setViewTeamId] = useState<string | undefined>(initialTeamId)
  const [viewPosition, setViewPosition] = useState<number | undefined>(undefined)
  const [saveViewsConnectionId, setSaveViewsConnectionId] = useState<string | undefined>(undefined)
  const [dirtyTitle, setDirtyTitle] = useState<string>('')
  const [dirtyDescription, setDirtyDescription] = useState<string>('')
  const [dirtyViewIcon, setDirtyViewIcon] = useState<string>(VALUES.defaultViewIcon)
  const [dirtyViewColor, setDirtyViewColor] = useState<string>(VALUES.defaultViewColor)
  const [dirtyViewId, setDirtyViewId] = useState<string | undefined>(undefined)
  const [currentViewId, setCurrentViewId] = useState<string>(useInitialViewId())
  const [dirtyViewType, setDirtyViewType] = useState<ViewType | undefined>(undefined)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false)
  const [isNewView, setIsNewView] = useState<boolean>(false)
  const {knownViews} = useKnownViews()
  const [currentPage, setCurrentPage] = useState<number | undefined>()
  const [executeQuery, setExecuteQuery] = useState<((query: string) => void) | undefined>()

  const [bulkJobId, setBulkJobId] = useLocalStorage<string | null>(VALUES.localStorageKeyBulkUpdateIssues, null)

  const isCustomView = useCallback(
    (viewId: string | undefined) => {
      if (!viewId) return false
      return knownViews.findIndex(s => s.id === viewId) === -1
    },
    [knownViews],
  )

  const commitUserViewEdit = useCallback(
    ({viewId, onSuccess, onError, relayEnvironment}: QueryUpdateCallbacks) => {
      if (isCustomView(viewId)) {
        commitUpdateUserViewMutation({
          environment: relayEnvironment,
          input: {
            shortcutId: viewId,
            query: dirtyViewQuery,
            name: dirtyTitle,
            description: dirtyDescription,
            icon: dirtyViewIcon as SearchShortcutIcon,
            color: dirtyViewColor as SearchShortcutColor,
          },
          onError: () => {
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: LABELS.views.updateError,
            })
            onError && onError()
          },
          onCompleted: (response: updateUserViewMutation$data) => {
            onSuccess && onSuccess(response)
          },
        })
      }
    },
    [isCustomView, dirtyViewQuery, dirtyTitle, dirtyDescription, dirtyViewIcon, dirtyViewColor, addToast],
  )

  const commitTeamViewEdit = useCallback(
    ({viewId, onSuccess, onError, relayEnvironment}: TeamQueryUpdateCallbacks) => {
      if (isCustomView(viewId)) {
        commitUpdateTeamViewMutation({
          environment: relayEnvironment,
          input: {
            shortcutId: viewId,
            query: dirtyViewQuery,
            name: dirtyTitle,
            description: dirtyDescription,
            icon: dirtyViewIcon as SearchShortcutIcon,
            color: dirtyViewColor as SearchShortcutColor,
          },
          onError: () => {
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: LABELS.views.updateError,
            })
            onError && onError()
          },
          onCompleted: (response: updateTeamViewMutation$data) => {
            onSuccess && onSuccess(response)
          },
        })
      }
    },
    [isCustomView, dirtyViewQuery, dirtyTitle, dirtyDescription, dirtyViewIcon, dirtyViewColor, addToast],
  )

  const internalCommitViewCreate = useCallback(
    ({input, onSuccess, onError, relayEnvironment}: QueryCreateCallbackInternal) => {
      if (!saveViewsConnectionId) {
        onError && onError()
        return
      }
      input.name = input.name || LABELS.views.defaultName
      input.query = input.query === null || input.query === undefined ? dirtyViewQuery : input.query

      return commitCreateUserViewMutation({
        environment: relayEnvironment,
        input,
        connectionId: saveViewsConnectionId,
        onError: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: LABELS.views.createError,
          })
          onError && onError()
        },
        onCompleted: response => {
          onSuccess && onSuccess(response)
        },
      })
    },
    [dirtyViewQuery, saveViewsConnectionId, addToast],
  )

  const internalCommitTeamViewCreate = useCallback(
    ({input, sharedViewsConnectionId, onSuccess, onError, relayEnvironment}: QueryTeamCreateCallbackInternal) => {
      if (!sharedViewsConnectionId) {
        onError && onError()
        return
      }
      input.name = input.name || LABELS.views.defaultName
      input.query = input.query === null || input.query === undefined ? dirtyViewQuery : input.query

      return commitCreateTeamViewMutation({
        environment: relayEnvironment,
        input,
        connectionId: sharedViewsConnectionId,
        onError: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: LABELS.views.createError,
          })
          onError && onError()
        },
        onCompleted: response => {
          onSuccess && onSuccess(response)
        },
      })
    },
    [dirtyViewQuery, addToast],
  )

  const commitTeamViewCreate = useCallback(
    ({onSuccess, onError, teamId, sharedViewsConnectionId, relayEnvironment}: TeamQueryCreateCallbacks) => {
      return internalCommitTeamViewCreate({
        input: {
          teamId,
          query: VALUES.defaultQueryForNewView,
          name: LABELS.views.defaultName,
          searchType: 'ISSUES',
          icon: VALUES.defaultViewIcon as SearchShortcutIcon,
          color: VALUES.defaultViewColor as SearchShortcutColor,
        },
        sharedViewsConnectionId,
        onSuccess,
        onError,
        relayEnvironment,
      })
    },
    [internalCommitTeamViewCreate],
  )

  const commitTeamViewDuplicate = useCallback(
    ({
      teamId,
      sharedViewsConnectionId,
      onSuccess,
      onError,
      viewName,
      viewIcon,
      viewColor,
      viewDescription,
      viewQuery,
      relayEnvironment,
    }: TeamQueryDuplicateCallbacks) => {
      return internalCommitTeamViewCreate({
        input: {
          teamId,
          query: viewQuery,
          searchType: 'ISSUES',
          name: `${viewName} copy`,
          description: viewDescription,
          color: (VIEW_COLOR_FOREGROUND_MAP[viewColor] ? viewColor : VALUES.defaultViewColor) as SearchShortcutColor,
          icon: (CUSTOM_VIEW_ICONS_TO_PRIMER_ICON[viewIcon] ? viewIcon : VALUES.defaultViewIcon) as SearchShortcutIcon,
        },
        sharedViewsConnectionId,
        onSuccess,
        onError,
        relayEnvironment,
      })
    },
    [internalCommitTeamViewCreate],
  )

  const commitUserViewCreate = useCallback(
    ({onSuccess, onError, relayEnvironment}: QueryCreateCallbacks) => {
      return internalCommitViewCreate({
        input: {
          query: VALUES.defaultQueryForNewView,
          name: LABELS.views.defaultName,
          searchType: 'ISSUES',
          icon: VALUES.defaultViewIcon as SearchShortcutIcon,
          color: VALUES.defaultViewColor as SearchShortcutColor,
        },
        onSuccess,
        onError,
        relayEnvironment,
      })
    },
    [internalCommitViewCreate],
  )

  const commitUserViewDuplicate = useCallback(
    ({
      onSuccess,
      onError,
      viewName,
      viewIcon,
      viewColor,
      viewDescription,
      viewQuery,
      relayEnvironment,
    }: QueryDuplicateCallbacks) => {
      return internalCommitViewCreate({
        input: {
          query: viewQuery,
          name: `${viewName} copy`,
          description: viewDescription,
          color: (VIEW_COLOR_FOREGROUND_MAP[viewColor] ? viewColor : VALUES.defaultViewColor) as SearchShortcutColor,
          icon: (CUSTOM_VIEW_ICONS_TO_PRIMER_ICON[viewIcon] ? viewIcon : VALUES.defaultViewIcon) as SearchShortcutIcon,
          searchType: 'ISSUES',
        },
        onSuccess,
        onError,
        relayEnvironment,
      })
    },
    [internalCommitViewCreate],
  )

  const queryContextValue = useMemo<QueryContextType>(() => {
    return {
      isEditing,
      setIsEditing,
      isQueryLoading,
      setIsQueryLoading,
      viewPosition,
      setViewPosition,
      isCustomView,
      saveViewsConnectionId,
      setSaveViewsConnectionId,
      viewTeamId,
      setViewTeamId,
      activeSearchQuery,
      setActiveSearchQuery,
      canEditView,
      setCanEditView,
      isNewView,
      setIsNewView,
      executeQuery,
      setExecuteQuery,
      dirtyViewId,
      setDirtyViewId,
      dirtyViewType,
      setDirtyViewType,
      currentViewId,
      setCurrentViewId,
      currentPage,
      setCurrentPage,
    }
  }, [
    isEditing,
    isQueryLoading,
    viewPosition,
    isCustomView,
    saveViewsConnectionId,
    viewTeamId,
    activeSearchQuery,
    canEditView,
    isNewView,
    executeQuery,
    dirtyViewId,
    dirtyViewType,
    currentViewId,
    currentPage,
  ])

  const queryEditContextValue = useMemo<QueryEditContextType>(() => {
    return {
      commitUserViewCreate,
      commitUserViewDuplicate,
      commitUserViewEdit,
      commitTeamViewCreate,
      commitTeamViewEdit,
      commitTeamViewDuplicate,
      dirtySearchQuery: dirtyViewQuery,
      setDirtySearchQuery: setDirtyViewQuery,
      dirtyDescription,
      setDirtyDescription,
      dirtyViewIcon,
      setDirtyViewIcon,
      dirtyTitle,
      setDirtyTitle,
      dirtyViewColor,
      setDirtyViewColor,
      dirtyViewId,
      setDirtyViewId,
      dirtyViewType,
      setDirtyViewType,
      bulkJobId,
      setBulkJobId,
    }
  }, [
    commitUserViewCreate,
    commitUserViewDuplicate,
    commitUserViewEdit,
    commitTeamViewCreate,
    commitTeamViewEdit,
    commitTeamViewDuplicate,
    dirtyViewQuery,
    dirtyDescription,
    dirtyViewIcon,
    dirtyTitle,
    dirtyViewColor,
    dirtyViewId,
    dirtyViewType,
    bulkJobId,
    setBulkJobId,
  ])

  return (
    <QueryContext.Provider value={queryContextValue}>
      <QueryEditContext.Provider value={queryEditContextValue}>{children}</QueryEditContext.Provider>
    </QueryContext.Provider>
  )
}

export function useQueryContext() {
  return useContext(QueryContext)
}

export function useQueryEditContext() {
  return useContext(QueryEditContext)
}
