import {render, screen} from '@testing-library/react'
import {composeStory} from '@storybook/react'
import meta, {IssueRowExample as Example} from '../IssueRow.stories'

const IssueRowExample = composeStory(Example, meta)

test('renders the title', () => {
  render(<IssueRowExample />)

  expect(screen.getByText('title')).toBeInTheDocument()
})

test('renders the issue type', () => {
  render(<IssueRowExample />)

  expect(screen.getByText('Bug')).toBeInTheDocument()
})

test('uses the given method to render an href on the issue type', () => {
  render(<IssueRowExample />)

  const link = screen.getByRole('link', {name: 'Bug'})
  expect(link.getAttribute('href')).toBe('#test(type,Bug)')
})

test('renders the milestone', () => {
  render(<IssueRowExample />)

  expect(screen.getByText('milestone-1')).toBeInTheDocument()
})
