import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ScreenReaderHeading} from '../ScreenReaderHeading'

test('Renders the ScreenReaderHeading', () => {
  const message = 'Hello React!'
  render(<ScreenReaderHeading as="h2" text={message} />)
  expect(screen.getByRole('heading')).toHaveAccessibleName(message)
})
