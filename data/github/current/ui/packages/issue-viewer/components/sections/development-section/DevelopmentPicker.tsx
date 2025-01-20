import type {
  RepositoryPickerRepository$data,
  RepositoryPickerRepository$key,
} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import {readInlineData, graphql} from 'relay-runtime'
import {useCallback, useEffect, useMemo, useState, type HTMLAttributes, type ReactElement} from 'react'
import {Box, IconButton, Truncate} from '@primer/react'
import {ArrowLeftIcon} from '@primer/octicons-react'
import type {BranchPickerRef$data} from '@github-ui/item-picker/BranchPickerRef.graphql'
import {linkPullRequestsMutation} from '../../../mutations/link-pull-requests-mutation'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ERRORS} from '../../../constants/errors'

import {linkBranchesMutation} from '../../../mutations/link-branches'
import type {PullRequestPickerPullRequest$data} from '@github-ui/item-picker/PullRequestPickerPullRequest.graphql'
import {LazyPullRequestAndBranchPicker} from '@github-ui/item-picker/PullRequestAndBranchPicker'

import {useLazyLoadQuery, useRelayEnvironment} from 'react-relay'
import {
  RepositoryFragment,
  RepositoryPickerInternal,
  prefetchCurrentRepository,
  prefetchTopRepositories,
} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerTopRepositoriesQuery$data} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import type {RepositoryPickerCurrentRepoQuery$data} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import type {DevelopmentPickerQuery as DevelopmentPickerQueryType} from './__generated__/DevelopmentPickerQuery.graphql'
import {LABELS} from '../../../constants/labels'
import {useKeyPress} from '@github-ui/use-key-press'
import {HOTKEYS} from '@github-ui/item-picker/Hotkeys'

export type LazyDevelopmentPickerBaseProp = {
  issueId: string
  linkedBranches: BranchPickerRef$data[]
  linkedPullRequests: PullRequestPickerPullRequest$data[]
  anchorElement: (props: HTMLAttributes<HTMLElement>) => JSX.Element
  isCreateBranchDialogOpen: boolean
  repoPickerSubtitle: ReactElement
  prAndBranchPickerSubtitle: ReactElement
  triggerOpen?: boolean
  shortcutEnabled: boolean
  insidePortal?: boolean
}

export type LazyDevelopmentPickerProps = LazyDevelopmentPickerBaseProp

export type LazyDevelopmentPickerInternalProps = LazyDevelopmentPickerBaseProp & {
  initialRepository: RepositoryPickerRepository$data | null
  topRepos: RepositoryPickerTopRepositoriesQuery$data | null
  /**
   * Serves as default title while preloading the other data
   */
  repoNameWithOwner?: string
  /**
   * Override for picker's loading state to support pre-fetching
   */
  isLoading?: boolean
}

export const DevelopmentPickerQuery = graphql`
  query DevelopmentPickerQuery($id: ID!) {
    node(id: $id) {
      ... on Issue {
        repository {
          name
          nameWithOwner
          owner {
            login
          }
        }
      }
    }
  }
`

/**
 * Wrapper component for lazy picker to only start fetching when the picker is opened
 */
export function LazyDevelopmentPickerOnClick({
  anchorElement,
  shortcutEnabled,
  insidePortal,
  ...props
}: LazyDevelopmentPickerProps) {
  const [wasTriggered, setWasTriggered] = useState(false)

  useKeyPress(
    shortcutEnabled ? [HOTKEYS.developmentSection] : [],
    (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setWasTriggered(true)
    },
    {
      triggerWhenInputElementHasFocus: false,
      triggerWhenPortalIsActive: insidePortal,
    },
  )

  if (!wasTriggered && anchorElement) {
    return anchorElement({onClick: () => setWasTriggered(true)})
  }

  return (
    <LazyDevelopmentPicker
      anchorElement={anchorElement}
      shortcutEnabled={shortcutEnabled}
      triggerOpen={wasTriggered}
      insidePortal={insidePortal}
      {...props}
    />
  )
}

export const LazyDevelopmentPicker = ({issueId, ...rest}: LazyDevelopmentPickerProps) => {
  const {node} = useLazyLoadQuery<DevelopmentPickerQueryType>(DevelopmentPickerQuery, {id: issueId})
  const environment = useRelayEnvironment()
  const [initialRepository, setInitialRepository] = useState<RepositoryPickerRepository$data | null>(null)
  const [topRepos, setTopRepos] = useState<RepositoryPickerTopRepositoriesQuery$data | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Finish loading when the two async queries resolve
   */
  useEffect(() => {
    if (initialRepository && topRepos) {
      setIsLoading(false)
    }
  }, [initialRepository, topRepos])

  useEffect(() => {
    if (isLoading || !node?.repository || (initialRepository && topRepos)) return

    setIsLoading(true)
    prefetchCurrentRepository(environment, node.repository.owner.login, node.repository.name).subscribe({
      next: (data: RepositoryPickerCurrentRepoQuery$data) => {
        if (data.repository != null) {
          // eslint-disable-next-line no-restricted-syntax
          const current = readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, data.repository)
          setInitialRepository(current)
        }
      },
    })
    prefetchTopRepositories(environment).subscribe({
      next: (data: RepositoryPickerTopRepositoriesQuery$data) => {
        if (data !== null) {
          setTopRepos(data)
        }
      },
    })

    // intentional to run this only once on mount
  }, [environment, initialRepository, isLoading, node?.repository, topRepos])

  return (
    <LazyDevelopmentPickerInternal
      issueId={issueId}
      repoNameWithOwner={node?.repository?.nameWithOwner}
      initialRepository={initialRepository}
      topRepos={topRepos}
      isLoading={isLoading}
      {...rest}
    />
  )
}

type PickerType = 'repos' | 'pulls-branches'
export const LazyDevelopmentPickerInternal = ({
  issueId,
  initialRepository,
  topRepos,
  anchorElement,
  repoPickerSubtitle,
  repoNameWithOwner: initialRepoNameWithOwner,
  prAndBranchPickerSubtitle,
  isCreateBranchDialogOpen,
  linkedBranches,
  linkedPullRequests,
  shortcutEnabled,
  triggerOpen,
  isLoading,
  insidePortal,
}: LazyDevelopmentPickerInternalProps) => {
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()
  const [initialRepoLoading, setInitialRepoLoading] = useState(true)
  const [selectedRepository, setSelectedRepository] = useState<RepositoryPickerRepository$data | null>(null)
  const [activePicker, setActivePicker] = useState<PickerType>('pulls-branches')
  const [repoPickerOpen, setRepoPickerOpen] = useState(false)
  const [pullsPickerOpen, setPullsPickerOpen] = useState(triggerOpen ?? false)

  /**
   * Persist loading until current and top repos are preloaded
   */
  useEffect(() => {
    if (initialRepoLoading && initialRepository !== null && topRepos !== null) {
      setSelectedRepository(initialRepository)
      setInitialRepoLoading(false)
    }
  }, [initialRepoLoading, initialRepository, topRepos])

  const openPicker = useCallback(
    (picker?: PickerType) => {
      switch (picker ?? activePicker) {
        case 'repos':
          setRepoPickerOpen(true)
          setPullsPickerOpen(false)
          break
        case 'pulls-branches':
          setPullsPickerOpen(true)
          setRepoPickerOpen(false)
          break
      }
    },
    [activePicker],
  )

  const onHotKeyPress = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      openPicker()
    },
    [openPicker],
  )
  useKeyPress(shortcutEnabled ? [HOTKEYS.developmentSection] : [], onHotKeyPress, {
    triggerWhenInputElementHasFocus: false,
    triggerWhenPortalIsActive: insidePortal,
  })

  const onSelectRepository = useCallback(
    (repo: RepositoryPickerRepository$data | null) => {
      setSelectedRepository(repo)
      setActivePicker('pulls-branches')
      openPicker('pulls-branches')
    },
    [openPicker],
  )

  const repoNameWithOwner = useMemo(() => {
    if (initialRepoLoading) return initialRepoNameWithOwner ?? ''

    return selectedRepository ? selectedRepository.nameWithOwner : ''
  }, [initialRepoLoading, initialRepoNameWithOwner, selectedRepository])

  const linkedPullRequestsForRepo = useMemo(() => {
    return linkedPullRequests.filter(pr => pr.repository.id === selectedRepository?.id)
  }, [linkedPullRequests, selectedRepository?.id])

  const linkedBranchesForRepo = useMemo(() => {
    return linkedBranches.filter(branch => branch.repository.id === selectedRepository?.id)
  }, [linkedBranches, selectedRepository?.id])

  const handleClickRepoPicker = () => {
    setSelectedRepository(null)
    setActivePicker('repos')
    openPicker('repos')
  }

  const NavigateRepoPickerHeading = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        variant="invisible"
        icon={ArrowLeftIcon}
        size="small"
        aria-label={LABELS.development.repositoryPickerNav}
        onClick={handleClickRepoPicker}
        sx={{
          color: 'fg.default',
          px: 2,
        }}
      />
      <Truncate
        title={repoNameWithOwner}
        sx={{
          fontSize: 1,
          display: 'unset',
          maxWidth: 'unset',
        }}
      >
        {repoNameWithOwner}
      </Truncate>
    </Box>
  )

  const onSelectionChange = useCallback(
    (selected: Array<PullRequestPickerPullRequest$data | BranchPickerRef$data>) => {
      const newItems = selected.filter(
        item =>
          [...linkedPullRequestsForRepo, ...linkedBranchesForRepo].find(prOrBranch => prOrBranch.id === item.id) ===
          undefined,
      )
      const existingItems = [...linkedPullRequests, ...linkedBranches].filter(
        item =>
          item.repository.id !== selectedRepository?.id ||
          selected.find(prOrBranch => prOrBranch.id === item.id) !== undefined,
      )

      const sortedItems = [...existingItems, ...newItems]
      const sortedPrs = sortedItems.filter(item => item.__typename === 'PullRequest')
      const sortedBranches = sortedItems.filter(item => item.__typename === 'Ref')

      linkPullRequestsMutation({
        environment,
        input: {
          baseIssueOrPullRequestId: `${issueId}`,
          linkingIds: sortedPrs.map(pr => pr.id),
        },
        onError: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotUpdateLinkedPullRequests,
          })
        },
        linkingPrs: sortedPrs,
      })

      linkBranchesMutation({
        environment,
        input: {
          baseIssueId: `${issueId}`,
          linkingIds: sortedBranches.map(branch => branch.id),
        },
        onError: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotUpdateLinkedBranches,
          })
        },
      })
    },
    [
      addToast,
      environment,
      issueId,
      linkedBranches,
      linkedBranchesForRepo,
      linkedPullRequests,
      linkedPullRequestsForRepo,
      selectedRepository?.id,
    ],
  )

  return (
    <>
      {/* Due to the internal item picker context and open/close management, not rendering the picker would
          result in a new item being stored on context every time there's a switch between the pickers. */}
      <div hidden={activePicker !== 'repos'}>
        <RepositoryPickerInternal
          initialRepository={undefined}
          topRepositoriesData={topRepos?.viewer || null}
          onSelect={repo => onSelectRepository(repo ?? null)}
          anchorElement={anchorElement}
          title={'Link a branch or pull request'}
          subtitle={repoPickerSubtitle}
          preventClose={isCreateBranchDialogOpen}
          preventDefault={true}
          triggerOpen={repoPickerOpen}
          onOpen={() => setRepoPickerOpen(true)}
          onClose={() => setRepoPickerOpen(false)}
        />
      </div>
      <div hidden={activePicker !== 'pulls-branches'}>
        <LazyPullRequestAndBranchPicker
          repoNameWithOwner={repoNameWithOwner}
          initialSelectedPrs={linkedPullRequestsForRepo}
          initialSelectedBranches={linkedBranchesForRepo}
          onSelectionChange={onSelectionChange}
          anchorElement={anchorElement}
          title={NavigateRepoPickerHeading}
          subtitle={prAndBranchPickerSubtitle}
          // Explicitly disabling it as this complex picker manages its own shortcuts
          shortcutsEnabled={false}
          triggerOpen={pullsPickerOpen}
          onOpen={() => setPullsPickerOpen(true)}
          onClose={() => setPullsPickerOpen(false)}
          preventClose={isCreateBranchDialogOpen}
          loading={isLoading}
        />
      </div>
    </>
  )
}
