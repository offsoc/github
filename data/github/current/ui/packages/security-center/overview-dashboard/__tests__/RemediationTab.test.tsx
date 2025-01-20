import {screen} from '@testing-library/react'

import {render} from '../../test-utils/Render'
import {RemediationTab} from '../components/RemediationTab'
import {getRemediationTabProps} from '../test-utils/mock-data'

window.performance.mark = jest.fn()
window.performance.measure = jest.fn()
window.performance.getEntriesByName = jest.fn().mockReturnValue([{duration: 100}])
window.performance.clearMarks = jest.fn()
window.performance.clearMeasures = jest.fn()

test('renders the RemediationTab', () => {
  const props = getRemediationTabProps()
  render(<RemediationTab {...props} />)
  expect(screen.getByText('Closed alerts over time')).toBeInTheDocument()
  expect(screen.getByText('Mean time to remediate')).toBeInTheDocument()
  expect(screen.getByText('Net resolve rate')).toBeInTheDocument()
  expect(screen.getByText('Alert activity')).toBeInTheDocument()
})
