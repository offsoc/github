import {ReadonlySectionHeader} from '@github-ui/issue-metadata/ReadonlySectionHeader'
import {Section} from '@github-ui/issue-metadata/Section'
import {SectionHeader} from '@github-ui/issue-metadata/SectionHeader'
import {commitSetLabelsForLabelableMutation} from '@github-ui/item-picker/commitSetLabelsForLabelableMutation'
import {ERRORS} from '@github-ui/item-picker/Errors'
import {LabelFragment, LabelPicker} from '@github-ui/item-picker/LabelPicker'
import type {LabelPickerAssignedLabels$key} from '@github-ui/item-picker/LabelPickerAssignedLabels.graphql'
import LabelPickerAssignedLabelsReaderFragment from '@github-ui/item-picker/LabelPickerAssignedLabels.graphql'
import type {LabelPickerAssignedLabelsQuery} from '@github-ui/item-picker/LabelPickerAssignedLabelsQuery.graphql'
import type {LabelPickerLabel$data, LabelPickerLabel$key} from '@github-ui/item-picker/LabelPickerLabel.graphql'
import {LabelsList} from '@github-ui/labels-list'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ActionList} from '@primer/react'
import {useCallback, useMemo} from 'react'
import {graphql, readInlineData, useFragment, usePaginationFragment, useRelayEnvironment} from 'react-relay'

import type {LabelSection_pullRequest$key} from './__generated__/LabelSection_pullRequest.graphql'

export function LabelSection({
  pullRequest,
  repoName,
  repoOwner,
}: {
  pullRequest: LabelSection_pullRequest$key
  repoName: string
  repoOwner: string
}) {
  const pullRequestData = useFragment(
    graphql`
      fragment LabelSection_pullRequest on PullRequest {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...LabelPickerAssignedLabels
        viewerCanUpdate
        id
      }
    `,
    pullRequest,
  )
  const {data: labelData} = usePaginationFragment<LabelPickerAssignedLabelsQuery, LabelPickerAssignedLabels$key>(
    LabelPickerAssignedLabelsReaderFragment,
    pullRequestData,
  )

  const labels = useMemo(
    () =>
      labelData.labels?.edges?.flatMap(e =>
        // eslint-disable-next-line no-restricted-syntax
        e?.node ? [readInlineData<LabelPickerLabel$key>(LabelFragment, e.node)] : [],
      ) || [],
    [labelData],
  )
  const canEdit = pullRequestData.viewerCanUpdate

  const pullRequestId = pullRequestData.id

  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()

  const onSelectionChanged = useCallback(
    (selectedLabels: LabelPickerLabel$data[]) => {
      commitSetLabelsForLabelableMutation({
        environment,
        input: {labelableId: pullRequestId, labels: selectedLabels, labelableTypeName: 'PullRequest'},
        onError: () =>
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotUpdateLabels,
          }),
      })
    },
    [addToast, environment, pullRequestId],
  )

  const labelSectionHeader = useMemo(() => {
    return (
      <LabelPicker
        labels={labels}
        owner={repoOwner}
        readonly={canEdit}
        repo={repoName}
        shortcutEnabled={false}
        anchorElement={props =>
          canEdit ? (
            <SectionHeader buttonProps={props} headingProps={{as: 'h3'}} title="Labels" />
          ) : (
            <ReadonlySectionHeader title="Labels" />
          )
        }
        onSelectionChanged={onSelectionChanged}
      />
    )
  }, [labels, repoOwner, canEdit, repoName, onSelectionChanged])

  return (
    <Section emptyText={labels.length > 0 ? undefined : 'None'} id="labels-section" sectionHeader={labelSectionHeader}>
      <ActionList sx={{py: 0, px: 0, width: '100%'}}>
        <LabelsList labels={labels} />
      </ActionList>
    </Section>
  )
}
