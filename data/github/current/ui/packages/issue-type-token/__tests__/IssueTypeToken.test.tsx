import {render, screen} from '@testing-library/react'
import {IssueTypeToken} from '../IssueTypeToken'

const ISSUE_ID = '123'
const owner = 'github'

function renderTestComponent() {
  render(
    <IssueTypeToken
      name="test"
      color="GREEN"
      href={`/organizations/${owner}/settings/issue-types/${ISSUE_ID}`}
      getTooltipText={() => ''}
    />,
  )
}

test('renders token with name', () => {
  renderTestComponent()
  expect(screen.getByText('test')).toBeInTheDocument()
})

test('token links to edit page', () => {
  renderTestComponent()
  expect(screen.getByRole('link')).toHaveAttribute('href', `/organizations/${owner}/settings/issue-types/${ISSUE_ID}`)
})
