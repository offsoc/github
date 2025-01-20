import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {TestReactPartialPackage} from '../TestReactPartialPackage'
import {getTestReactPartialPackageProps} from '../test-utils/mock-data'

test('Renders the TestReactPartialPackage', () => {
  const props = getTestReactPartialPackageProps()
  render(<TestReactPartialPackage {...props} />)
  expect(screen.getByRole('article')).toHaveTextContent(props.exampleMessage)
})
