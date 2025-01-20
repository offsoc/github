import type {Meta, StoryObj} from '@storybook/react'

import {DiffSquares as DiffSquaresComponent} from './DiffSquares'

const meta: Meta<typeof DiffSquaresComponent> = {
  title: 'Diffs/DiffSquares',
  component: DiffSquaresComponent,
}

type Story = StoryObj<typeof DiffSquaresComponent>

export const DiffSquares: Story = {
  render: () => <DiffSquaresComponent squares={['addition', 'addition', 'deletion', 'deletion', 'neutral']} />,
}

export default meta
