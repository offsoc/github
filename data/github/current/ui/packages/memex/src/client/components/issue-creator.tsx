import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {CreateIssueDialogEntry} from '@github-ui/issue-create/CreateIssueDialogEntry'
import type {OnCreateProps} from '@github-ui/issue-create/Model'
import type {OptionConfig} from '@github-ui/issue-create/OptionConfig'
import {storageKeys, VALUES} from '@github-ui/issue-create/values'
import {prefetchCurrentRepository, prefetchTopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import {noop} from '@github-ui/noop'
import {FeatureFlagProvider} from '@github-ui/react-core/feature-flag-provider'
import {clearSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import {createContext, memo, useCallback, useContext, useMemo, useState} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import type {IAssignee, IssueType, Milestone} from '../api/common-contracts'
import {useCommands} from '../commands/hook'
import {getEnabledFeatures} from '../helpers/feature-flags'
import {getInitialState} from '../helpers/initial-state'
import {ViewerPrivileges} from '../helpers/viewer-privileges'
import {useAddMemexItem} from '../hooks/use-add-memex-item'
import {repositoryWithOwnerFromString} from '../models/repository'
import {getStorageKey} from '../platform/get-storage-key'
import {useProjectDetails} from '../state-providers/memex/use-project-details'
import {useCreateMemexItem} from '../state-providers/memex-items/use-create-memex-item'
import {useRepositories} from '../state-providers/repositories/use-repositories'
import type {OmnibarItemAttrs} from './omnibar/types'
import useToasts from './toasts/use-toasts'

interface IssuePrefill {
  issueTitle?: string
  issueTypeName?: string
  milestoneTitle?: string
  enforcedSelectedProjectTitle?: string
  assignees?: Array<IAssignee>
  repo?: {
    name: string
    owner: string
  }
}

/**
 * @param prefill Data to prefill in the dialog.
 * @param newItemAttributes Attributes to apply to the item upon creation, passed from the omnibar.
 */
type StartIssueCreator = (
  prefill: IssuePrefill,
  newItemAttributes?: OmnibarItemAttrs,
  returnFocusRef?: React.RefObject<HTMLElement>,
  onClose?: () => void,
) => Promise<void>

type IssueCreatorContextValue = {
  start: StartIssueCreator
  prefetch: (repo?: IssuePrefill['repo']) => Promise<void>
}

const IssueCreatorContext = createContext<IssueCreatorContextValue | null>(null)

export const useStartIssueCreator = () => useContext(IssueCreatorContext)

interface IssueCreatorProps {
  onClose: () => void
  visible: boolean
  prefill?: IssuePrefill
  returnFocusRef?: React.RefObject<HTMLElement>
  newItemAttributes?: OmnibarItemAttrs
}

const storageKeyPrefix = getStorageKey('issue-creator')

const repoVariables = (name = '', owner = '') => ({
  owner,
  name,
  includeTemplates: true,
})

const variablesHaveRepo = (currentRepoVariables: RepositoryPickerCurrentRepoQuery['variables']) => {
  return (
    currentRepoVariables.name !== undefined &&
    currentRepoVariables.owner !== undefined &&
    currentRepoVariables.name !== '' &&
    currentRepoVariables.owner !== ''
  )
}

// Needs to be a separate component so it can be inside the RelayProvider, and not
// conditionally rendered so that the repos can cache
const IssueCreator = ({onClose, prefill, newItemAttributes, returnFocusRef}: IssueCreatorProps) => {
  const {loggedInUser} = getInitialState()
  const {addToast} = useToasts()
  const {projectOwner, themePreferences} = getInitialState()

  const useMonospaceFont = themePreferences.markdown_fixed_width_font
  const pasteUrlAsPlainText = loggedInUser?.paste_url_link_as_plain_text ?? false
  const emojiSkinTonePreference = themePreferences?.preferred_emoji_skin_tone
  const singleKeyShortcutsEnabled = loggedInUser?.use_single_key_shortcut ?? false

  const {createMemexItem} = useCreateMemexItem()

  const addItemToView = useAddMemexItem({
    updateActions: (newItemAttributes && newItemAttributes.updateColumnActions) || undefined,
    previousItemId: newItemAttributes?.previousItemId,
    // Adding draft items is a noop because we only support creating non-draft issues here
    onAddDraftItem: useCallback(() => Promise.resolve(null), []),
    onAddItem: useCallback(
      (
        item,
        repositoryId,
        memexProjectColumnValues,
        localColumnValues,
        previousMemexProjectItemId,
        groupId,
        secondaryGroupId,
      ) =>
        createMemexItem(
          {
            contentType: item.type,
            content: {id: item.id, repositoryId},
            memexProjectColumnValues,
            localColumnValues,
            previousMemexProjectItemId,
          },
          groupId,
          secondaryGroupId,
        ),
      [createMemexItem],
    ),
  })

  const onCreate = useCallback(
    async ({issue, createMore}: OnCreateProps) => {
      const {databaseId, repository} = issue

      if (!createMore) {
        onClose()
      }

      if (!databaseId || !repository.databaseId) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({message: 'Could not add the new issue to the project: ID is missing', type: 'error'})
        return
      }

      await addItemToView({
        type: 'Issue',
        id: databaseId,
        repositoryId: repository.databaseId,
      })
    },
    [onClose, addItemToView, addToast],
  )

  const sharedProps = {
    onCreateSuccess: onCreate,
    onCancel: onClose,
    navigate: noop, // Not needed as it's only for fullscreen
    isCreateDialogOpen: true, // This is already handled by the parent
    setIsCreateDialogOpen: noop,
  }

  const optionConfig: OptionConfig = {
    useMonospaceFont,
    emojiSkinTonePreference,
    pasteUrlsAsPlainText: pasteUrlAsPlainText,
    singleKeyShortcutsEnabled,
    scopedOrganization: projectOwner?.login,
    scopedProjectTitle: prefill?.enforcedSelectedProjectTitle,
    scopedIssueType: prefill?.issueTypeName,
    scopedMilestone: prefill?.milestoneTitle,
    scopedAssignees: prefill?.assignees,
    showFullScreenButton: false,
    returnFocusRef,
    storageKeyPrefix,
    issueCreateArguments: {
      repository:
        prefill?.repo?.owner && prefill?.repo?.name
          ? {
              owner: prefill.repo.owner,
              name: prefill.repo.name,
            }
          : undefined,
      initialValues: prefill?.issueTitle
        ? {
            title: prefill.issueTitle,
          }
        : undefined,
    },
  }

  return (
    <AnalyticsProvider appName="memex" category="Memex Project" metadata={{}}>
      <CreateIssueDialogEntry {...sharedProps} optionConfig={optionConfig} />
    </AnalyticsProvider>
  )
}

export const IssueCreatorProvider = memo(function IssueCreatorProvider({children}: {children: React.ReactNode}) {
  const {hasWritePermissions} = ViewerPrivileges()
  const {title} = useProjectDetails()
  const environment = useRelayEnvironment()

  const [creatorProps, setCreatorProps] = useState<IssueCreatorProps | undefined>()

  const {suggestRepositories} = useRepositories()

  const getFallbackRepo = useCallback(async () => {
    const fallbackRepo = (await suggestRepositories()).at(0)?.nameWithOwner
    if (fallbackRepo) {
      return repositoryWithOwnerFromString(fallbackRepo)
    }
  }, [suggestRepositories])

  const startCreateIssue = useCallback<StartIssueCreator>(
    async ({repo, issueTitle}, newItemAttributes, returnFocusRef, onClose) => {
      if (!repo) {
        repo = await getFallbackRepo()
      }
      // ensure a clear session storage state when starting, since memex doesn't want to maintain old state
      clearSessionStorage(storageKeys(storageKeyPrefix))

      const handleClose = () => {
        onClose?.()
        setCreatorProps(undefined)
      }

      const prefilledIssueType = newItemAttributes?.updateColumnActions?.find(
        ({dataType}) => dataType === MemexColumnDataType.IssueType,
      )?.value as IssueType | undefined

      const prefilledMilestone = newItemAttributes?.updateColumnActions?.find(
        ({dataType}) => dataType === MemexColumnDataType.Milestone,
      )?.value as Milestone | undefined

      const prefilledAssignees = newItemAttributes?.updateColumnActions?.find(
        ({dataType}) => dataType === MemexColumnDataType.Assignees,
      )?.value as Array<IAssignee> | undefined

      setCreatorProps({
        visible: true,
        prefill: {
          issueTitle,
          repo,
          enforcedSelectedProjectTitle: title,
          issueTypeName: prefilledIssueType?.name,
          milestoneTitle: prefilledMilestone?.title,
          assignees: prefilledAssignees,
        },
        newItemAttributes,
        onClose: handleClose,
        returnFocusRef,
      })
    },
    [getFallbackRepo, title],
  )

  const prefetchCreateIssue = useCallback(
    async (repo: IssuePrefill['repo'] | undefined) => {
      if (!repo) {
        repo = await getFallbackRepo()
      }
      prefetchTopRepositories(environment, VALUES.repositoriesPreloadCount, true)
      if (repo && variablesHaveRepo(repo)) {
        const vars = repoVariables(repo.name, repo.owner)
        prefetchCurrentRepository(environment, vars.owner, vars.name, vars.includeTemplates)
      }
    },
    [environment, getFallbackRepo],
  )

  // add to command palette
  useCommands(
    () => (hasWritePermissions ? ['i', 'Create issue', 'create_issue', () => startCreateIssue({})] : null),
    [startCreateIssue, hasWritePermissions],
  )

  const value = useMemo(
    () => ({
      start: startCreateIssue,
      prefetch: prefetchCreateIssue,
    }),
    [prefetchCreateIssue, startCreateIssue],
  )

  const memexFeatureFlags = getEnabledFeatures()

  // Without write permissions, context provider should not render so `useCreateIssue` will return null
  return hasWritePermissions ? (
    <FeatureFlagProvider features={memexFeatureFlags}>
      <IssueCreatorContext.Provider value={value}>{children}</IssueCreatorContext.Provider>
      {creatorProps && <IssueCreator {...creatorProps} />}
    </FeatureFlagProvider>
  ) : (
    <>{children}</>
  )
})
