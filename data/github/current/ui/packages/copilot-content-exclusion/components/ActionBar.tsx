import type React from 'react'

import {Box} from '@primer/react'
import {useSlots} from '@primer/react/experimental'

function Bar(props: React.PropsWithChildren) {
  const [slots, childrenWithoutSlots] = useSlots(props.children, {
    details: Details,
  })

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: slots.details ? 'space-between' : 'flex-end',
        alignItems: 'center',
        borderTop: '1px solid',
        borderTopColor: 'border.muted',
        pt: 4,
        width: '100%',
      }}
    >
      {slots.details}
      <Box sx={{display: 'inline-flex', gap: 2}}>{childrenWithoutSlots}</Box>
    </Box>
  )
}

function Details(props: React.PropsWithChildren) {
  return <div data-details>{props.children}</div>
}

export const ActionBar = Object.assign(Bar, {
  Details,
})
