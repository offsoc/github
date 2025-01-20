import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo, type ReactNode} from 'react'

import {ObserverProvider} from '../../../../components/board/hooks/use-is-visible'
import type {MemexItemModel} from '../../../../models/memex-item-model'
import {Loader, NoArchivedItems, NoFilteredItems} from './archive-empty-states'
import {ArchiveListItem} from './archive-list-item'

const ulStyles: BetterSystemStyleObject = {
  listStyleType: 'none',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
  borderTop: 0,
  borderColor: 'border.default',
  borderRadius: 6,
  borderTopRightRadius: 0,
  borderTopLeftRadius: 0,
  contentVisibility: 'auto',
  m: 0,
}

type ArchiveListProps = React.PropsWithChildren<{
  filteredItems: Array<MemexItemModel>
  loaded: boolean
  hasArchive: boolean
  renderItem: (item: MemexItemModel) => ReactNode
  sx?: BetterSystemStyleObject
}>

export const ArchiveList = memo<ArchiveListProps>(function ArchiveList({
  filteredItems,
  loaded,
  hasArchive,
  renderItem,
  sx,
}) {
  return (
    <Box as="ul" sx={{...ulStyles, ...sx}} {...testIdProps('archived-item-list')}>
      {!loaded ? (
        <li {...testIdProps('archived-item-loader')}>
          <Loader />
        </li>
      ) : !hasArchive ? (
        <li>
          <NoArchivedItems />
        </li>
      ) : filteredItems.length === 0 ? (
        <li>
          <NoFilteredItems />
        </li>
      ) : (
        <ObserverProvider rootRef={null} sizeEstimate={55}>
          {filteredItems.map(item => (
            <ArchiveListItem key={item.id}>{renderItem(item)}</ArchiveListItem>
          ))}
        </ObserverProvider>
      )}
    </Box>
  )
})
