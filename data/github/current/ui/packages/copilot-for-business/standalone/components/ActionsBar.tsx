import {Children} from 'react'
import {Box} from '@primer/react'
import type {ReactElement} from 'react'

type Props = React.PropsWithChildren<object>

function LeftAction({children}: {children: React.ReactNode}) {
  return <>{children}</>
}

function RightAction({children}: {children: React.ReactNode}) {
  return <>{children}</>
}

function Actions(props: Props) {
  const leftActions = Children.toArray(props.children).filter(
    child => (child as ReactElement).type === ActionsBar.LeftAction,
  )
  const rightActions = Children.toArray(props.children).filter(
    child => (child as ReactElement).type === ActionsBar.RightAction,
  )

  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
      {leftActions}
      {rightActions}
    </Box>
  )
}

export const ActionsBar = Object.assign(Actions, {
  LeftAction,
  RightAction,
})
