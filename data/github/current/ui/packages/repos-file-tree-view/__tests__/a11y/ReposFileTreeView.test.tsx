import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {ReposFileTreeView} from '../../components/ReposFileTreeView'
import {sampleTreeProps, Wrap} from '../test-utils'

jest.mock('@github-ui/code-view-shared/hooks/use-repos-analytics', () => {
  return {
    __esModule: true,
    useReposAnalytics: () => ({sendRepoClickEvent: jest.fn()}),
  }
})

// eslint-disable-next-line compat/compat
window.requestIdleCallback = jest.fn()
window.open = jest.fn()
jest.useFakeTimers()

describe('Accessibility', () => {
  describe('ReposFileTreeView', () => {
    test('Nav: Tree view', async () => {
      render(
        <Wrap path="any">
          <ReposFileTreeView {...sampleTreeProps} />
        </Wrap>,
      )

      // jest sometimes renders at smaller viewport, so we need to expand the tree view to render tree nav
      if (screen.queryByRole('button', {name: 'Expand side panel'})) {
        fireEvent.click(screen.getByRole('button', {name: 'Expand side panel'}))
      }

      const treeViewHeading = screen.getByRole('navigation', {name: 'File Tree Navigation'})
      expect(treeViewHeading.tagName).toBe('NAV')
    })
  })
})
