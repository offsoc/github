import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {LicensifyProductEnablements} from '../LicensifyProductEnablements'
import {getLicensifyProductEnablementsProps} from '../test-utils/mock-data'

test('Renders the LicensifyProductEnablements', () => {
  const props = getLicensifyProductEnablementsProps()
  render(<LicensifyProductEnablements {...props} />)
  expect(screen.getByRole('heading')).toHaveTextContent('Product enablements')
})
