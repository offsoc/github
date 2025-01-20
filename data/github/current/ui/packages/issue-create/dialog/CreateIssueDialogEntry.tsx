import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import type {RepositoryPickerRepository$key} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {RepositoryPickerRepositoryIssueTemplates$key} from '@github-ui/item-picker/RepositoryPickerRepositoryIssueTemplates.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import {
  CurrentRepository,
  RepositoryFragment,
  RepositoryIssueTemplatesFragment,
  TopRepositories,
} from '@github-ui/item-picker/RepositoryPicker'
import {Suspense, useEffect, useMemo} from 'react'
import {readInlineData, usePreloadedQuery, useQueryLoader, type PreloadedQuery} from 'react-relay'

import {VALUES} from '../constants/values'

import type {OptionConfig, SafeOptionConfig} from '../utils/option-config'
import {getSafeConfig} from '../utils/option-config'
import {issuePath} from '@github-ui/paths'
import type {CreateIssueCallbackProps} from '../CreateIssueForm'
import {CreateIssueDialog} from './CreateIssueDialog'
import {IssueCreateContextProvider} from '../contexts/IssueCreateContext'
import {getBlankIssue, getPreselectedTemplate, repoHasAvailableTemplates, type OnCreateProps} from '../utils/model'
import {DisplayMode, getDefaultDisplayMode} from '../utils/display-mode'
import type {CreateIssueProps} from '../CreateIssue'
import {newIssueWithTemplateParams} from '../utils/urls'

export type CreateIssueDialogEntryProps = {
  navigate: (url: string) => void
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (value: boolean) => void
  optionConfig?: OptionConfig
} & Partial<CreateIssueCallbackProps>

export const CreateIssueDialogEntry = ({...props}: CreateIssueDialogEntryProps): JSX.Element | null => {
  return (
    <Suspense>
      <CreateIssueDialogEntryInternal {...props} />
    </Suspense>
  )
}

export const CreateIssueDialogEntryInternal = ({
  navigate,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  onCancel,
  onCreateSuccess,
  onCreateError,
  optionConfig,
}: CreateIssueDialogEntryProps): JSX.Element | null => {
  const [topReposQueryRef, loadTopRepos, disposeTopRepos] =
    useQueryLoader<RepositoryPickerTopRepositoriesQuery>(TopRepositories)
  const [currentRepoQueryRef, loadCurrentRepo, disposeCurrentRepo] =
    useQueryLoader<RepositoryPickerCurrentRepoQuery>(CurrentRepository)

  const config = getSafeConfig(optionConfig)

  const shouldLoadTopRepos = config.showRepositoryPicker

  useEffect(() => {
    if (shouldLoadTopRepos) {
      loadTopRepos(
        {topRepositoriesFirst: VALUES.repositoriesPreloadCount, hasIssuesEnabled: true, owner: null},
        {fetchPolicy: 'store-or-network'},
      )
      return () => {
        disposeTopRepos()
      }
    }
  }, [disposeTopRepos, loadTopRepos, shouldLoadTopRepos])

  /**
   * Repository to prefill the create issue dialog with
   *
   * Note: The repo will only be determined based on the existence of an `owner` and `name` string,
   * without consideration for archived repos or other reasons the repository might not be available.
   */
  const prefillRepository = useMemo(() => {
    if (config.scopedRepository) {
      return {
        owner: config.scopedRepository.owner,
        name: config.scopedRepository.name,
      }
    } else if (config.issueCreateArguments?.repository) {
      return {
        owner: config.issueCreateArguments.repository.owner,
        name: config.issueCreateArguments.repository.name,
      }
    }

    return null
  }, [config.issueCreateArguments?.repository, config.scopedRepository])

  useEffect(() => {
    if (prefillRepository)
      loadCurrentRepo({...prefillRepository, includeTemplates: true}, {fetchPolicy: 'store-or-network'})

    return () => disposeCurrentRepo()
  }, [disposeCurrentRepo, prefillRepository, loadCurrentRepo])

  const handleDialogClose = () => {
    onCancel?.()
    setIsCreateDialogOpen(false)
  }

  const handleOnCreate = ({issue, createMore}: OnCreateProps) => {
    // Respect the callback if it exists, else use default behaviour.
    if (onCreateSuccess) {
      onCreateSuccess({issue, createMore})
    } else if (!createMore) {
      handleDialogClose()
      navigate(
        issuePath({
          owner: issue.repository.owner.login,
          repo: issue.repository.name,
          issueNumber: issue.number,
        }),
      )
    }
  }

  const handleOnError = (error: Error) => onCreateError?.(error)

  const createIssueDialogProps: CreateIssueProps = {
    topReposQueryRef: topReposQueryRef ?? undefined,
    onCreateSuccess: handleOnCreate,
    onCreateError: handleOnError,
    onCancel: handleDialogClose,
    navigate,
  }

  if (!isCreateDialogOpen) {
    return null
  }

  // If we are waiting for the top repos to load, or we are waiting for the current repo to load then don't render
  if ((shouldLoadTopRepos && !topReposQueryRef) || (!currentRepoQueryRef && prefillRepository)) {
    return null
  }

  if (!currentRepoQueryRef) {
    return (
      <IssueCreateContextProvider optionConfig={config} preselectedData={undefined}>
        <CreateIssueDialog {...createIssueDialogProps} />
      </IssueCreateContextProvider>
    )
  } else {
    // Otherwise we want to render the dialog with the current repo preloaded, and then check if we need to bypass the template selection.
    return (
      <DialogWithPrefilledRepo
        dialogProps={createIssueDialogProps}
        config={config}
        currentRepoQueryRef={currentRepoQueryRef}
      />
    )
  }
}

// Since we have the current repository already loaded, we can now check if theres no templates available
// and if so, directly bypass the template selector.
const DialogWithPrefilledRepo = ({
  dialogProps,
  config,
  currentRepoQueryRef,
}: {
  dialogProps: CreateIssueProps
  config: SafeOptionConfig
  currentRepoQueryRef: PreloadedQuery<RepositoryPickerCurrentRepoQuery, Record<string, unknown>>
}) => {
  const preloadedData = usePreloadedQuery<RepositoryPickerCurrentRepoQuery>(CurrentRepository, currentRepoQueryRef)

  const templates =
    preloadedData.repository !== undefined
      ? // eslint-disable-next-line no-restricted-syntax
        readInlineData<RepositoryPickerRepositoryIssueTemplates$key>(
          RepositoryIssueTemplatesFragment,
          preloadedData.repository,
        )
      : null

  const preselectedRepository =
    preloadedData.repository !== undefined
      ? // eslint-disable-next-line no-restricted-syntax
        readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, preloadedData.repository)
      : null

  const hasAvailableTemplates = repoHasAvailableTemplates(templates ?? null)

  const repositoryHasIssuesEnabled = preselectedRepository?.hasIssuesEnabled ?? false
  const preselectedTemplate = getPreselectedTemplate({
    templates: templates ?? null,
    issueCreateArguments: config.issueCreateArguments,
  })

  const preselectedData = {
    repository: preselectedRepository ?? undefined,
    template: preselectedTemplate,
    templates: templates ?? undefined,
    parentIssue: config.issueCreateArguments?.parentIssue,
  }

  const defaultDisplayMode = useMemo(() => {
    return getDefaultDisplayMode({
      hasSelectedTemplate: preselectedTemplate !== undefined,
      hasAvailableTemplates,
      repositoryHasIssuesEnabled,
    })
  }, [hasAvailableTemplates, preselectedTemplate, repositoryHasIssuesEnabled])

  // Special case where we want to navigate to the fullscreen issue creation and we bypassed the template selection.
  if (defaultDisplayMode === DisplayMode.IssueCreation && config.navigateToFullScreenOnTemplateChoice) {
    dialogProps.navigate(
      newIssueWithTemplateParams({
        template: preselectedTemplate ?? getBlankIssue(),
        repository: preselectedRepository ?? undefined,
        preselectedRepository: preselectedRepository ?? undefined,
      }),
    )
    return null
  }

  return (
    <IssueCreateContextProvider
      optionConfig={config}
      overrideFallbackDisplaymode={defaultDisplayMode}
      preselectedData={preselectedData}
    >
      <CreateIssueDialog {...dialogProps} />
    </IssueCreateContextProvider>
  )
}
