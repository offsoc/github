import {Filter, type FilterQuery, type FilterProvider, ValidationMessage} from '@github-ui/filter'
import {
  AssigneeFilterProvider,
  AuthorFilterProvider,
  ClosedFilterProvider,
  CommenterFilterProvider,
  CommentsFilterProvider,
  CreatedFilterProvider,
  InteractionsFilterProvider,
  InvolvesFilterProvider,
  IsFilterProvider,
  LabelFilterProvider,
  MentionsFilterProvider,
  MilestoneFilterProvider,
  ProjectFilterProvider,
  SortFilterProvider,
  StateFilterProvider,
  TeamFilterProvider,
  TypeFilterProvider,
  ReasonFilterProvider,
  RepositoryFilterProvider,
  LinkedFilterProvider,
  UpdatedFilterProvider,
  ArchivedFilterProvider,
  MergedFilterProvider,
  ReactionsFilterProvider,
  DraftFilterProvider,
  ReviewFilterProvider,
  LanguageFilterProvider,
  OrgFilterProvider,
  ReviewRequestedFilterProvider,
  UserFilterProvider,
  TeamReviewRequestedFilterProvider,
  ShaFilterProvider,
  BaseFilterProvider,
  HeadFilterProvider,
  StatusFilterProvider,
  UserReviewRequestedFilterProvider,
  ReviewedByFilterProvider,
} from '@github-ui/filter/providers'

import {CreateIssueButton} from '@github-ui/issue-create/CreateIssueButton'
import {HOTKEYS} from '@github-ui/issue-viewer/Hotkeys'

import {noop} from '@github-ui/noop'

import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import {ModifierKeys, useKeyPress} from '@github-ui/use-key-press'
import {useNavigate} from '@github-ui/use-navigate'
import {useUser} from '@github-ui/use-user'
import {MilestoneIcon, TagIcon} from '@primer/octicons-react'
import {Button, FormControl} from '@primer/react'
import {type ReactNode, useCallback, useEffect, useMemo, useRef, useTransition, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'
import {useLocation, useParams} from 'react-router-dom'

import {
  ASSIGNED_TO_ME_VIEW,
  CUSTOM_VIEW,
  KNOWN_VIEWS,
  REPOSITORY_VIEW,
  DEFAULT_QUERY,
} from '../../constants/view-constants'
import {useHyperlistAnalytics} from '../../hooks/use-hyperlist-analytics'
import type {AppPayload} from '../../types/app-payload'
import {
  isNewIssuePath,
  isCustomViewIssuePathForRepo,
  cleanCustomViewIssueUrl,
  searchUrl,
  validateSearchQuery,
} from '../../utils/urls'
import {isTypeFilterProvider} from '../../utils/type-predicates'
import type {SearchBarCurrentViewFragment$key} from './__generated__/SearchBarCurrentViewFragment.graphql'
import {BUTTON_LABELS} from '../../constants/buttons'
import {LABELS} from '../../constants/labels'
import {MESSAGES} from '../../constants/messages'
import {useQueryContext, useQueryEditContext} from '../../contexts/QueryContext'
import {useAppNavigate} from '../../hooks/use-app-navigate'
import {commitRemoveTeamViewMutation} from '../../mutations/remove-team-view-mutation'
import {commitRemoveUserViewMutation} from '../../mutations/remove-user-view-mutation'
import {IS_FILTER_PROVIDER_VALUES} from '../../constants/values'
import type {SearchBarRepositoryFragment$key} from './__generated__/SearchBarRepositoryFragment.graphql'
import styles from './SearchBar.module.css'
import {isFeatureEnabled} from '@github-ui/feature-flags'

type SearchBarProps = {
  currentView: SearchBarCurrentViewFragment$key
  currentRepository: SearchBarRepositoryFragment$key | null
  queryFromCustomView?: string | null
}

const DynamicWrapper = ({editing, children}: {editing: boolean; children: ReactNode}) => {
  return editing ? <FormControl>{children}</FormControl> : <>{children}</>
}

export function SearchBar({currentView, currentRepository, queryFromCustomView}: SearchBarProps) {
  const navigate = useNavigate()
  const ref = useRef<HTMLInputElement>(null)

  const {
    setActiveSearchQuery,
    isCustomView,
    setIsEditing,
    isEditing,
    viewTeamId,
    setIsQueryLoading,
    executeQuery,
    isNewView,
    setIsNewView,
    dirtyViewId,
    setDirtyViewId,
    dirtyViewType,
    setDirtyViewType,
    setCurrentPage,
  } = useQueryContext()

  const [validationMessage, setValidationMessage] = useState<string[]>([])

  const {issue_types} = useFeatureFlags()

  const issues_advanced_search = isFeatureEnabled('issues_advanced_search')

  const {search, pathname} = useLocation()

  const urlSearchParams = new URLSearchParams(search)
  const urlQuery = urlSearchParams.get('q')

  const {scoped_repository, current_user_settings, paste_url_link_as_plain_text} = useAppPayload<AppPayload>()
  const [, startTransition] = useTransition()

  const relayEnvironment = useRelayEnvironment()
  const {navigateToView} = useAppNavigate()

  // GenericView is a union type between team and user search shortcut
  // Adding this here resulted in possible null values for the returned props
  // It should not be the case
  const {
    id: viewId,
    color: viewColor,
    name: viewName,
    description: viewDescription,
    icon: viewIcon,
    scopingRepository,
    query,
  } = useFragment<SearchBarCurrentViewFragment$key>(
    graphql`
      fragment SearchBarCurrentViewFragment on Shortcutable {
        id
        name
        description
        icon
        color
        query
        scopingRepository {
          name
          owner {
            login
          }
        }
      }
    `,
    currentView,
  )

  const repository_data = useFragment(
    graphql`
      fragment SearchBarRepositoryFragment on Repository {
        isOwnerEnterpriseManaged
      }
    `,
    currentRepository,
  )

  const {author, assignee, mentioned} = useParams<{author: string; assignee: string; mentioned: string}>()
  const customViewQuery = `${CUSTOM_VIEW.defaultQuery} ${CUSTOM_VIEW.query({author, assignee, mentioned})}`
  const viewQuery = isCustomViewIssuePathForRepo(pathname) ? customViewQuery : query

  const modifiedQuery = scopingRepository
    ? `repo:${scopingRepository.owner.login}/${scopingRepository.name} ${viewQuery}`
    : `${viewQuery}`

  const {
    dirtyTitle,
    setDirtyTitle,
    dirtyDescription,
    setDirtyDescription,
    commitUserViewEdit,
    commitTeamViewEdit,
    dirtySearchQuery,
    setDirtySearchQuery,
    dirtyViewIcon,
    setDirtyViewIcon,
    dirtyViewColor,
    setDirtyViewColor,
  } = useQueryEditContext()

  useEffect(() => {
    if (!isNewIssuePath(pathname)) {
      const currentQuery = urlQuery || modifiedQuery || ''
      setActiveSearchQuery(currentQuery)
      const queryWithLeadingSpace = currentQuery !== '' ? `${currentQuery} ` : ''
      setDirtySearchQuery(queryWithLeadingSpace)
    }
  }, [author, modifiedQuery, setActiveSearchQuery, setDirtySearchQuery, urlQuery, viewId, pathname])

  const {sendHyperlistAnalyticsEvent} = useHyperlistAnalytics()

  // Update the URL with the new query when submitting the query
  const updateUrl = useCallback(
    (searchQuery: string) => {
      if (searchQuery) {
        const searchViewId = isCustomView(viewId) || scoped_repository ? viewId : undefined
        const url = searchUrl({viewId: searchViewId, query: searchQuery})
        // If the url contains a assigned, mentioned or created_by, we need to clean it up before updating the url
        const cleanUrl = isCustomViewIssuePathForRepo(pathname)
          ? cleanCustomViewIssueUrl(url, author || assignee || mentioned)
          : url
        window.history.pushState(history.state, '', cleanUrl)
      }
    },
    [assignee, author, isCustomView, mentioned, pathname, scoped_repository, viewId],
  )

  const onSubmit = useCallback(
    (request: FilterQuery) => {
      if (executeQuery) {
        const searchQuery = request.raw
        const finalQuery = searchQuery ? validateSearchQuery(searchQuery) : DEFAULT_QUERY
        updateUrl(finalQuery)
        setIsQueryLoading(true)
        setCurrentPage(1)
        startTransition(() => {
          executeQuery(finalQuery)
        })
      }
    },
    [executeQuery, setCurrentPage, setIsQueryLoading, updateUrl],
  )

  const onShortcutKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!current_user_settings?.use_single_key_shortcut) {
        return
      }

      if (ref && ref.current) {
        ref.current.focus()
        const queryLength = ref.current.value?.length || 0
        ref.current.setSelectionRange(queryLength, queryLength)
        e.preventDefault()
      }
    },
    [current_user_settings?.use_single_key_shortcut],
  )

  const deleteDirtyView = useCallback(
    (willNavigate: boolean) => {
      if (dirtyViewId === undefined) {
        return
      }

      const payload = {
        environment: relayEnvironment,
        input: {shortcutId: dirtyViewId},
        onError: () => noop,
        onCompleted: () => {
          if (willNavigate) {
            navigateToView({viewId: ASSIGNED_TO_ME_VIEW.id, canEditView: true})
          }
        },
      }

      dirtyViewType === 'team' ? commitRemoveTeamViewMutation(payload) : commitRemoveUserViewMutation(payload)
    },
    [dirtyViewId, dirtyViewType, navigateToView, relayEnvironment],
  )

  const onCancel = useCallback(() => {
    setDirtyTitle(viewName)
    setDirtyDescription(viewDescription)
    setDirtySearchQuery(modifiedQuery)
    setDirtyViewIcon(viewIcon)
    setDirtyViewColor(viewColor)
    setIsEditing(false)
    setIsNewView(false)
    setDirtyViewId(undefined)
    setDirtyViewType(undefined)
    deleteDirtyView(true)
  }, [
    setDirtyTitle,
    viewName,
    setDirtyDescription,
    viewDescription,
    setDirtySearchQuery,
    modifiedQuery,
    setDirtyViewIcon,
    viewIcon,
    setDirtyViewColor,
    viewColor,
    setIsEditing,
    setIsNewView,
    setDirtyViewId,
    setDirtyViewType,
    deleteDirtyView,
  ])

  const onInputChange = useCallback(
    (filter: string) => {
      setDirtySearchQuery(filter)
    },
    [setDirtySearchQuery],
  )

  const onValidation = useCallback((messages: string[]) => setValidationMessage(messages), [setValidationMessage])

  const onUpdateViewQuery = useCallback(() => {
    if (ref?.current?.value !== undefined && dirtyTitle.trim() !== '') {
      sendHyperlistAnalyticsEvent('search.save', 'FILTER_BAR_SAVE_BUTTON', {
        new_color: dirtyViewColor,
        new_icon: dirtyViewIcon,
        new_query: dirtySearchQuery,
        new_view_description: dirtyDescription,
        new_view_name: dirtyTitle,
        prev_color: viewColor,
        prev_icon: viewIcon,
        prev_query: modifiedQuery,
        prev_view_description: viewDescription,
        prev_view_name: viewName,
      })
      const args = {
        viewId,
        onSuccess: () => {
          const url = searchUrl({viewId})
          window.history.replaceState(history.state, '', url)
          setIsEditing(false)
        },
        relayEnvironment,
      }

      viewTeamId ? commitTeamViewEdit(args) : commitUserViewEdit(args)
      setIsNewView(false)
      setDirtyViewId(undefined)
      setDirtyViewType(undefined)
    }
  }, [
    dirtyTitle,
    sendHyperlistAnalyticsEvent,
    dirtyViewColor,
    dirtyViewIcon,
    dirtySearchQuery,
    dirtyDescription,
    viewColor,
    viewIcon,
    modifiedQuery,
    viewDescription,
    viewName,
    viewId,
    relayEnvironment,
    viewTeamId,
    commitTeamViewEdit,
    commitUserViewEdit,
    setIsNewView,
    setDirtyViewId,
    setDirtyViewType,
    setIsEditing,
  ])

  useKeyPress([HOTKEYS.focusSearch], onShortcutKeyPress, {[ModifierKeys.metaKey]: true})
  useKeyPress([HOTKEYS.focusSearch], onShortcutKeyPress, {[ModifierKeys.ctrlKey]: true})

  const {currentUser} = useUser()

  // We can only get into a valid edit state if details are not being shown for a custom view header
  const editingContent = isEditing && isCustomView(viewId)

  useEffect(() => {
    if (!isNewView) {
      if (dirtyViewId !== undefined) {
        deleteDirtyView(false)
      }
      setDirtyViewType(undefined)
      setDirtyViewId(undefined)
    }
  }, [deleteDirtyView, dirtyViewId, editingContent, isNewView, setDirtyViewId, setDirtyViewType])

  const queryFromViewId = isCustomViewIssuePathForRepo(pathname)
    ? customViewQuery
    : KNOWN_VIEWS.find(v => v.id === viewId)?.query

  // In a repo index, we give precendence to the query from the URL over the query from the viewId
  const effectiveQueryFromViewId = useMemo(
    () => (viewId === REPOSITORY_VIEW.id ? urlQuery ?? queryFromViewId : queryFromViewId ?? urlQuery),
    [queryFromViewId, urlQuery, viewId],
  )
  const effectiveQuery = useMemo(
    () => dirtySearchQuery ?? effectiveQueryFromViewId ?? queryFromCustomView ?? '',
    [dirtySearchQuery, effectiveQueryFromViewId, queryFromCustomView],
  )

  const providerRepositoryScope = scoped_repository ? `${scoped_repository.owner}/${scoped_repository.name}` : undefined

  const providers = useMemo(() => {
    const userFilterParam = {
      showAtMe: true,
      currentUserLogin: currentUser?.login,
      currentUserAvatarUrl: currentUser?.avatarUrl,
      repositoryScope: providerRepositoryScope,
    }

    const noNoneValueFilterConfig = {filterTypes: {valueless: false}}

    const filterProviders: FilterProvider[] = [
      new IsFilterProvider(IS_FILTER_PROVIDER_VALUES, noNoneValueFilterConfig),
      new StateFilterProvider('mixed', noNoneValueFilterConfig),
      new ProjectFilterProvider(),
      new LabelFilterProvider(),
      new MilestoneFilterProvider(),
      new AuthorFilterProvider(userFilterParam, noNoneValueFilterConfig),
      new AssigneeFilterProvider(userFilterParam),
      new ClosedFilterProvider(noNoneValueFilterConfig),
      new CreatedFilterProvider(noNoneValueFilterConfig),
      new UpdatedFilterProvider(noNoneValueFilterConfig),
      new MentionsFilterProvider(userFilterParam, noNoneValueFilterConfig),
      new CommenterFilterProvider(userFilterParam, noNoneValueFilterConfig),
      new InvolvesFilterProvider(userFilterParam, noNoneValueFilterConfig),
      new ReviewRequestedFilterProvider(userFilterParam, noNoneValueFilterConfig),
      new UserFilterProvider(userFilterParam, noNoneValueFilterConfig),
      new UserReviewRequestedFilterProvider(userFilterParam, noNoneValueFilterConfig),
      new ReviewedByFilterProvider(userFilterParam, noNoneValueFilterConfig),
      new CommentsFilterProvider(noNoneValueFilterConfig),
      new InteractionsFilterProvider(noNoneValueFilterConfig),
      new SortFilterProvider(['created', 'updated', 'reactions', 'comments'], noNoneValueFilterConfig),
      new TypeFilterProvider(
        // issues search currently does not support no:type and type:none
        noNoneValueFilterConfig,
        // legacy support for `type:issue` and `type:pr`
        true,
        relayEnvironment,
        providerRepositoryScope,
        issue_types,
      ),
      new ReasonFilterProvider(noNoneValueFilterConfig),
      new LinkedFilterProvider(['issue', 'pr'], noNoneValueFilterConfig),
      new ArchivedFilterProvider(noNoneValueFilterConfig),
      new MergedFilterProvider(noNoneValueFilterConfig),
      new ReactionsFilterProvider(noNoneValueFilterConfig),
      new DraftFilterProvider(noNoneValueFilterConfig),
      new ReviewFilterProvider(noNoneValueFilterConfig),
      new LanguageFilterProvider(noNoneValueFilterConfig),
      new ShaFilterProvider(noNoneValueFilterConfig),
      new BaseFilterProvider(noNoneValueFilterConfig),
      new HeadFilterProvider(noNoneValueFilterConfig),
      new StatusFilterProvider(noNoneValueFilterConfig),
      new TeamFilterProvider(providerRepositoryScope),
      new TeamReviewRequestedFilterProvider(providerRepositoryScope, noNoneValueFilterConfig),
    ]

    if (!scoped_repository) {
      filterProviders.push(new RepositoryFilterProvider({...noNoneValueFilterConfig, filterTypes: {multiKey: true}}))
      filterProviders.push(new OrgFilterProvider({...noNoneValueFilterConfig, priority: 6}))
    }

    return filterProviders
  }, [
    currentUser?.avatarUrl,
    currentUser?.login,
    issue_types,
    providerRepositoryScope,
    relayEnvironment,
    scoped_repository,
  ])

  useEffect(() => {
    return () => {
      const typeFilterProvider = providers.find(isTypeFilterProvider)
      if (typeFilterProvider) {
        // Clean up cached issue type data from the store
        typeFilterProvider.requestDisposable?.dispose()
      }
    }
  }, [providers])

  const hideCreateButton =
    scoped_repository?.is_archived || // archived repo
    (currentUser != null && !!currentUser?.is_emu && (!repository_data || !repository_data.isOwnerEnterpriseManaged)) // emu user in a non-owned repo

  return (
    <DynamicWrapper editing={editingContent}>
      {/* eslint-disable-next-line primer-react/direct-slot-children */}
      {editingContent && <FormControl.Label>{MESSAGES.query}</FormControl.Label>}
      <div className={`${styles.gap8} px-0 ${editingContent ? 'd-flex' : 'd-block'} flex-row flex-justify-between`}>
        <div className={`${styles.filterContainer} ${styles.gap8} d-flex flex-row flex-1 flexWrap min-width-0`}>
          <div className={`${styles.filter} d-flex flex-1 flex-column`}>
            <Filter
              id={viewId ?? 'search'}
              context={providerRepositoryScope ? {repo: providerRepositoryScope} : undefined}
              label={LABELS.issueSearchInputAriaLabel}
              placeholder={LABELS.issueSearchInputPlaceholder}
              onSubmit={onSubmit}
              onChange={onInputChange}
              providers={providers}
              inputRef={ref}
              filterValue={effectiveQuery}
              variant={'input'}
              settings={{aliasMatching: true, groupAndKeywordSupport: issues_advanced_search}}
              showValidationMessage={false}
              onValidation={onValidation}
            />
          </div>
          {scoped_repository && !isNewIssuePath(pathname) && (
            <div className={`${styles.buttons} ${styles.gap8} d-flex flex-wrap`}>
              <Button as="a" href={`labels`} leadingVisual={TagIcon}>
                Labels
              </Button>
              <Button as="a" href={`milestones`} leadingVisual={MilestoneIcon}>
                Milestones
              </Button>
              {!hideCreateButton && (
                <CreateIssueButton
                  label={BUTTON_LABELS.newIssue}
                  navigate={navigate}
                  optionConfig={{
                    scopedRepository: scoped_repository,
                    useMonospaceFont: current_user_settings?.use_monospace_font || false,
                    emojiSkinTonePreference: current_user_settings?.preferred_emoji_skin_tone,
                    singleKeyShortcutsEnabled: current_user_settings?.use_single_key_shortcut || false,
                    pasteUrlsAsPlainText: paste_url_link_as_plain_text,
                    // Only navigate if we're in the Repo#Index (ie, have a scoped repository)
                    navigateToFullScreenOnTemplateChoice: navigate !== noop && scoped_repository !== null,
                    showFullScreenButton: true,
                  }}
                />
              )}
            </div>
          )}
          {validationMessage.length > 0 && (
            <div className={`${styles.validation} mt-1`}>
              <ValidationMessage messages={validationMessage} id="repository-validation-message" />
            </div>
          )}
        </div>
        {editingContent && (
          <div className={`${styles.gap8} d-flex flex-row`}>
            <Button onClick={onCancel}>{BUTTON_LABELS.cancel}</Button>
            <Button variant="primary" onClick={onUpdateViewQuery}>
              {BUTTON_LABELS.saveView}
            </Button>
          </div>
        )}
      </div>
    </DynamicWrapper>
  )
}
