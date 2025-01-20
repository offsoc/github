import {useState} from 'react'
import type {Meta} from '@storybook/react'
import {PercentageCircle} from '@github-ui/percentage-circle'
import {Toast, type ToastProps} from './Toast'
import {RocketIcon} from '@primer/octicons-react'

import {Button, Box} from '@primer/react'
import {useToastContext} from './ToastContext'

const meta = {
  title: 'Recipes/Toast',
  component: Toast,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    message: {control: 'text', defaultValue: 'Hello, Storybook!'},
  },
} satisfies Meta<typeof Toast>

export default meta

const defaultArgs: Partial<ToastProps> = {
  message: 'Hello, Storybook!',
}

export const ToastExample = {
  args: {
    ...defaultArgs,
  },
  render: (props: ToastProps) => {
    return (
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 4}}>
        <ToastDemoButton {...props} />
        <PersistedToastDemoButton />
        <PersistedToastDemoButtonWithSpinner />
      </Box>
    )
  },
}

const ToastDemoButton = ({message}: ToastProps) => {
  const {addToast} = useToastContext()
  const onClick = () =>
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addToast({message})
  return <Button onClick={onClick}>Click to show a toast</Button>
}

const PersistedToastDemoButton = () => {
  const {addPersistedToast, clearPersistedToast} = useToastContext()
  const [showPersistedToast, setShowPersistedToast] = useState(false)
  const onClick = () => {
    showPersistedToast
      ? clearPersistedToast()
      : // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addPersistedToast({
          type: 'success',
          message: 'I am staying forever',
          icon: <RocketIcon />,
          role: 'status',
        })
    setShowPersistedToast(!showPersistedToast)
  }
  return <Button onClick={onClick}>Click to {!showPersistedToast ? 'show' : 'hide'} persisted toast</Button>
}

const PersistedToastDemoButtonWithSpinner = () => {
  const {addPersistedToast, clearPersistedToast} = useToastContext()
  const [percent, setPercent] = useState(0.37)
  const [showPersistedToast, setShowPersistedToast] = useState(false)

  const onClick = () => {
    showPersistedToast
      ? clearPersistedToast()
      : // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addPersistedToast({
          type: 'info',
          message: 'I am staying forever',
          icon: <PercentageCircle progress={percent} />,
          role: 'status',
        })
    setShowPersistedToast(!showPersistedToast)
    setPercent(Math.random())
  }
  return (
    <Button onClick={onClick}>
      Click to {!showPersistedToast ? 'show' : 'hide'} persisted toast{' '}
      {!showPersistedToast ? `with ${Math.round(percent * 100)} % done` : ''}
    </Button>
  )
}
