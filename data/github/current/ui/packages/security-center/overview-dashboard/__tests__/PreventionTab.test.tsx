import {screen} from '@testing-library/react'

import {render} from '../../test-utils/Render'
import {PreventionTab} from '../components/PreventionTab'
import {getDetectionTabProps} from '../test-utils/mock-data'

window.performance.mark = jest.fn()
window.performance.measure = jest.fn()
window.performance.getEntriesByName = jest.fn().mockReturnValue([{duration: 100}])
window.performance.clearMarks = jest.fn()
window.performance.clearMeasures = jest.fn()

test('renders the PreventionTab', () => {
  const props = getDetectionTabProps()
  render(<PreventionTab {...props} />)
  expect(screen.getByText('Introduced vs. Prevented')).toBeInTheDocument()
  expect(screen.getByText('Alerts fixed with autofix suggestions')).toBeInTheDocument()
  expect(screen.getByText('Vulnerabilities fixed in pull requests')).toBeInTheDocument()
})
