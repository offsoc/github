import {IssueBodyLoading} from '@github-ui/issue-body/IssueBodyLoading'
import {CreateIssue} from '@github-ui/issue-create/CreateIssue'

import {type OptionConfig, getSafeConfig} from '@github-ui/issue-create/OptionConfig'
import {getDefaultDisplayMode} from '@github-ui/issue-create/DisplayMode'
import {getIssueCreateArguments, type IssueCreateMetadataTypes} from '@github-ui/issue-create/TemplateArgs'
import {getPreselectedTemplate, repoHasAvailableTemplates, type OnCreateProps} from '@github-ui/issue-create/Model'

import {useSafeClose} from '@github-ui/issue-create/useSafeClose'
import {IssueCreateContextProvider} from '@github-ui/issue-create/IssueCreateContext'
import type {IssueFormRef} from '@github-ui/issue-form/Types'

import {issuePath} from '@github-ui/paths'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useNavigate} from '@github-ui/use-navigate'
import {Box, Heading} from '@primer/react'
import {type RefObject, Suspense, useCallback, useEffect, useMemo, useRef} from 'react'
import type {PreloadedQuery, UseQueryLoaderLoadQueryOptions} from 'react-relay'
import {readInlineData, usePreloadedQuery} from 'react-relay'

import type {AppPayload} from '../../types/app-payload'
import {explodeIssueNewPathToRepositoryData, getCurrentRepoIssuesUrl, isNewIssuePathForRepo} from '../../utils/urls'
import {
  CurrentRepository,
  RepositoryIssueTemplatesFragment,
  RepositoryFragment,
} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import type {RepositoryPickerRepository$key} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {RepositoryPickerRepositoryIssueTemplates$key} from '@github-ui/item-picker/RepositoryPickerRepositoryIssueTemplates.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import {LABELS} from '../../constants/labels'
import {VALUES} from '../../constants/values'
import {VIEW_IDS} from '../../constants/view-constants'
import {useQueryContext} from '../../contexts/QueryContext'
import {isChooseRoute, isNewRoute} from '@github-ui/issue-create/urls'
import {noop} from '@github-ui/noop'

export type IssueCreatePaneProps = {
  currentRepoQueryRef?: PreloadedQuery<RepositoryPickerCurrentRepoQuery> | undefined | null
  loadCurrentRepo?: (
    variables: RepositoryPickerCurrentRepoQuery['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void
  disposeCurrentRepo?: () => void
  topReposQueryRef?: PreloadedQuery<RepositoryPickerTopRepositoriesQuery> | undefined | null
  loadTopRepos?: (
    variables: RepositoryPickerTopRepositoriesQuery['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void
  disposeTopRepos?: () => void
  initialMetadataValues?: IssueCreateMetadataTypes
}

export const IssueCreatePane = ({
  currentRepoQueryRef,
  loadCurrentRepo,
  disposeCurrentRepo,
  topReposQueryRef,
  loadTopRepos,
  disposeTopRepos,
  initialMetadataValues,
}: IssueCreatePaneProps) => {
  const appPayload = useAppPayload<AppPayload>()
  const storageKeyPrefix = VALUES.storageKeyPrefix(appPayload)
  const navigate = useNavigate()
  const {activeSearchQuery, setCurrentViewId} = useQueryContext()
  const pasteUrlsAsPlainText = appPayload?.paste_url_link_as_plain_text || false
  const useMonospaceFont = appPayload?.current_user_settings?.use_monospace_font || false
  const emojiSkinTonePreference = appPayload?.current_user_settings?.preferred_emoji_skin_tone
  const singleKeyShortcutsEnabled = appPayload?.current_user_settings?.use_single_key_shortcut || false

  const {search, pathname} = ssrSafeLocation
  const {scoped_repository: scoped_repository_from_payload} = appPayload

  // This is a workaround to soft navigations where we can go from not having a scoped repo in issues#index to the issue#viewer
  // where we now have a scoped repo, which would not detect the scoped repo change given the payload isn't refreshed on soft nav.
  // Therefore we first attempt to parse a scoped repo from the pathname, which will only have a potentially valid value on soft nav,
  // otherwise we fallback to the payload value.
  const urlScopedRepository = useMemo(() => explodeIssueNewPathToRepositoryData(pathname), [pathname])
  const scoped_repository = urlScopedRepository ?? scoped_repository_from_payload

  const urlSearchParams = new URLSearchParams(search)
  const issueCreateArguments = getIssueCreateArguments(urlSearchParams, initialMetadataValues)

  const argRepository = issueCreateArguments?.repository?.name
  const argOwner = issueCreateArguments?.repository?.owner

  const prefillRepository = useMemo(() => {
    if (scoped_repository) {
      // If we're scoped to a given repository, we use that to prefill
      return {
        owner: scoped_repository.owner,
        name: scoped_repository.name,
      }
    } else if (argRepository && argOwner) {
      // If we're given a repository in dashboard scope, we use that to prefill
      return {
        owner: argOwner,
        name: argRepository,
      }
    }
  }, [scoped_repository, argRepository, argOwner])

  // We don't use `prefillRepository` because we only want to hide it on scoped repo, not on template args.
  const shouldLoadTopRepos = !scoped_repository

  useEffect(() => {
    if (shouldLoadTopRepos) {
      loadTopRepos?.({topRepositoriesFirst: VALUES.repositoriesPreloadCount, hasIssuesEnabled: true, owner: null})
    }
    return () => {
      disposeTopRepos?.()
    }
  }, [disposeTopRepos, shouldLoadTopRepos, loadTopRepos])

  useEffect(() => {
    if (prefillRepository)
      loadCurrentRepo &&
        loadCurrentRepo({...prefillRepository, includeTemplates: true}, {fetchPolicy: 'store-or-network'})

    return () => disposeCurrentRepo && disposeCurrentRepo()
  }, [disposeCurrentRepo, prefillRepository, loadCurrentRepo])

  const onCancel = useCallback(() => {
    const path = isNewIssuePathForRepo(pathname)
      ? getCurrentRepoIssuesUrl({query: activeSearchQuery})
      : '/issues/assigned'
    navigate(path)
  }, [activeSearchQuery, navigate, pathname])

  const issueFormRef = useRef<IssueFormRef>(null)
  const {onSafeClose} = useSafeClose({storageKeyPrefix, issueFormRef, onCancel})

  const sharedOptionConfigValues: OptionConfig = {
    storageKeyPrefix,
    singleKeyShortcutsEnabled,
    pasteUrlsAsPlainText,
    useMonospaceFont,
    emojiSkinTonePreference,
    issueCreateArguments,
    insidePortal: false,
  }

  const navigateToIssue = ({issue}: Pick<OnCreateProps, 'issue'>) => {
    navigate(
      issuePath({
        owner: issue.repository.owner.login,
        repo: issue.repository.name,
        issueNumber: issue.number,
      }),
    )
  }

  return (
    <Box sx={{display: 'flex', justifyContent: 'center', width: '100%'}}>
      <Box
        sx={{
          mx: [1, 2, 3],
          pt: 3,
          // This is a temporary fix until the GitHub footer is rendered in our React app to add the bottom padding.
          // Once the footer is in, we can revert this back to py: 3
          pb: 'var(--base-size-80)',
          width: '100%',
          maxWidth: '1280px',
        }}
        data-testid="issue-create-pane-container"
      >
        <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', alignSelf: 'center', mb: 2}}>
          <Heading as="h1" sx={{fontSize: 2}}>
            {LABELS.issueCreatePaneTitle}
          </Heading>
        </Box>
        <Suspense fallback={<IssueBodyLoading />}>
          {currentRepoQueryRef && (!shouldLoadTopRepos || topReposQueryRef) ? (
            <IssueCreatePaneWithPrefilledRepo
              currentRepoQueryRef={currentRepoQueryRef}
              onCreateSuccess={({issue, createMore}: OnCreateProps) => {
                if (createMore) {
                  return
                }
                setCurrentViewId(VIEW_IDS.repository)
                navigateToIssue({issue})
              }}
              navigate={navigate}
              onCancel={onSafeClose}
              issueFormRef={issueFormRef}
              topReposQueryRef={topReposQueryRef ?? undefined}
              optionConfigValues={sharedOptionConfigValues}
              scopedRepository={scoped_repository}
            />
          ) : (
            topReposQueryRef && (
              <IssueCreateContextProvider
                optionConfig={getSafeConfig(sharedOptionConfigValues)}
                issueFormRef={issueFormRef}
                preselectedData={undefined}
              >
                <CreateIssue
                  onCreateSuccess={({issue, createMore}: OnCreateProps) => {
                    if (createMore) {
                      return
                    }
                    navigateToIssue({issue})
                  }}
                  onCreateError={noop}
                  onCancel={onSafeClose}
                  topReposQueryRef={topReposQueryRef ?? undefined}
                  navigate={navigate}
                />
              </IssueCreateContextProvider>
            )
          )}
        </Suspense>
      </Box>
    </Box>
  )
}

type IssueCreatePaneWithPrefilledRepoProps = {
  currentRepoQueryRef: PreloadedQuery<RepositoryPickerCurrentRepoQuery>
  topReposQueryRef?: PreloadedQuery<RepositoryPickerTopRepositoriesQuery>
  onCreateSuccess: ({issue, createMore}: OnCreateProps) => void
  onCancel: () => void
  optionConfigValues: OptionConfig
  issueFormRef: RefObject<IssueFormRef>
  scopedRepository: {owner: string; name: string} | undefined
  navigate: (path: string) => void
}

const IssueCreatePaneWithPrefilledRepo = ({
  currentRepoQueryRef,
  topReposQueryRef,
  optionConfigValues,
  scopedRepository,
  onCreateSuccess,
  onCancel,
  navigate,
  issueFormRef,
}: IssueCreatePaneWithPrefilledRepoProps) => {
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

  const optionConfig: OptionConfig = {
    ...optionConfigValues,
    scopedRepository:
      scopedRepository && preselectedRepository
        ? {
            ...scopedRepository,
            id: preselectedRepository.id,
          }
        : undefined,
  }

  const hasAvailableTemplates = repoHasAvailableTemplates(templates ?? null)
  const repositoryHasIssuesEnabled = preselectedRepository?.hasIssuesEnabled ?? false
  const preselectedTemplate = getPreselectedTemplate({
    templates: templates ?? null,
    issueCreateArguments: optionConfig.issueCreateArguments,
  })

  const overrideFallbackDisplaymode = useMemo(() => {
    return getDefaultDisplayMode({
      hasSelectedTemplate: !!optionConfig.issueCreateArguments?.templateFileName,
      hasAvailableTemplates,
      repositoryHasIssuesEnabled,
      onChoosePage: isChooseRoute(ssrSafeLocation.pathname),
      onNewPage: isNewRoute(ssrSafeLocation.pathname),
    })
  }, [optionConfig.issueCreateArguments?.templateFileName, hasAvailableTemplates, repositoryHasIssuesEnabled])

  const preselectedData = {
    repository: preselectedRepository ?? undefined,
    template: preselectedTemplate,
    templates: templates ?? undefined,
  }

  return (
    <IssueCreateContextProvider
      optionConfig={getSafeConfig(optionConfig)}
      overrideFallbackDisplaymode={overrideFallbackDisplaymode}
      issueFormRef={issueFormRef}
      preselectedData={preselectedData}
    >
      <CreateIssue
        onCreateSuccess={onCreateSuccess}
        onCreateError={noop}
        onCancel={onCancel}
        topReposQueryRef={topReposQueryRef}
        navigate={navigate}
        {...preselectedData}
      />
    </IssueCreateContextProvider>
  )
}
