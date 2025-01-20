import {screen, within, fireEvent} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {type ImageVersion, ImageVersionState} from '../../../../types/image'
import {ImageVersionSelector} from '../ImageVersionSelector'

const successfulImageVersion: ImageVersion = {
  version: '1.0.0',
  state: ImageVersionState.Ready,
  createdOn: '2024-01-01',
}
const latestImageVersion: ImageVersion = {
  version: 'latest',
  state: ImageVersionState.Ready,
  createdOn: '2024-01-01',
}

describe('ImageVersionSelector', () => {
  test('renders error if no image versions', () => {
    render(<ImageVersionSelector imageVersions={[]} selectedImageVersion={null} setSelectedImageVersion={jest.fn()} />)

    expect(screen.getByText('No image versions available.')).toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  test('renders image versions', () => {
    render(
      <ImageVersionSelector
        imageVersions={[latestImageVersion, successfulImageVersion]}
        selectedImageVersion={null}
        setSelectedImageVersion={jest.fn()}
      />,
    )

    const imageVersionSelector = screen.getByTestId('image-versions-selector-btn')
    expect(imageVersionSelector).toBeInTheDocument()
    fireEvent.click(imageVersionSelector)

    const imageVersionSelectorOptions = screen.getByRole('menu')
    const options = within(imageVersionSelectorOptions).getAllByRole('menuitemradio')

    expect(options).toHaveLength(2)
  })
})
