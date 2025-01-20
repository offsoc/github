import type {FC} from 'react'

import {default as SharedListLoading, type ListLoadingProps as ShareListLoadingProps} from './loading/ListLoading'
import {LABELS} from '../constants/labels'

export type ListLoadingProps = Omit<ShareListLoadingProps, 'pageSize' | 'isCompactRows'> & {
  layoutDensity: string
  pageSize: number
}

export const ListLoading: FC<ListLoadingProps> = ({layoutDensity, ...props}) => {
  const isCompactRows = layoutDensity === LABELS.Compact.toLowerCase()

  return <SharedListLoading isCompactRows={isCompactRows} {...props} />
}
