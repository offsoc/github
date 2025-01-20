import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ActionMenuSelector} from '../ActionMenuSelector'

test('Renders the ActionMenuSelector', () => {
  const orderedStatuses: string[] = ['all', 'pass', 'fail', 'bypass']

  const ruleStatuses: Record<string, string> = {
    all: 'All statuses',
    pass: 'Pass',
    fail: 'Fail',
    bypass: 'Bypass',
  }
  render(
    <ActionMenuSelector
      currentSelection="all"
      orderedValues={orderedStatuses}
      displayValues={ruleStatuses}
      onSelect={() => null}
    />,
  )
  expect(screen.getByRole('button')).toHaveTextContent('All statuses')
})
