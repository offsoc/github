import {VALUES} from '@github-ui/issue-viewer/Values'
import type {FC} from 'react'

import RowLoading from './RowLoading'
import {ActionList} from '@primer/react'

const SKELETON_TEXT_WIDTHS = [...Array(VALUES.rowLoadingSkeletonCount)].map(() =>
  Math.floor(Math.random() * (300 - 100) + 100),
)

export type PaginationLoadingProps = {
  isCompactRows?: boolean
}

export const PaginationLoading: FC<PaginationLoadingProps> = ({isCompactRows = false}) => {
  return (
    <ActionList>
      {[...Array(VALUES.rowLoadingSkeletonCount)].map((_, index) => (
        <RowLoading key={index} width={`${SKELETON_TEXT_WIDTHS[index]}px`} showCompactDensity={isCompactRows} />
      ))}
    </ActionList>
  )
}
