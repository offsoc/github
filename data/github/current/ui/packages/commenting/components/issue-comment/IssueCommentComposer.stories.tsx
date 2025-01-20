import type {Meta, StoryObj} from '@storybook/react'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {IssueCommentComposerTestComponent} from '../../test-utils/IssueCommentComposerTestComponent'
import type {IssueCommentTestComponent} from '../../test-utils/IssueCommentTestComponent'
import {IssueCommentComposer} from './IssueCommentComposer'

type Story = StoryObj<typeof IssueCommentTestComponent>

const meta = {
  title: 'Recipes/CommentBox',
  component: IssueCommentComposer,
} satisfies Meta<typeof IssueCommentComposer>

export const IssueCommentComposerStory: Story = (function () {
  const environment = createMockEnvironment()

  return {
    argTypes: {},
    args: {
      environment,
    },
    render: args => <IssueCommentComposerTestComponent environment={args.environment} />,
    play: () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Issue: () => ({
            id: 'I_id',
            databaseId: 'issueid',
            locked: false,
            viewerCanComment: true,
            viewerCanClose: true,
            viewerCanReopen: true,
            repository: {
              databaseId: 'repoid',
              isArchived: false,
              nameWithOwner: 'owner/repo',
              slashCommandsEnabled: false,
            },
          }),
        }),
      )
    },
  }
})()

export default meta
