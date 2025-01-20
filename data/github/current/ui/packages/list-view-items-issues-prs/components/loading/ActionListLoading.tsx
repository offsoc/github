import {ActionList} from '@primer/react'
import type {FC} from 'react'

import RowLoading from './RowLoading'

export type ActionListLoadingProps = {
  numberOfRows: number
  isCompact?: boolean
}

export const ActionListLoading: FC<ActionListLoadingProps> = ({numberOfRows, isCompact}) => (
  <ActionList>
    {[...Array(numberOfRows)].map((_, index) => (
      <RowLoading key={index} showCompactDensity={isCompact} />
    ))}
  </ActionList>
)
