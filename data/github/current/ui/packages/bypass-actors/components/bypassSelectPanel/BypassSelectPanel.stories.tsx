import type {Meta} from '@storybook/react'
import {BypassSelectPanel, type BypassSelectPanelProps} from './BypassSelectPanel'
import {getBypassActor} from '../../test-utils/mock-data'

const meta = {
  title: 'Recipes/BypassActors/BypassSelectPanel',
  component: BypassSelectPanel,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof BypassSelectPanel>

export default meta

// This override is required to mock the suggestions request.
global.fetch = async url => {
  if (url.toString().includes('suggestions')) {
    return new Response(JSON.stringify([getBypassActor(3, 'Team'), getBypassActor(4, 'Team')]))
  } else {
    return {ok: false, status: 404, json: async () => ({})} as Response
  }
}

const defaultArgs: Partial<BypassSelectPanelProps> = {
  baseAvatarUrl: 'https://avatars.githubusercontent.com',
  enabledBypassActors: [],
  addBypassActor: () => null,
  suggestionsUrl: '/suggestions',
}

export const BypassDialogExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: BypassSelectPanelProps) => <BypassSelectPanel {...args} />,
}
