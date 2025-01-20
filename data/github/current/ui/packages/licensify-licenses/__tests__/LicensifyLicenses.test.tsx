import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {LicensifyLicenses} from '../LicensifyLicenses'
import {getLicensifyLicensesProps} from '../test-utils/mock-data'

test('Renders the LicensifyLicenses', () => {
  const props = getLicensifyLicensesProps()
  render(<LicensifyLicenses {...props} />)
  expect(screen.getByRole('heading')).toHaveTextContent('SDLC Licenses')
})
