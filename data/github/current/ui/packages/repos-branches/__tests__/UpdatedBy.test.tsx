import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {UpdatedBy} from '../components/UpdatedBy'
import {getUser} from '../test-utils/mock-data'

test('renders UpdatedBy', () => {
  render(<UpdatedBy user={getUser()} updatedAt={new Date().toISOString()} />)

  expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'monalisa')
  expect(screen.getByRole('img')).toHaveAttribute('alt', 'monalisa')

  expect(screen.getByRole('link')).toHaveAttribute('data-hovercard-url', '/users/monalisa/hovercard')
  expect(screen.getByRole('link')).toHaveAttribute('href', '/monalisa')
})
