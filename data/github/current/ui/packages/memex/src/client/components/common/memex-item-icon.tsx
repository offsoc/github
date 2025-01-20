import {IssueDraftIcon, LockIcon} from '@primer/octicons-react'
import {Octicon} from '@primer/react'
import {memo} from 'react'

import type {TitleValueWithContentType} from '../../api/columns/contracts/storage'
import {ItemType} from '../../api/memex-items/item-type'
import {assertNever} from '../../helpers/assert-never'
import {type ColumnValue, hasValue} from '../../models/column-value'
import {ItemStateForTitle} from '../item-state'

type MemexItemIconProps = {
  /** Wrapped title value to detect and handle empty state */
  titleColumn: ColumnValue<TitleValueWithContentType>
}

export const MemexItemIcon = memo(function MemexItemIcon({titleColumn}: MemexItemIconProps) {
  if (!hasValue(titleColumn)) {
    return null
  }

  if (!titleColumn) {
    return null
  }

  switch (titleColumn.value.contentType) {
    case ItemType.RedactedItem:
      return <LockIcon aria-label="Redacted item" />
    case ItemType.DraftIssue:
      return <Octicon icon={IssueDraftIcon} sx={{color: 'fg.muted'}} aria-label="Draft issue" />
    case ItemType.Issue:
    case ItemType.PullRequest: {
      return <ItemStateForTitle title={titleColumn.value} />
    }
    default:
      assertNever(titleColumn.value)
  }
})
