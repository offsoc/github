import {Box, Text} from '@primer/react'

import type {RepositoryItem, SuggestedIssue, SuggestedPullRequest} from '../api/repository/contracts'
import {PickerItem} from './common/picker-list'
import {ItemState} from './item-state'

interface SuggestedItemOptionProps extends React.LiHTMLAttributes<HTMLLIElement> {
  item: RepositoryItem
}

export const SuggestedItemOption: React.FC<SuggestedItemOptionProps> = ({item, ...itemProps}) => {
  return (
    <PickerItem {...itemProps}>
      <Box sx={{alignItems: 'center', overflow: 'hidden', flex: '1', display: 'flex'}}>
        <Box sx={{flexShrink: 0, mr: 2, display: 'flex'}}>
          <ItemState
            type={item.type}
            state={item.state}
            stateReason={(item as SuggestedIssue)?.stateReason}
            isDraft={!!(item as SuggestedPullRequest).isDraft}
          />
        </Box>
        <span>{item.title}</span>
        <Text sx={{ml: 1, color: 'fg.muted'}}>{`#${item.number}`}</Text>
      </Box>
    </PickerItem>
  )
}
