import {render, screen, within} from '@testing-library/react'
import {composeStory} from '@storybook/react'
import meta, {IssueItemMetadataExample as Example} from '../IssueItemMetadata.stories'
import {TEST_IDS} from '../../constants/test-ids'

const IssueItemMetadata = composeStory(Example, meta)

test('renders the assignee login', () => {
  render(<IssueItemMetadata />)

  expect(screen.getByAltText('monalisa')).toBeInTheDocument()
})

test('renders the linked pulls', () => {
  render(<IssueItemMetadata showLinkedPullRequests={true} />)

  const linkedPulls = screen.getByTestId(TEST_IDS.listRowLinkedPullRequests)
  expect(within(linkedPulls).getByText('29')).toBeInTheDocument()
})

test('renders the issue comments', () => {
  render(<IssueItemMetadata />)

  const comments = screen.getByTestId(TEST_IDS.listRowComments)
  expect(within(comments).getByText('33')).toBeInTheDocument()
})
