import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {TestSsrReactPartialPackage} from '../TestSsrReactPartialPackage'
import {getTestSsrReactPartialPackageProps} from '../test-utils/mock-data'

test('Renders the TestSsrReactPartialPackage', () => {
  const props = getTestSsrReactPartialPackageProps()
  render(<TestSsrReactPartialPackage {...props} />)
  expect(screen.getByRole('article')).toHaveTextContent(props.exampleMessage)
})
