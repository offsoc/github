import {Box} from '@primer/react'
import {type FC, Fragment} from 'react'

import {ActionListLoading} from './ActionListLoading'
import type {ListViewSectionFilterLinks} from '@github-ui/list-view/ListViewSectionFilterLink'

export type ListLoadingProps = {
  pageSize: number
  showBorder?: boolean
  headerTitle?: string
  sectionFilters?: ListViewSectionFilterLinks
  isCompactRows?: boolean
}

const ListLoading: FC<ListLoadingProps> = ({
  pageSize,
  showBorder = true,
  headerTitle,
  sectionFilters,
  isCompactRows,
}) => {
  return (
    <>
      <Box sx={showBorder ? {border: '1px solid', borderColor: 'border.muted', borderRadius: 2} : {}}>
        {showBorder && (
          <Box
            sx={{
              pl: 3,
              pr: 2,
              py: 2,
              backgroundColor: 'canvas.subtle',
              borderTopRightRadius: 2,
              borderTopLeftRadius: 2,
              borderBottom: '1px solid',
              borderBottomColor: 'border.muted',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            {headerTitle}
            {sectionFilters?.map((sectionFilterLink, i) => (
              <Fragment key={`section-filter-link-${i}`}>{sectionFilterLink}</Fragment>
            ))}
          </Box>
        )}
        <ActionListLoading numberOfRows={pageSize} isCompact={isCompactRows} />
      </Box>
    </>
  )
}

export default ListLoading
