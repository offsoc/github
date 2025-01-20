import type {Meta, StoryObj} from '@storybook/react'
import {Suspense} from 'react'
import {MemoryRouter} from 'react-router-dom'
import {BASE_PAGE_DATA_URL} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'
import {PageDataContextProvider} from '@github-ui/pull-request-page-data-tooling/page-data-context'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {QueryClientProvider} from '@tanstack/react-query'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {http, HttpResponse} from '@github-ui/storybook/msw'

import {ChecksSection} from './ChecksSection'
import {
  checksSectionPendingState,
  checksSectionPassingState,
  checksSectionFailedState,
  checksSectionPendingWithFailureState,
  checksSectionSomeFailedState,
} from '../../test-utils/mocks/checks-section-mocks'

const meta: Meta<typeof ChecksSection> = {
  title: 'Pull Requests/mergebox/ChecksSection',
  component: ChecksSection,
  decorators: [
    Story => {
      // Resets the Tanstack Query Client Cache between stories to ensure that we don't use stale data.
      queryClient.clear()
      return (
        <MemoryRouter>
          <PageDataContextProvider basePageDataUrl={BASE_PAGE_DATA_URL}>
            <QueryClientProvider client={queryClient}>
              <div style={{maxWidth: '600px'}}>
                <Suspense>
                  <Story />
                </Suspense>
              </div>
            </QueryClientProvider>
          </PageDataContextProvider>
        </MemoryRouter>
      )
    },
  ],
}

type Story = StoryObj<typeof ChecksSection>

const defaultProps = {pullRequestId: 'pullRequest123', pullRequestHeadSha: 'mock-head-sha'}
const statusChecksPageDataRoute = `${BASE_PAGE_DATA_URL}/page_data/${PageData.statusChecks}`
const argTypes = {
  pullRequestId: {
    table: {
      disable: true,
    },
  },
}

export const pending: Story = {
  argTypes,
  parameters: {
    msw: {
      handlers: [
        http.get(statusChecksPageDataRoute, () => {
          return HttpResponse.json(checksSectionPendingState)
        }),
      ],
    },
  },
  render: () => <ChecksSection {...defaultProps} />,
}

export const pendingWithFailure: Story = {
  argTypes,
  parameters: {
    msw: {
      handlers: [
        http.get(statusChecksPageDataRoute, () => {
          return HttpResponse.json(checksSectionPendingWithFailureState)
        }),
      ],
    },
  },
  render: () => <ChecksSection {...defaultProps} />,
}

export const passing: Story = {
  argTypes,
  parameters: {
    msw: {
      handlers: [
        http.get(statusChecksPageDataRoute, () => {
          return HttpResponse.json(checksSectionPassingState)
        }),
      ],
    },
  },
  render: () => <ChecksSection {...defaultProps} />,
}

export const failing: Story = {
  argTypes,
  parameters: {
    msw: {
      handlers: [
        http.get(statusChecksPageDataRoute, () => {
          return HttpResponse.json(checksSectionFailedState)
        }),
      ],
    },
  },
  render: () => <ChecksSection {...defaultProps} />,
}

export const someFailing: Story = {
  argTypes,
  parameters: {
    msw: {
      handlers: [
        http.get(statusChecksPageDataRoute, () => {
          return HttpResponse.json(checksSectionSomeFailedState)
        }),
      ],
    },
  },
  render: () => <ChecksSection {...defaultProps} />,
}

export default meta
