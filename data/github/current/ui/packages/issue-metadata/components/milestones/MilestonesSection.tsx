import {MilestoneFragment, MilestonePicker} from '@github-ui/item-picker/MilestonePicker'
import type {
  MilestonePickerMilestone$key,
  MilestonePickerMilestone$data,
} from '@github-ui/item-picker/MilestonePickerMilestone.graphql'
import {ActionList, type SxProp} from '@primer/react'
import {useMemo, useCallback} from 'react'
import {graphql, readInlineData, useFragment, useRelayEnvironment} from 'react-relay'

import {LABELS} from '../../constants/labels'
import type {MilestonesSectionFragment$key} from './__generated__/MilestonesSectionFragment.graphql'
import {Milestone} from './Milestone'
import {ReadonlySectionHeader} from '../ReadonlySectionHeader'
import {Section} from '../Section'
import {SectionHeader} from '../SectionHeader'
import type {MilestonesSectionMilestone$key} from './__generated__/MilestonesSectionMilestone.graphql'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ERRORS} from '@github-ui/item-picker/Errors'
import {commitUpdateIssueMilestoneMutation} from '@github-ui/item-picker/commitUpdateIssueMilestoneMutation'

const ReadonlyMilestonesSectionHeader = () => <ReadonlySectionHeader title={LABELS.sectionTitles.milestones} />

type MilestonesSectionProps = {
  sectionHeader: JSX.Element
  milestone: MilestonePickerMilestone$data | null
} & SxProp
const MilestonesSection = ({sectionHeader, milestone, sx}: MilestonesSectionProps) => (
  <Section sx={sx} sectionHeader={sectionHeader} emptyText={milestone ? undefined : LABELS.emptySections.milestones}>
    <ActionList variant="full">
      <Milestone milestone={milestone} />
    </ActionList>
  </Section>
)

export type CreateIssueMilestonesSectionProps = {
  repo: string
  owner: string
  milestone: MilestonePickerMilestone$data | null
  onSelectionChange: (milestones: MilestonePickerMilestone$data[]) => void
  viewerCanSetMilestone: boolean
  insidePortal: boolean
  shortcutEnabled: boolean
} & SxProp
export function CreateIssueMilestonesSection({
  milestone,
  onSelectionChange,
  viewerCanSetMilestone,
  sx,
  ...sharedConfigProps
}: CreateIssueMilestonesSectionProps) {
  const sectionHeader = !viewerCanSetMilestone ? (
    <ReadonlyMilestonesSectionHeader />
  ) : (
    <MilestonePicker
      onSelectionChanged={milestones => {
        onSelectionChange(milestones)
      }}
      readonly={viewerCanSetMilestone}
      activeMilestone={milestone}
      anchorElement={(anchorProps, ref) => (
        <SectionHeader title={LABELS.sectionTitles.milestones} buttonProps={anchorProps} ref={ref} />
      )}
      showMilestoneDescription={true}
      {...sharedConfigProps}
    />
  )

  return <MilestonesSection sx={sx} sectionHeader={sectionHeader} milestone={milestone} />
}

const milestonesSectionMilestone = graphql`
  fragment MilestonesSectionMilestone on Issue {
    milestone {
      ...MilestonePickerMilestone
    }
  }
`

const MilestonesSectionFragment = graphql`
  fragment MilestonesSectionFragment on Issue {
    repository {
      name
      owner {
        login
      }
    }
    id
    ...MilestonesSectionMilestone
    viewerCanSetMilestone
  }
`

type EditIssueMilestonesSectionProps = {
  issue: MilestonesSectionFragment$key
  onIssueUpdate?: () => void
  singleKeyShortcutsEnabled: boolean
  insideSidePanel?: boolean
}
export function EditIssueMilestonesSection({
  issue,
  onIssueUpdate,
  singleKeyShortcutsEnabled,
  insideSidePanel,
}: EditIssueMilestonesSectionProps) {
  const data = useFragment(MilestonesSectionFragment, issue)
  const {
    repository: {
      owner: {login: owner},
      name: repo,
    },
    id: issueId,
    viewerCanSetMilestone,
  } = data
  const {milestone} = useFragment<MilestonesSectionMilestone$key>(milestonesSectionMilestone, data)

  const activeMilestone =
    milestone !== undefined
      ? // eslint-disable-next-line no-restricted-syntax
        readInlineData<MilestonePickerMilestone$key>(MilestoneFragment, milestone)
      : null

  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()

  const onSelectionChanged = useCallback(
    (selectedMilestones: MilestonePickerMilestone$data[]) => {
      commitUpdateIssueMilestoneMutation({
        environment,
        input: {issueId, milestone: selectedMilestones.length > 0 ? selectedMilestones[0]! : null},
        onError: () =>
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotUpdateMilestone,
          }),
        onCompleted: onIssueUpdate,
      })
    },
    [addToast, environment, issueId, onIssueUpdate],
  )

  const sectionHeader = useMemo(() => {
    if (!viewerCanSetMilestone) {
      return <ReadonlyMilestonesSectionHeader />
    }

    return (
      <MilestonePicker
        repo={repo}
        owner={owner}
        onSelectionChanged={onSelectionChanged}
        anchorElement={(anchorProps, ref) => (
          <SectionHeader title={LABELS.sectionTitles.milestones} buttonProps={anchorProps} ref={ref} />
        )}
        readonly={!viewerCanSetMilestone}
        shortcutEnabled={singleKeyShortcutsEnabled}
        activeMilestone={activeMilestone ?? null}
        insidePortal={insideSidePanel}
        showMilestoneDescription={true}
      />
    )
  }, [
    viewerCanSetMilestone,
    repo,
    owner,
    onSelectionChanged,
    singleKeyShortcutsEnabled,
    activeMilestone,
    insideSidePanel,
  ])

  return <MilestonesSection sectionHeader={sectionHeader} milestone={activeMilestone ?? null} />
}
