import {fireEvent, render, screen} from '@testing-library/react'

import {Dropzone} from '../../Dropzone'

const uploadUrl = '/user/repo/upload/main/my/path'

describe('Accessibility', () => {
  describe('Dropzone', () => {
    test('H2: Drop to upload your files hidden from a11y tree', async () => {
      const {baseElement} = render(<Dropzone uploadUrl={uploadUrl} />)

      fireEvent.dragOver(baseElement)

      const dropToUpload = await screen.findByText('Drop to upload your files')

      expect(dropToUpload).toHaveAttribute('aria-hidden')
      expect(dropToUpload.tagName).toBe('H2')
    })
  })
})
