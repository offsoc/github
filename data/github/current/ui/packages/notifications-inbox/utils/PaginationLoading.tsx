import {VALUES} from '@github-ui/issue-viewer/Values'
import type {FC} from 'react'

import RowLoading from './list-view/loading/RowLoading'

const SKELETON_TEXT_WIDTHS = [...Array(VALUES.rowLoadingSkeletonCount)].map(() =>
  Math.floor(Math.random() * (300 - 100) + 100),
)

type Props = {
  isCompactRows?: boolean
}

const PaginationLoading: FC<Props> = ({isCompactRows = false}) => {
  return (
    <>
      {[...Array(VALUES.rowLoadingSkeletonCount)].map((_, index) => (
        <RowLoading key={index} width={`${SKELETON_TEXT_WIDTHS[index]}px`} showCompactDensity={isCompactRows} />
      ))}
    </>
  )
}

export default PaginationLoading
