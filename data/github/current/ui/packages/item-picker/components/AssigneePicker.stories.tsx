import {AssigneeRepositoryPicker, DefaultAssigneePickerAnchor} from './AssigneePicker'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import {noop} from '@github-ui/noop'
import type {AssigneePickerSearchAssignableRepositoryUsersWithQuery} from './__generated__/AssigneePickerSearchAssignableRepositoryUsersWithQuery.graphql'

type AssigneePickerQueries = {
  assignees: AssigneePickerSearchAssignableRepositoryUsersWithQuery
}

function TestAssigneeRepositoryPicker() {
  return (
    <AssigneeRepositoryPicker
      readonly={false}
      shortcutEnabled={true}
      assignees={[]}
      assigneeTokens={[]}
      repo="issues"
      owner="github"
      onSelectionChange={noop}
      anchorElement={anchorProps => (
        <DefaultAssigneePickerAnchor assignees={[]} readonly={!true} anchorProps={anchorProps} />
      )}
    />
  )
}

const meta: Meta<typeof AssigneeRepositoryPicker> = {
  title: 'ItemPicker/AssigneePicker',
  component: TestAssigneeRepositoryPicker,
}

export default meta

export const DefaultState = {
  decorators: [relayDecorator],
  parameters: {
    relay: {
      queries: {
        assignees: {
          type: 'lazy',
        },
      },
      mockResolvers: {
        User() {
          return {
            id: mockRelayId(),
            login: 'viewerLogin',
            name: 'viewerName',
          }
        },
      },
      mapStoryArgs: () => ({
        assignees: [],
        participants: [],
      }),
    },
  },
} satisfies RelayStoryObj<typeof AssigneeRepositoryPicker, AssigneePickerQueries>
