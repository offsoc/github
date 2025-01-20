import type {FileTreePagePayload} from '@github-ui/code-view-types'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {FilesPageInfoProvider} from '../../../../../contexts/FilesPageInfoContext'
import {DirectoryContent} from '../../DirectoryContent'
import {oneItemPayload} from '../../../../../__tests__/test-helpers'
import {CurrentTreeProvider} from '../../../../../contexts/CurrentTreeContext'

jest.useFakeTimers()
window.requestAnimationFrame = jest.fn()

beforeEach(() => {
  ;(window.requestAnimationFrame as jest.Mock).mockReset()
})

const renderDirectoryContent = (payload: FileTreePagePayload) => {
  return render(
    <CurrentRepositoryProvider repository={payload.repo}>
      <FilesPageInfoProvider action="tree" copilotAccessAllowed={false} path={payload.path} refInfo={payload.refInfo}>
        <CurrentTreeProvider payload={payload.tree}>
          <DirectoryContent />
        </CurrentTreeProvider>
      </FilesPageInfoProvider>
    </CurrentRepositoryProvider>,
  )
}

describe('Accessibility', () => {
  describe('DirectoryContent', () => {
    test('Ensure table exists and is labelled by its heading', async () => {
      renderDirectoryContent(oneItemPayload)

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      const filesTableHeading = screen.getByRole('heading', {name: 'Folders and files'})
      const filesTableHeadingId = filesTableHeading.getAttribute('id')
      expect(table).toHaveAttribute('aria-labelledby', filesTableHeadingId)
    })

    test('H2: Files and directories table', async () => {
      renderDirectoryContent(oneItemPayload)
      const filesTableHeading = screen.getByRole('heading', {name: 'Folders and files'}) // wiggle room here on specific verbiage
      expect(filesTableHeading.tagName).toBe('H2')
    })
  })
})
