import {screen, render} from '@testing-library/react'

import type {InboxRowContent_fragment$data} from '../__generated__/InboxRowContent_fragment.graphql'
import {InboxRowContent} from '../InboxRowContent'
import {ListView} from '@github-ui/list-view'

const mockBody = 'This is a test notification'
const mockUrl = 'https://avatars.githubusercontent.com/u/1234567?v=4'

const mockData: InboxRowContent_fragment$data = {
  ' $fragmentType': 'InboxRowContent_fragment',
  isUnread: true,
  summaryItemAuthor: {
    avatarUrl: mockUrl,
  },
  summaryItemBody: mockBody,
}

describe('InboxRowContent', () => {
  it('should render summary body', () => {
    render(
      <ListView title={'Content test'}>
        <InboxRowContent {...mockData} />
      </ListView>,
    )

    // assert that `mockBody` is included in the component html
    expect(screen.getByText(mockBody)).toBeInTheDocument()
  })
  it('should render summary author avatar image', () => {
    render(
      <ListView title={'Content test'}>
        <InboxRowContent {...mockData} />
      </ListView>,
    )

    // assert that an image is rendered
    const img = screen.getByRole('presentation')
    expect(img).toBeInTheDocument()

    // assert that `mockUrl` is included in the image source,
    // it is ok if additional values are appended e.g. image size
    expect(img).toHaveAttribute('src', expect.stringContaining(mockUrl))
  })
})
