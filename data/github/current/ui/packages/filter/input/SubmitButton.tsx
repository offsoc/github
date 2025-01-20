import {SearchIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'

import {useFilterQuery} from '../context'
import {SubmitEvent} from '../types'

export const SubmitButton = () => {
  const {onSubmit} = useFilterQuery()
  return (
    <IconButton
      aria-label="Search"
      size="medium"
      icon={SearchIcon}
      variant="default"
      onClick={() => onSubmit(SubmitEvent.ExplicitSubmit)}
      sx={{
        color: 'fg.muted',
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        flexShrink: 0,
        boxShadow: 'none',
        ':focus': {
          zIndex: 1,
        },
      }}
    />
  )
}
