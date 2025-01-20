import type {Meta} from '@storybook/react'
import {ThreePanesLayout, type PaneWithAriaLabel, type ThreePanesLayoutProps} from './ThreePanesLayout'
import {Box} from '@primer/react'

const meta = {
  title: 'ThreePanesLayout',
  component: ThreePanesLayout,
  parameters: {},
  argTypes: {
    rightPanePadding: {control: 'boolean', defaultValue: false},
  },
} satisfies Meta<typeof ThreePanesLayout>

export default meta

const defaultArgs: Partial<ThreePanesLayoutProps> = {
  rightPanePadding: false,
}

const leftPane: PaneWithAriaLabel = {
  element: <Box sx={{height: '300px'}}>Left pane</Box>,
  ariaLabel: 'Left pane',
}

const middlePane = <Box sx={{height: '300px'}}>Middle pane</Box>

const rightPane: PaneWithAriaLabel = {
  element: <Box sx={{height: '300px'}}>Right pane</Box>,
  ariaLabel: 'Right pane',
}

export const ThreePanesLayoutExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: ThreePanesLayoutProps) => (
    <ThreePanesLayout {...args} leftPane={leftPane} middlePane={middlePane} rightPane={rightPane} rightPaneAs="aside" />
  ),
}
