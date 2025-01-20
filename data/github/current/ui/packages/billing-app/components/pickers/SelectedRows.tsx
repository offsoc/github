import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {XIcon} from '@primer/octicons-react'
import {Box, IconButton, Text} from '@primer/react'

import {Fonts, listStyle} from '../../utils'

import type {Item} from '../../types/common'

interface Props<T> {
  loading?: boolean
  removeOption: (id: T) => void
  selected: Array<Item<T>>
  totalCount?: number
}

export function SelectedRows<T>({loading = false, removeOption, selected, totalCount}: Props<T>) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}} data-testid="selected-rows-wrapper">
      <Text sx={{color: 'fg.muted', fontSize: 1}} data-testid="selected-rows-count">
        {totalCount && totalCount > 0 ? totalCount : selected.length} selected
      </Text>
      <ul data-testid="selected-rows-list">
        {loading
          ? Array(totalCount)
              .fill(null)
              .map((_, idx) => (
                <Box
                  as="li"
                  key={idx}
                  sx={{
                    ...listStyle,
                  }}
                >
                  <LoadingSkeleton variant="rounded" sx={{width: '100%', height: '28px'}} />
                </Box>
              ))
          : selected.map(item => (
              <Box
                as="li"
                key={String(item.id)}
                sx={{
                  ...listStyle,
                }}
              >
                {item.rowLeadingVisual()}
                <Text
                  as="p"
                  sx={{
                    flex: 1,
                    px: 1,
                    color: 'fg.subtle',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    m: 0,
                    fontSize: Fonts.FontSizeSmall,
                  }}
                >
                  {item.text}
                </Text>
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  icon={XIcon}
                  variant="invisible"
                  size="small"
                  onClick={() => removeOption(item.id)}
                  aria-label="Remove option"
                  style={{visibility: item.viewOnly ? 'hidden' : 'visible'}}
                />
              </Box>
            ))}
      </ul>
    </Box>
  )
}
