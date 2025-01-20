import type {Meta} from '@storybook/react'
import {LocalTab, type LocalTabProps} from './LocalTab'
import {testCodeButtonPayload} from '../__tests__/test-helpers'
import {Wrapper} from '@github-ui/react-core/test-utils'

const meta = {
  title: 'Recipes/LocalTab',
  component: LocalTab,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof LocalTab>

export default meta

const defaultArgs: LocalTabProps = {
  ...testCodeButtonPayload.local,
}

export const LocalTabExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: LocalTabProps) => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <LocalTab {...args} />
    </Wrapper>
  ),
}
