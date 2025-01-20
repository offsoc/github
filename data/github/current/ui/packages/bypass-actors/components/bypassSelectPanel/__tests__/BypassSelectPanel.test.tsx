import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {BypassSelectPanel, type BypassSelectPanelProps} from '../BypassSelectPanel'

const defaultProps: BypassSelectPanelProps = {
  suggestionsUrl: '/suggestions',
  baseAvatarUrl: '/avatar',
  enabledBypassActors: [],
  addBypassActor: jest.fn(),
  removeBypassActor: jest.fn(),
  addReviewerSubtitle: '',
}

describe('BypassDialog', () => {
  test('should render given no suggestions', async () => {
    render(<BypassSelectPanel {...defaultProps} />)
    expect(screen.getByText('Add bypass')).toBeInTheDocument()
  })
})
