import {SortDescIcon, SortAscIcon} from '@primer/octicons-react'
import {Button} from '@primer/react'
import {useReplaceSearchParams} from '../hooks/UseReplaceSearchParams'

import {clsx} from 'clsx'
import styles from './SortButton.module.css'

export interface SortButtonProps {
  title: string
  query_param: string
}

export function SortButton({title, query_param}: SortButtonProps) {
  const {searchParams, replaceSearchParams} = useReplaceSearchParams()
  const currentValue = searchParams.get(query_param) || 'desc'
  const currentIcon = currentValue === 'desc' ? SortDescIcon : SortAscIcon

  const toggleSort = () => {
    const value = currentValue === 'desc' ? 'asc' : 'desc'
    replaceSearchParams(query_param, value)
  }
  return (
    <Button
      onClick={toggleSort}
      className={clsx(styles.sortButton, 'fgColor-muted f6 px-0')}
      trailingVisual={currentIcon}
      variant="invisible"
    >
      {title}
    </Button>
  )
}
