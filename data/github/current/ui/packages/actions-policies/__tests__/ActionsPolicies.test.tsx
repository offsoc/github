import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ActionsPolicies} from '../ActionsPolicies'
import {getActionsPoliciesProps} from '../test-utils/mock-data'

test('Renders the ActionsPolicies', () => {
  const props = getActionsPoliciesProps()
  render(<ActionsPolicies {...props} />)
  expect(screen.getByRole('heading')).toHaveTextContent('Allowed actions')
})
