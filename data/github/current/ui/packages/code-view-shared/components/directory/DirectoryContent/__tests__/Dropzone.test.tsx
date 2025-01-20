import {fireEvent, render, screen} from '@testing-library/react'

import {Dropzone} from '../Dropzone'

const uploadUrl = '/user/repo/upload/main/my/path'

describe('Dropzone', () => {
  test('shows file upload message on file drag over', async () => {
    const {baseElement} = render(<Dropzone uploadUrl={uploadUrl} />)

    fireEvent.dragOver(baseElement)

    expect(await screen.findByText('Drop to upload your files')).toBeInTheDocument()
    const url = screen.getByTestId('dragzone').getAttribute('data-drop-url')
    expect(url).toEqual(uploadUrl)
  })
})
