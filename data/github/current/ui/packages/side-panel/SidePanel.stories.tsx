import {createRef} from 'react'
import type {Meta} from '@storybook/react'
import {SidePanel} from './SidePanel'
import {Box} from '@primer/react'

type SidePanelProps = React.ComponentProps<typeof SidePanel>

const args = {
  children: <Box sx={{p: 4}}> Side panel content</Box>,
  open: true,
  onClose: () => null,
  'aria-label': 'Side panel label',
  returnFocusRef: createRef(),
  width: '60%',
  topOffset: '2rem',
} satisfies SidePanelProps

const meta = {
  title: 'Recipes/SidePanel',
  component: SidePanel,
} satisfies Meta<typeof SidePanel>

export default meta

export const Example = {args}
