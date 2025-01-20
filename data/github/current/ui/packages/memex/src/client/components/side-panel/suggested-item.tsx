import {testIdProps} from '@github-ui/test-id-props'
import {Box, Checkbox, Link, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo, useCallback, useRef} from 'react'

import type {RepositoryItem, SuggestedIssue, SuggestedPullRequest} from '../../api/repository/contracts'
import useIsVisible from '../board/hooks/use-is-visible'
import {SanitizedHtml} from '../dom/sanitized-html'
import {ItemState} from '../item-state'
import {useBulkAddItems} from './bulk-add/bulk-add-items-provider'

type SuggestedItemProps = {
  item: RepositoryItem
  keyName: string
  url: string
}

const listItemStyles: BetterSystemStyleObject = {
  borderBottom: '1px solid',
  borderColor: 'border.default',
  '&:last-child': {borderBottom: 'none'},
  display: 'flex',
  alignItems: 'center',
}

const linkStyle: BetterSystemStyleObject = {
  color: 'fg.default',
  overflow: 'hidden',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  '&:hover': {
    color: 'accent.fg',
  },
}

export const SuggestedItem = memo<SuggestedItemProps>(function SuggestedItem({item, keyName, url}) {
  const ref = useRef(null)
  const {isVisible} = useIsVisible({ref})

  return (
    <Box key={keyName} ref={ref} as="li" sx={listItemStyles}>
      {isVisible ? <SuggestedItemInner keyName={keyName} item={item} url={url} /> : null}
    </Box>
  )
})

const SuggestedItemInner = memo<SuggestedItemProps>(function SuggestedItemInner({item, url}) {
  const {selectItem, isSelected} = useBulkAddItems()

  const onCheck = useCallback(() => {
    selectItem(item)
  }, [selectItem, item])

  const itemTitleId = `item-title-${item.number}`

  return (
    <>
      <Box as="label" sx={{pl: 1}} {...testIdProps('repo-item')}>
        <Checkbox
          sx={{alignSelf: 'start'}}
          aria-labelledby={itemTitleId}
          checked={isSelected(item.number)}
          onChange={onCheck}
        />
      </Box>
      <Box sx={{pl: 2}}>
        <ItemState
          type={item.type}
          state={item.state}
          stateReason={(item as SuggestedIssue)?.stateReason}
          isDraft={!!(item as SuggestedPullRequest).isDraft}
        />
      </Box>
      <Box sx={{p: 2, display: 'flex', flex: '1', justifyContent: 'flex-start', width: '100%', minWidth: '0'}}>
        <Box
          as="span"
          id={itemTitleId}
          sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <Link sx={linkStyle} target="_blank" rel="noreferrer" href={url} tabIndex={-1}>
            <SanitizedHtml>{item.title}</SanitizedHtml>
          </Link>
        </Box>
        <Text sx={{ml: 2, color: 'fg.muted'}}>{`#${item.number}`}</Text>
      </Box>
    </>
  )
})
