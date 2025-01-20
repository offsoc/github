import {PullRequestPickerFragment} from '@github-ui/item-picker/PullRequestPicker'
import type {
  PullRequestPickerPullRequest$data,
  PullRequestPickerPullRequest$key,
} from '@github-ui/item-picker/PullRequestPickerPullRequest.graphql'
import {ActionList, Button, Box, Text} from '@primer/react'
import {CopilotIcon} from '@primer/octicons-react'
import {useCallback, useMemo, useState} from 'react'
import {graphql, readInlineData, useFragment} from 'react-relay'

import {LABELS} from '../../../constants/labels'
import {TEST_IDS} from '../../../constants/test-ids'
import {VALUES} from '../../../constants/values'
import type {
  DevelopmentSectionFragment$data,
  DevelopmentSectionFragment$key,
} from './__generated__/DevelopmentSectionFragment.graphql'
import {LinkedPullRequests} from './LinkedPullRequests'
import {ReadonlySectionHeader} from '@github-ui/issue-metadata/ReadonlySectionHeader'
import {Section} from '@github-ui/issue-metadata/Section'
import {LazyDevelopmentPickerOnClick} from './DevelopmentPicker'
import {BranchPickerRefFragment} from '@github-ui/item-picker/BranchPicker'
import type {BranchPickerRef$data, BranchPickerRef$key} from '@github-ui/item-picker/BranchPickerRef.graphql'
import {LinkedBranches} from './LinkedBranches'
import {NoBranchesOrLinkedPullRequests} from './NoBranchesOrLinkedPullRequests'
import {BranchNextStepLocal} from './BranchNextStepLocal'
import type {BranchNextStep} from './CreateBranchDialog'

import {BranchNextStepDesktop} from './BranchNextStepDesktop'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {SectionHeader} from '@github-ui/issue-metadata/SectionHeader'

const developmentSectionFragment = graphql`
  fragment DevelopmentSectionFragment on Issue {
    repository {
      name
      owner {
        login
      }
    }
    id
    title
    number
    linkedBranches(first: 25) {
      nodes {
        id
        ref {
          ...BranchPickerRef
        }
      }
    }
    closedByPullRequestsReferences(first: 10, includeClosedPrs: true) {
      nodes {
        ...PullRequestPickerPullRequest
      }
    }
    ...LinkedPullRequests
    viewerCanUpdateNext
  }
`

export const DevelopmentSectionReposGraphqlQuery = graphql`
  query DevelopmentSectionReposQuery($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads This will be fixed on the item picker is refactored
      ...RepositoryPickerRepository
    }
    viewer {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads This will be fixed on the item picker is refactored
      ...RepositoryPickerTopRepositories
    }
  }
`

export const DevelopmentSectionBranchesGraphqlQuery = graphql`
  query DevelopmentSectionBranchesQuery($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      ...BranchPickerRepositoryBranchRefs
    }
  }
`

export type DevelopmentSectionBaseProps = {
  onIssueUpdate?: () => void
  shortcutEnabled: boolean
  insideSidePanel?: boolean
}

type DevelopmentSectionInternalProps = DevelopmentSectionBaseProps & {
  issue: DevelopmentSectionFragment$key
}

export function DevelopmentSectionFallback() {
  return (
    <Section
      sectionHeader={<ReadonlySectionHeader title={LABELS.sectionTitles.development} />}
      emptyText={LABELS.emptySections.development}
    />
  )
}

export function DevelopmentSection({issue, shortcutEnabled, insideSidePanel}: DevelopmentSectionInternalProps) {
  const [isCreateBranchDialogOpen, setCreateBranchDialogOpen] = useState(false)

  // TODO: use the `onIssueUpdate` callback once editing is implemented
  const data = useFragment(developmentSectionFragment, issue)
  const {id: issueId, title, number, repository} = data
  const readonly = !data.viewerCanUpdateNext

  const [linkedBranches, linkedPullRequests] = useMemo(
    () => [getLinkedBranches(data), getLinkedPullRequests(data)],
    [data],
  )

  const hasSomeData = linkedBranches.length > 0 || linkedPullRequests.length > 0

  const [branchNextStep, setBranchNextStep] = useState<BranchNextStep>('none')
  const [newBranchName, setNewBranchName] = useState<string | null>(null)

  const noBranchesOrLinkedPullRequests = useCallback(
    (linkText: string, before?: string, after?: string) => {
      return (
        <NoBranchesOrLinkedPullRequests
          issueId={issueId}
          title={title}
          number={number}
          owner={repository.owner.login}
          repo={repository.name}
          before={before}
          after={after}
          linkText={linkText}
          reportCreateBranchDialogOpen={setCreateBranchDialogOpen}
          setBranchNextStep={setBranchNextStep}
          setNewBranchName={setNewBranchName}
        />
      )
    },
    [issueId, number, repository.name, repository.owner.login, title],
  )

  const developmentSectionHeader = useMemo(() => {
    if (readonly) {
      return <ReadonlySectionHeader title={LABELS.sectionTitles.development} />
    }

    return (
      <LazyDevelopmentPickerOnClick
        issueId={issueId}
        anchorElement={props => <SectionHeader title={LABELS.sectionTitles.development} buttonProps={props} />}
        repoPickerSubtitle={noBranchesOrLinkedPullRequests(
          LABELS.development.createBranch.toLowerCase(),
          LABELS.development.repoPickerSubtitle,
        )}
        prAndBranchPickerSubtitle={noBranchesOrLinkedPullRequests(
          LABELS.development.createBranch.toLowerCase(),
          LABELS.development.prsBranchesPickerSubtitle,
        )}
        isCreateBranchDialogOpen={isCreateBranchDialogOpen}
        linkedBranches={linkedBranches}
        linkedPullRequests={linkedPullRequests}
        shortcutEnabled={shortcutEnabled}
        insidePortal={insideSidePanel}
      />
    )
  }, [
    readonly,
    issueId,
    noBranchesOrLinkedPullRequests,
    isCreateBranchDialogOpen,
    linkedBranches,
    linkedPullRequests,
    shortcutEnabled,
    insideSidePanel,
  ])

  const copilotWorkspaceEnabled = useFeatureFlag('copilot_workspace')

  return (
    <Section sectionHeader={developmentSectionHeader}>
      {copilotWorkspaceEnabled && (
        // When the `copilot_workspace` feature flag is enabled,
        // display an "Open in Workspace" button that allows users
        // to open the current issue in Copilot Workspace.
        // For more information about Copilot Workspace,
        // see https://githubnext.com/projects/copilot-workspace
        <Box sx={{px: 2, py: 2}}>
          <Button
            leadingVisual={CopilotIcon}
            as="a"
            href={`https://copilot-workspace.githubnext.com/${repository.owner.login}/${repository.name}/issues/${number}`}
            sx={{width: '100%'}}
          >
            {LABELS.development.copilot.open}
          </Button>
        </Box>
      )}
      {!hasSomeData && (
        <Text sx={{fontSize: 0, px: 2, mb: 2, mt: 1, color: 'fg.muted', display: 'block'}}>
          {!readonly &&
            noBranchesOrLinkedPullRequests(
              LABELS.development.createBranch,
              undefined,
              LABELS.development.createBranchSuffix,
            )}
          {readonly && LABELS.emptySections.development}
        </Text>
      )}
      {branchNextStep === 'local' && (
        <BranchNextStepLocal branch={newBranchName} onClose={() => setBranchNextStep('none')} />
      )}
      {branchNextStep === 'desktop' && (
        <BranchNextStepDesktop
          owner={repository.owner.login}
          repository={repository.name}
          branch={newBranchName}
          onClose={() => setBranchNextStep('none')}
        />
      )}
      <ActionList variant={'full'} data-testid={TEST_IDS.linkedPullRequestContainer} sx={{overflowWrap: 'anywhere'}}>
        <LinkedBranches linkedBranches={linkedBranches} />
        <LinkedPullRequests linkedPullRequests={linkedPullRequests} />
      </ActionList>
    </Section>
  )
}

export type LinkedBranch = {
  name: string
  repositoryWithOwner: string
  repositoryId: string
  id: string
}

function getLinkedPullRequests(developmentData: DevelopmentSectionFragment$data): PullRequestPickerPullRequest$data[] {
  return (
    developmentData.closedByPullRequestsReferences?.nodes
      ?.flatMap(node => {
        if (!node) return []
        // eslint-disable-next-line no-restricted-syntax
        return readInlineData<PullRequestPickerPullRequest$key>(PullRequestPickerFragment, node)
      })
      .slice(0, VALUES.maxLinkedPullRequests) || []
  )
}

function getLinkedBranches(developmentData: DevelopmentSectionFragment$data): BranchPickerRef$data[] {
  return (
    developmentData.linkedBranches?.nodes
      ?.flatMap(node => {
        if (!node || !node.ref) return []
        // eslint-disable-next-line no-restricted-syntax
        return readInlineData<BranchPickerRef$key>(BranchPickerRefFragment, node.ref)
      })
      .slice(0, VALUES.maxLinkedBranches) || []
  )
}
