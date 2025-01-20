import {CodeIcon, FileCodeIcon} from '@primer/octicons-react'
import {ActionList, Box} from '@primer/react'
import type {Meta} from '@storybook/react'
import {useMemo} from 'react'

import type {ActionBarProps} from '../ActionBar'
import {ActionBar} from '../ActionBar'

type StoryArgs = {containerWidth?: number; includeNonCollapsibleContent: boolean} & ActionBarProps

const meta: Meta<StoryArgs> = {
  title: 'Recipes/ActionBar',
  component: ActionBar,
  parameters: {controls: {sort: 'none'}},
  args: {
    containerWidth: 225,
    density: 'spacious',
    label: 'Sample controls',
    includeNonCollapsibleContent: true,
  },
  argTypes: {
    containerWidth: {
      control: {type: 'number', step: 25, min: 0},
      description: 'The width in pixels of the container for the action bar, to easily see the overflow menu behavior.',
    },
    density: {
      control: 'radio',
      options: ['none', 'condensed', 'normal', 'spacious'],
    },
    includeNonCollapsibleContent: {
      description: "Whether content that won't fall into the overflow menu should be included in the example.",
    },
  },
}

export default meta

const onFooClick = () => alert('Selected Foo action')
const onBarClick = () => alert('Selected Bar action')
const onBazClick = () => alert('Selected Bar action')

const SampleActionBarMenu = ({containerWidth, density}: StoryArgs) => {
  return (
    <Box
      sx={useMemo(
        () => ({
          border: '3px dashed',
          borderColor: 'border.subtle',
          borderRadius: 1,
          width: typeof containerWidth === 'number' ? `${containerWidth}px` : 'auto',
          p: '2px',
        }),
        [containerWidth],
      )}
    >
      <ActionBar
        label="Sample controls"
        density={density}
        variant="menu"
        staticMenuActions={[
          {
            key: 'view-code',
            render: () => (
              <ActionList.Item onSelect={onBarClick}>
                <ActionList.LeadingVisual>
                  <CodeIcon />
                </ActionList.LeadingVisual>
                View code at this point
              </ActionList.Item>
            ),
          },
          {
            key: 'browse',
            render: () => (
              <ActionList.Item onSelect={onBazClick}>
                <ActionList.LeadingVisual>
                  <FileCodeIcon />
                </ActionList.LeadingVisual>
                Browse Repository at this point
              </ActionList.Item>
            ),
          },
          {
            key: 'view-checks',
            render: () => <ActionList.Item onSelect={onFooClick}>View checks</ActionList.Item>,
          },
        ]}
      />
    </Box>
  )
}

export const ActionBarStaticMenuOnly = {
  render: (args: StoryArgs) => <SampleActionBarMenu {...args} />,
}
