import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import BetaSection from '../components/BetaSection'

describe('BetaSection', () => {
  const showFeedbackLink = true
  const feedbackLink = 'https://github.com/orgs/community/discussions/114519'

  it('renders the BetaSection component', () => {
    render(
      <BetaSection
        feedbackButton={{
          showFeedbackLink,
          feedbackLink,
        }}
      />,
    )

    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Give feedback')).toBeInTheDocument()
  })

  it('does not render give feedback link if object is not sent', () => {
    render(<BetaSection />)

    expect(screen.queryByText('Give feedback')).toBeNull()
  })
})
