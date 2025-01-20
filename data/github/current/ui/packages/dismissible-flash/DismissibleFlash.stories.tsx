import type {Meta} from '@storybook/react'
import {DismissibleFlash} from './DismissibleFlash'

const meta = {
  title: 'Apps/Custom Properties/Components/DismissibleFlash',
  component: DismissibleFlash,
} satisfies Meta<typeof DismissibleFlash>

export default meta

export const Default = () => {
  return (
    <DismissibleFlash variant="success" onClose={() => undefined}>
      My message
    </DismissibleFlash>
  )
}
