import {ListView} from '@github-ui/list-view'
import {Box} from '@primer/react'
import type {FC} from 'react'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'

import ActionListLoading from './list-view/loading/ActionListLoading'
import {useRepositoryGroupContext} from '../contexts'
import {LABELS} from '../constants'

export type ListLoadingProps = {
  pageSize: number
  showBorder?: boolean
  headerTitle?: string
  isCompactRows?: boolean
}

const ListLoading: FC<ListLoadingProps> = ({pageSize, showBorder = true, headerTitle, isCompactRows}) => {
  const {isGrouped, repository} = useRepositoryGroupContext()
  return (
    <Box sx={showBorder ? {border: '1px solid', borderColor: 'border.muted', borderRadius: 2} : {}}>
      <ListView
        title={'Notifications inbox'}
        totalCount={pageSize}
        metadata={
          <ListViewMetadata
            title={headerTitle ?? (isGrouped ? repository?.nameWithOwner : LABELS.loadingListingResults)}
          />
        }
      >
        <ActionListLoading numberOfRows={pageSize} isCompact={isCompactRows} />
      </ListView>
    </Box>
  )
}

export default ListLoading
