import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SingleSignOnBanner} from '../SingleSignOnBanner'

test('Renders the SingleSignOnBanner', () => {
  render(<SingleSignOnBanner protectedOrgs={['github', 'acme']} />)

  expect(screen.getByLabelText('Single sign on information')).toBeInTheDocument()
})

test('Does not render when no protectedOrgs', () => {
  render(<SingleSignOnBanner />)

  expect(screen.queryByLabelText('Single sign on information')).not.toBeInTheDocument()
})
