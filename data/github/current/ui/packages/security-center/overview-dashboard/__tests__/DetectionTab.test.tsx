import {screen} from '@testing-library/react'

import {render} from '../../test-utils/Render'
import {DetectionTab} from '../components/DetectionTab'
import {getDetectionTabProps} from '../test-utils/mock-data'

window.performance.mark = jest.fn()
window.performance.measure = jest.fn()
window.performance.getEntriesByName = jest.fn().mockReturnValue([{duration: 100}])
window.performance.clearMarks = jest.fn()
window.performance.clearMeasures = jest.fn()

test('renders the DetectionTab', () => {
  const props = getDetectionTabProps()
  render(<DetectionTab {...props} />)
  expect(screen.getByText('Open alerts over time')).toBeInTheDocument()
  expect(screen.getByText('Age of alerts')).toBeInTheDocument()
  expect(screen.getByText('Reopened alerts')).toBeInTheDocument()
  expect(screen.getByText('Secrets bypassed')).toBeInTheDocument()
  expect(screen.getByText('Impact analysis')).toBeInTheDocument()
})
