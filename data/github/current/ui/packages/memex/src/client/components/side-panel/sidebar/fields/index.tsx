import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'

import type {ServerDateValue} from '../../../../api/columns/contracts/date'
import type {Iteration} from '../../../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../../../api/columns/contracts/memex-column'
import type {NumericValue} from '../../../../api/columns/contracts/number'
import type {PersistedOption} from '../../../../api/columns/contracts/single-select'
import type {EnrichedText} from '../../../../api/columns/contracts/text'
import type {
  ExtendedRepository,
  IssueType,
  Label as LabelInterface,
  LinkedPullRequest,
  Milestone,
  User,
} from '../../../../api/common-contracts'
import type {SidePanelItem} from '../../../../api/memex-items/side-panel-item'
import type {SidePanelMetadata} from '../../../../api/side-panel/contracts'
import type {ColumnModel} from '../../../../models/column-model'
import {Resources} from '../../../../strings'
import {IssueTypeToken} from '../../../fields/issue-type-token'
import {LinkedPullRequestToken} from '../../../fields/linked-pr-token'
import {RepositoryToken} from '../../../fields/repository/repository-token'
import {AssigneeField} from './assignees-field'
import {Field, FieldValue} from './core'
import {DateField} from './date-field'
import {IterationField} from './iteration-field'
import {LabelField} from './labels-field'
import {MilestoneField} from './milestone-field'
import {NumberField} from './number-field'
import {SingleSelectField} from './single-select-field'
import {TextField} from './text-field'
import type {SidePaneSideBarItemValueType} from './types'

const MAX_FIELD_VALUE_LENGTH = 10

export const SidePanelSidebarField: React.FC<{
  item: SidePanelItem
  metadata: SidePanelMetadata
  content: SidePaneSideBarItemValueType
  field: ColumnModel
}> = ({item, content, field, metadata}) => {
  let fieldContent = <FieldValue sx={{color: 'fg.subtle'}}>{Resources.noneYet}</FieldValue>

  switch (field.dataType) {
    // system columns, editable for both memex and non-memex items
    // we can edit these fields based on it's metadata
    case MemexColumnDataType.Assignees: {
      content = content as Array<User>
      fieldContent = <AssigneeField model={item} columnModel={field} content={metadata.assignees} onSaved={noop} />
      break
    }
    case MemexColumnDataType.Labels: {
      content = content as Array<LabelInterface>
      fieldContent = <LabelField model={item} columnModel={field} content={metadata.labels} onSaved={noop} />
      break
    }
    case MemexColumnDataType.Milestone: {
      content = content as Milestone
      fieldContent = <MilestoneField model={item} columnModel={field} content={metadata.milestone} onSaved={noop} />
      break
    }
    // non-system columns
    case MemexColumnDataType.Iteration: {
      content = content as Iteration
      fieldContent = <IterationField model={item} columnModel={field} content={content} onSaved={noop} />
      break
    }
    case MemexColumnDataType.SingleSelect: {
      content = content as PersistedOption
      fieldContent = <SingleSelectField model={item} columnModel={field} content={content} onSaved={noop} />
      break
    }
    case MemexColumnDataType.Text: {
      content = content as EnrichedText
      fieldContent = <TextField model={item} columnModel={field} content={content} onSaved={noop} />
      break
    }
    case MemexColumnDataType.Date: {
      content = content as ServerDateValue
      fieldContent = <DateField model={item} columnModel={field} content={content} onSaved={noop} />
      break
    }
    case MemexColumnDataType.Number: {
      content = content as NumericValue
      fieldContent = <NumberField model={item} columnModel={field} content={content} onSaved={noop} />
      break
    }
    case MemexColumnDataType.LinkedPullRequests: {
      content = content as Array<LinkedPullRequest> | undefined
      if (content?.length) {
        fieldContent = (
          <FieldValue>
            <Box sx={{display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-start'}}>
              {content
                ?.slice(0, MAX_FIELD_VALUE_LENGTH)
                .map(linkedPullRequest => (
                  <LinkedPullRequestToken linkedPullRequest={linkedPullRequest} key={linkedPullRequest.id} />
                ))}
            </Box>
          </FieldValue>
        )
      } else {
        fieldContent = (
          <FieldValue sx={{color: 'fg.subtle'}}>{Resources.emptyColumnNameValue.linkedPullRequest}</FieldValue>
        )
      }
      break
    }
    case MemexColumnDataType.IssueType: {
      content = content as IssueType
      if (content) {
        fieldContent = (
          <FieldValue>
            <IssueTypeToken issueType={content} />
          </FieldValue>
        )
      }
      break
    }
    case MemexColumnDataType.Repository: {
      const repo = content as ExtendedRepository | undefined
      if (repo) {
        fieldContent = (
          <FieldValue>
            <RepositoryToken repository={repo} />
          </FieldValue>
        )
      }
      break
    }
    default:
      if (content) {
        fieldContent = <FieldValue>{content}</FieldValue>
      }
  }

  return (
    <Field label={field.name} {...testIdProps(`sidebar-field-${field.name}`)}>
      {fieldContent}
    </Field>
  )
}
