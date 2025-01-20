import type {Meta} from '@storybook/react'
import {DefaultMilestonePickerAnchor, MilestonePicker, type MilestonePickerProps} from './MilestonePicker'
import {noop} from '@github-ui/noop'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {MilestonePickerQuery} from './__generated__/MilestonePickerQuery.graphql'

type MilestonePickerQueries = {
  recentMilestones: MilestonePickerQuery
}

const meta = {
  title: 'ItemPicker/MilestonePicker',
  component: MilestonePicker,
} satisfies Meta<MilestonePickerProps>

export default meta

export const Example = {
  decorators: [relayDecorator<typeof MilestonePicker, MilestonePickerQueries>],
  parameters: {
    relay: {
      queries: {
        recentMilestones: {
          type: 'lazy',
        },
      },
      mockResolvers: {
        Repository: () => ({
          milestones: {
            nodes: [
              {
                title: 'Milestone A',
              },
              {
                title: 'Milestone B',
              },
            ],
          },
        }),
      },
      mapStoryArgs: () => {
        const sharedProps = {
          shortcutEnabled: false,
          activeMilestone: null,
          readonly: false,
        } as MilestonePickerProps

        return {
          ...sharedProps,
          owner: 'github',
          repo: 'issues',
          onSelectionChanged: noop,
          anchorElement: props => <DefaultMilestonePickerAnchor anchorProps={props} {...sharedProps} />,
        } as MilestonePickerProps
      },
    },
  },
} satisfies RelayStoryObj<typeof MilestonePicker, MilestonePickerQueries>
