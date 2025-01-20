import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ActionsSurvey} from '../ActionsSurvey'
import {getActionsSurveyProps} from '../test-utils/mock-data'

describe('Actions Survey', () => {
  test('renders the Actions Survey banner with Give Feedback button', () => {
    const props = getActionsSurveyProps()
    render(<ActionsSurvey {...props} />)
    expect(screen.getByText('Help us improve GitHub Actions')).toBeInTheDocument()
    expect(screen.getByText('Give feedback')).toBeInTheDocument()
  })
})
