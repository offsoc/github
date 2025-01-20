import type {LabelPickerLabel$data, LabelPickerLabel$key} from '@github-ui/item-picker/LabelPickerLabel.graphql'
import {LabelFragment, LabelPicker} from '@github-ui/item-picker/LabelPicker'
import {useMemo, useCallback} from 'react'
import {readInlineData} from 'react-relay'
import {graphql, useFragment, usePaginationFragment, useRelayEnvironment} from 'react-relay/hooks'

import {LABELS} from '../../constants/labels'
import {TEST_IDS} from '../../constants/test-ids'
import {LabelsList as Labels, type Label} from '@github-ui/labels-list'
import {ReadonlySectionHeader} from '@github-ui/issue-metadata/ReadonlySectionHeader'
import {SectionHeader} from '@github-ui/issue-metadata/SectionHeader'
import {Section} from '@github-ui/issue-metadata/Section'
import type {LabelsSectionAssignedLabelsQuery} from './__generated__/LabelsSectionAssignedLabelsQuery.graphql'
import LabelsSectionAssignedLabelsFragment, {
  type LabelsSectionAssignedLabels$key,
} from './__generated__/LabelsSectionAssignedLabels.graphql'
import type {LabelsSectionFragment$key} from './__generated__/LabelsSectionFragment.graphql'
import type {SxProp} from '@primer/react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ERRORS} from '@github-ui/item-picker/Errors'
import {commitSetLabelsForLabelableMutation} from '@github-ui/item-picker/commitSetLabelsForLabelableMutation'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'

const ReadonlyLabelsSectionHeader = () => <ReadonlySectionHeader title={LABELS.sectionTitles.labels} />

type LabelsSectionProps = {
  sectionHeader: JSX.Element
  labels: Label[]
} & SxProp
const LabelsSection = ({sectionHeader, labels}: LabelsSectionProps) => {
  return (
    <Section sectionHeader={sectionHeader} emptyText={labels.length > 0 ? undefined : LABELS.emptySections.labels}>
      <Labels labels={labels} testId={TEST_IDS.issueLabels} />
    </Section>
  )
}

type CreateIssueLabelsSectionProps = {
  repo: string
  owner: string
  readonly: boolean
  labels: LabelPickerLabel$data[]
  onSelectionChange: (labels: LabelPickerLabel$data[]) => void
  shortcutEnabled: boolean
}
export const CreateIssueLabelsSection = ({
  repo,
  owner,
  readonly,
  labels,
  onSelectionChange,
  ...sharedConfigProps
}: CreateIssueLabelsSectionProps) => {
  const {issues_react_create_new_label} = useFeatureFlags()

  const sectionHeader = readonly ? (
    <ReadonlyLabelsSectionHeader />
  ) : (
    <LabelPicker
      repo={repo}
      owner={owner}
      readonly={readonly}
      labels={labels}
      onSelectionChanged={onSelectionChange}
      showNoMatchItem={issues_react_create_new_label}
      anchorElement={(anchorProps, ref) => (
        <SectionHeader title={LABELS.sectionTitles.labels} buttonProps={anchorProps} ref={ref} />
      )}
      {...sharedConfigProps}
    />
  )
  return <LabelsSection sectionHeader={sectionHeader} labels={labels} />
}

graphql`
  fragment LabelsSectionAssignedLabels on Labelable
  @argumentDefinitions(cursor: {type: "String"}, assignedLabelPageSize: {type: "Int", defaultValue: 100})
  @refetchable(queryName: "LabelsSectionAssignedLabelsQuery") {
    labels(first: $assignedLabelPageSize, after: $cursor, orderBy: {field: NAME, direction: ASC})
      @connection(key: "MetadataSectionAssignedLabels_labels") {
      edges {
        node {
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...LabelPickerLabel
        }
      }
    }
  }
`

const labelsSectionFragment = graphql`
  fragment LabelsSectionFragment on Issue {
    id
    repository {
      name
      owner {
        login
      }
      isArchived
    }
    ...LabelsSectionAssignedLabels
    viewerCanLabel
  }
`

export type EditIssueLabelsSectionProps = {
  onIssueUpdate?: () => void
  singleKeyShortcutsEnabled: boolean
  issue: LabelsSectionFragment$key
  insideSidePanel?: boolean
}

export function EditIssueLabelsSection({
  issue,
  onIssueUpdate,
  singleKeyShortcutsEnabled,
  insideSidePanel,
}: EditIssueLabelsSectionProps) {
  const {issues_react_create_new_label} = useFeatureFlags()

  const data = useFragment(labelsSectionFragment, issue)
  const {
    repository: {
      owner: {login: owner},
      name: repo,
      isArchived: isRepositoryArchived,
    },
  } = data
  const {data: labelDataRaw} = usePaginationFragment<LabelsSectionAssignedLabelsQuery, LabelsSectionAssignedLabels$key>(
    LabelsSectionAssignedLabelsFragment,
    data,
  )

  const labelData = labelDataRaw

  const {id: issueId, viewerCanLabel} = data

  const labels = useMemo(
    () =>
      labelData.labels?.edges?.flatMap(e =>
        // eslint-disable-next-line no-restricted-syntax
        e?.node ? [readInlineData<LabelPickerLabel$key>(LabelFragment, e?.node)] : [],
      ) || [],
    [labelData],
  )

  const readonlyLabel = !viewerCanLabel || isRepositoryArchived

  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()

  const onSelectionChanged = useCallback(
    (selectedLabels: LabelPickerLabel$data[]) => {
      commitSetLabelsForLabelableMutation({
        environment,
        input: {labelableId: issueId, labels: selectedLabels, labelableTypeName: 'Issue'},
        onError: () =>
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotUpdateLabels,
          }),
        onCompleted: onIssueUpdate,
      })
    },
    [addToast, environment, issueId, onIssueUpdate],
  )

  const labelSectionHeader = useMemo(() => {
    if (readonlyLabel) {
      return <ReadonlyLabelsSectionHeader />
    }

    return (
      <LabelPicker
        repo={repo}
        owner={owner}
        readonly={readonlyLabel}
        shortcutEnabled={singleKeyShortcutsEnabled}
        labels={labels}
        onSelectionChanged={onSelectionChanged}
        anchorElement={(anchorProps, ref) => (
          <SectionHeader title={LABELS.sectionTitles.labels} buttonProps={anchorProps} ref={ref} />
        )}
        insidePortal={insideSidePanel}
        showNoMatchItem={issues_react_create_new_label}
      />
    )
  }, [
    readonlyLabel,
    issues_react_create_new_label,
    repo,
    owner,
    singleKeyShortcutsEnabled,
    labels,
    onSelectionChanged,
    insideSidePanel,
  ])

  return <LabelsSection sectionHeader={labelSectionHeader} labels={labels} />
}
