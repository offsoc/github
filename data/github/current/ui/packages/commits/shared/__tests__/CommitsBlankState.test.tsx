import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {CommitsBlankState} from '../CommitsBlankState'

test('renders empty state', async () => {
  render(<CommitsBlankState timeoutMessage={''} />)

  expect(screen.getByText('No commits history')).toBeInTheDocument()
})

test('renders timeout state', async () => {
  render(<CommitsBlankState timeoutMessage={'this is a timed out message'} />)

  expect(screen.getByText('Commit history cannot be loaded')).toBeInTheDocument()
})
