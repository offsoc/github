import {testIdProps} from '@github-ui/test-id-props'

import type {LinkedPullRequest} from '../../../api/common-contracts'
import {ItemType} from '../../../api/memex-items/item-type'
import {type ColumnValue, isEmpty, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {PillPlaceholder} from '../../common/placeholders'
import {BaseCell} from '../cells/base-cell'
import {LinkedPullRequestGroup} from '../cells/linked-pull-requests-group'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<Array<LinkedPullRequest>>
  model: MemexItemModel
}>

export const LoadingLinkedPullRequestsCell = () => (
  <BaseCell>
    <PillPlaceholder minWidth={30} maxWidth={60} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const LinkedPullRequestsRenderer = withCellRenderer<Props>(function LinkedPullRequestsRenderer({
  currentValue,
  model,
}) {
  useRecordCellRenderer('LinkedPullRequestsRenderer', model.id)

  if (isLoading(currentValue)) {
    return <LoadingLinkedPullRequestsCell />
  }

  if (model.contentType === ItemType.DraftIssue || isEmpty(currentValue)) {
    return null
  }

  return <LinkedPullRequestGroup linkedPullRequests={currentValue.value} />
})

LinkedPullRequestsRenderer.displayName = 'LinkedPullRequestsRenderer'
