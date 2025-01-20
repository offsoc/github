import type {Meta, StoryObj} from '@storybook/react'
import {CopilotPrReviewBanner, type CopilotPrReviewBannerProps} from './CopilotPrReviewBanner'
import {HttpResponse, http} from '@github-ui/storybook/msw'

const fakeCopilotApiUrl = 'http://localhost:2206'

const meta: Meta<CopilotPrReviewBannerProps> = {
  title: 'CopilotPrReviewBanner',
  component: CopilotPrReviewBanner,
  parameters: {
    enabledFeatures: ['copilot_reviews'],
  },
  args: {
    apiURL: fakeCopilotApiUrl,
    location: 'conversation',
    baseRepoId: 1,
    headRepoId: 1,
    baseRevision: 'a2556f9731b81dce36645230765ac7db112f9561',
    headRevision: '3cf968192b8a8ad00bb64792ae03d2f849c68524',
  },
  argTypes: {
    location: {
      description: 'Where is the banner being rendered, which page on GitHub.',
      options: ['compare', 'files_changed', 'conversation'],
      control: 'radio',
    },
  },
  render: args => <CopilotPrReviewBanner {...args} />,
} satisfies Meta<typeof CopilotPrReviewBanner>

export default meta

type Story = StoryObj<CopilotPrReviewBannerProps>

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        // Users
        http.post(`${fakeCopilotApiUrl}/github/chat/threads`, () =>
          HttpResponse.json({
            thread_id: '1cd8f69a-245a-4dc0-900f-24d5d933c6f7',
            thread: {
              id: '1cd8f69a-245a-4dc0-900f-24d5d933c6f7',
              name: '',
              repoID: 0,
              repoOwnerID: 0,
              createdAt: '2024-02-21T06:40:42.620143907-08:00',
              updatedAt: '2024-02-21T06:40:42.620143907-08:00',
              associatedRepoIDs: [],
            },
          }),
        ),
        http.post(`${fakeCopilotApiUrl}/github/chat/threads/1cd8f69a-245a-4dc0-900f-24d5d933c6f7/messages`, () =>
          HttpResponse.json({
            message: {
              id: '1953f52c-34c7-4381-819f-89c0ddf29938',
              threadID: 'f8b89731-f79f-4694-bec2-d481a79643a0',
              turnID: '811e3105-bf36-49e4-a81e-e853ad081365',
              role: 'assistant',
              content:
                'Given that the provided information is from a markdown file (`File.md`) and only contains text additions without specific code, there are limited technical aspects to analyze in terms of code complexity, naming conventions, error handling, testing, or data structures.\n\nHowever, based on best practices for writing markdown and other documentation, here are some suggestions:\n\n1. **Empty Lines**: You have added two empty lines before the "Specific instructions" header. While this isn\'t technically wrong, it\'s generally a good practice to keep line breaks consistent. If you use one line break elsewhere, you should stick to one line break here as well.\n\n2. **Section Content**: The "Specific instructions" section currently has "TBD" (To Be Determined) as its content. It\'s generally better to provide at least some initial content or instructions here, even if it will be expanded later. If the content is not ready, consider adding a more descriptive placeholder or a comment about what will be there in the future.\n\n3. **Use of Headers**: Ensure that the use of headers (#) is consistent and follows a hierarchy. If "Specific instructions" is a sub-point, it should be under a larger section and the header should reflect that (e.g., using \'##\' or \'###\').\n\nRemember, these are just recommendations based on the limited context given. The changes could be perfectly acceptable depending on the overall structure and style of your document.',
              createdAt: '2024-02-21T06:40:53.061519893-08:00',
              intent: 'review-pull-request',
              references: null,
              copilotAnnotations: {},
            },
          }),
        ),
      ],
    },
  },
}

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [http.post(`${fakeCopilotApiUrl}/github/chat/threads`, () => new Response(null, {status: 500}))],
    },
  },
}
