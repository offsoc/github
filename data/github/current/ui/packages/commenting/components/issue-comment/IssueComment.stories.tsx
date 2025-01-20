import {Box} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {IssueCommentTestComponent} from '../../test-utils/IssueCommentTestComponent'
import {makeIssueCommentBaseTypes} from '../../test-utils/relay-type-mocks'
import {IssueComment} from './IssueComment'

type Story = StoryObj<typeof IssueCommentTestComponent>

const meta = {
  title: 'Recipes/CommentBox',
  component: IssueComment,
} satisfies Meta<typeof IssueComment>

export const IssueCommentStory: Story = (function () {
  const environment = createMockEnvironment()

  return {
    argTypes: {},
    args: {
      environment,
    },
    render: args => {
      return (
        <Box sx={{m: 2, border: '1px solid', borderColor: 'border.default'}}>
          <IssueCommentTestComponent environment={args.environment} />
        </Box>
      )
    },
    play: () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          ...makeIssueCommentBaseTypes(),
          IssueComment() {
            return {
              commentHidden: false,
              author: {login: 'test'},
            }
          },
        })
      })
    },
  }
})()

export default meta
