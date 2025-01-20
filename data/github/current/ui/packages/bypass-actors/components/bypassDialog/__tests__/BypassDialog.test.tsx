import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {getBypassActor} from '../../../test-utils/mock-data'

import {BypassDialog, type BypassDialogProps} from '../BypassDialog'
import {ORGANIZATION_ADMIN_ROLE} from '../../../helpers/constants'

const defaultProps: BypassDialogProps = {
  suggestionsUrl: '/suggestions',
  onClose: jest.fn(),
  baseAvatarUrl: '/avatar',
  enabledBypassActors: [],
  addBypassActor: jest.fn(),
  initialSuggestions: [ORGANIZATION_ADMIN_ROLE, getBypassActor(1, 'Team'), getBypassActor(2, 'Team')],
  addReviewerSubtitle: '',
}

describe('BypassDialog', () => {
  test('should render given no suggestions', async () => {
    render(<BypassDialog {...defaultProps} />)
    expect(screen.getByRole('heading')).toHaveTextContent('Add bypass')
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)

    expect(screen.getByText('Organization admin')).toBeInTheDocument()
    expect(screen.getByText('actor-Team-1')).toBeInTheDocument()
    expect(screen.getByText('actor-Team-2')).toBeInTheDocument()
    expect(await screen.findAllByTestId('bypass-dialog-checkbox')).toHaveLength(3)
  })
})
