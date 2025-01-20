import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {DiffEntryMenuItems} from '../../diff-view/shared/DiffEntryMenuItems'
import {MockFileDiffReference} from '../__utils__/mock-data'

test('Renders copilot-chat-diff-menu-button partial', async () => {
  render(<DiffEntryMenuItems fileDiffReference={MockFileDiffReference} />)

  const askDiffMenuItem = screen.getByText('Ask Copilot about this diff')
  expect(askDiffMenuItem).toBeInTheDocument()

  const attachDiffMenuItem = screen.getByText('Attach to current thread')
  expect(attachDiffMenuItem).toBeInTheDocument()
})
