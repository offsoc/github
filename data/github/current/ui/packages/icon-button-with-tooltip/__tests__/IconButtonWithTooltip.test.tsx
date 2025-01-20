import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {IconButtonWithTooltip} from '../IconButtonWithTooltip'

const TestIcon = () => <div />

test('Renders the IconButtonWithTooltip', () => {
  const label = 'Button label'
  const shortcut = 'Alt+c'

  render(<IconButtonWithTooltip icon={TestIcon} label={label} shortcut={shortcut} />)

  expect(screen.getByLabelText('Button label')).toBeInTheDocument()
  expect(screen.getByLabelText('Button label <alt+c>')).toBeInTheDocument()
})
