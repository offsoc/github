import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {ApplySuggestionDialog, type ApplySuggestionDialogProps} from '../ApplySuggestionDialog'

function TestComponent({
  authorLogins = ['monalisa'],
  onCommit = noop,
}: {
  authorLogins?: string[]
  onCommit?: ApplySuggestionDialogProps['onCommit']
}) {
  return (
    <AnalyticsProvider appName="test" category="test_category" metadata={{}}>
      <ApplySuggestionDialog authorLogins={authorLogins} batchSize={1} onClose={noop} onCommit={onCommit} />
    </AnalyticsProvider>
  )
}

test('renders ApplySuggestionDialog', () => {
  render(<TestComponent />)
  expect(screen.getByText('Commit message')).toBeInTheDocument()
  expect(screen.getByText('Extended description (optional)')).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Commit changes'})).toBeInTheDocument()
  expect(screen.getByDisplayValue('Apply suggestion from @monalisa')).toBeInTheDocument()
})

test('shows error message when commit fails', async () => {
  const errorOnCommit = (
    _commitMessage: string,
    onError: (error: Error, type?: string, friendlyMessage?: string) => void,
  ) => {
    onError(new Error('commit failed'), 'NOT_FOUND', 'Could not find comment.')
  }

  const {user} = render(<TestComponent onCommit={errorOnCommit} />)
  expect(screen.queryByText('There was an error trying to commit changes.')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', {name: 'Commit changes'}))
  expect(screen.getByText('There was an error trying to commit changes: Could not find comment.')).toBeInTheDocument()
})

describe('default commmit message', () => {
  test('with one author and suggestion', () => {
    render(<TestComponent />)
    expect(screen.getByDisplayValue('Apply suggestion from @monalisa')).toBeInTheDocument()
  })

  test('with one author and multiple suggestions', () => {
    render(<TestComponent authorLogins={['monalisa', 'monalisa']} />)
    expect(screen.getByDisplayValue('Apply suggestions from @monalisa')).toBeInTheDocument()
  })

  test('with multiple authors and multiple suggestions', () => {
    render(<TestComponent authorLogins={['mona', 'lis']} />)
    expect(screen.getByDisplayValue('Apply suggestions from code review')).toBeInTheDocument()
  })
})
