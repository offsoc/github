import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CodespacesSurvey} from '../CodespacesSurvey'
import {getCodespacesSurveyProps} from '../test-utils/mock-data'

describe('Codespaces Survey', () => {
  test('renders the Codespaces Survey banner with Give Feedback button', () => {
    const props = getCodespacesSurveyProps()
    render(<CodespacesSurvey {...props} />)
    expect(screen.getByText('Help us improve GitHub Codespaces')).toBeInTheDocument()
    expect(screen.getByText('Give feedback')).toBeInTheDocument()
  })
})
