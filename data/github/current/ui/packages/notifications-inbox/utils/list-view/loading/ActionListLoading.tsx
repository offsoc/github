import {ActionList} from '@primer/react'
import type {FC} from 'react'

import RowLoading from './RowLoading'

type ActionListLoadingProps = {
  numberOfRows: number
  isCompact?: boolean
}

const ActionListLoading: FC<ActionListLoadingProps> = ({numberOfRows, isCompact}) => (
  <ActionList>
    {[...Array(numberOfRows)].map((_, index) => (
      <RowLoading key={index} showCompactDensity={isCompact} />
    ))}
  </ActionList>
)

export default ActionListLoading
