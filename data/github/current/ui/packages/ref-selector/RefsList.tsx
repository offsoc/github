import {Box} from '@primer/react'

import {FixedSizeVirtualList} from './FixedSizeVirtualList'
import {RefItem} from './RefItem'

interface RefsListProps {
  currentCommitish: string
  defaultBranch: string
  filterText: string
  /**
   * A function to create an href to which we should navigate when a ref is selected.
   */
  getHref?: (ref: string) => string
  refs: string[]
  onSelectItem?: (ref: string) => void
}

/**
 * The virtualized list has a fixed height. If we don't have very many refs,
 * don't virtualize the list so that the container can shrink.
 */
const virtualizationThreshold = 20
const maxHeight = 330

/**
 * A list of refs that is virtualized to allow very large lists.
 */
export function RefsList(props: RefsListProps) {
  return props.refs.length > virtualizationThreshold ? <VirtualRefsList {...props} /> : <FullRefsList {...props} />
}

/**
 * Non-virtual implementation
 */
function FullRefsList({refs, defaultBranch, currentCommitish, getHref, filterText, onSelectItem}: RefsListProps) {
  return (
    <Box sx={{maxHeight, overflowY: 'auto'}}>
      {refs.map(gitRef => (
        <RefItem
          key={gitRef}
          href={getHref?.(gitRef)}
          isCurrent={currentCommitish === gitRef}
          isDefault={defaultBranch === gitRef}
          filterText={filterText}
          gitRef={gitRef}
          onSelect={onSelectItem}
          onClick={onSelectItem}
          ariaPosInSet={refs.indexOf(gitRef) + 1}
          ariaSetSize={refs.length}
        />
      ))}
    </Box>
  )
}

function VirtualRefsList({refs, defaultBranch, currentCommitish, getHref, filterText, onSelectItem}: RefsListProps) {
  return (
    <FixedSizeVirtualList
      items={refs}
      itemHeight={32}
      sx={{maxHeight, overflowY: 'auto'}}
      makeKey={gitRef => gitRef}
      renderItem={gitRef => (
        <RefItem
          key={gitRef}
          href={getHref?.(gitRef)}
          isCurrent={currentCommitish === gitRef}
          isDefault={defaultBranch === gitRef}
          filterText={filterText}
          gitRef={gitRef}
          onSelect={onSelectItem}
          onClick={onSelectItem}
          ariaPosInSet={refs.indexOf(gitRef) + 1}
          ariaSetSize={refs.length}
        />
      )}
    />
  )
}
