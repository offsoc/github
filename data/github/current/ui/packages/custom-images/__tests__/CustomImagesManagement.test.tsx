import {act, fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {type Image, ImageDefinitionState, ImageSource} from '@github-ui/github-hosted-runners-settings/types/image'

import {CustomImagesManagement} from '../routes/CustomImagesManagement'
import {imageDefinitionDeletePath} from '../helpers/paths'
import {getCustomImagesRoutePayload} from '../test-utils/mock-data'

import {verifiedFetchJSON} from '@github-ui/verified-fetch'
const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})

const images: Image[] = [
  {
    id: '1',
    displayName: 'test-windows-image',
    source: ImageSource.Custom,
    platform: 'win-x64',
    sizeGb: 30,
    versionCount: 2,
    totalVersionsSize: 30,
    latestVersion: '1.0.1',
    state: ImageDefinitionState.Ready,
  },
  {
    id: '2',
    displayName: 'test-linux-image',
    source: ImageSource.Custom,
    platform: 'linux-x64',
    sizeGb: 30,
    versionCount: 1,
    totalVersionsSize: 30,
    latestVersion: '1.0.0',
    state: ImageDefinitionState.Ready,
  },
]

test('Renders the CustomImages with 1 image', () => {
  const routePayload = getCustomImagesRoutePayload({platform: 'linux-x64'})
  render(<CustomImagesManagement />, {
    routePayload,
  })
  expect(screen.getByTestId('custom-images-title')).toHaveTextContent('Custom images')
  expect(screen.getByTestId('display-images-section')).toBeVisible()
  expect(screen.getByTestId('images-count')).not.toHaveTextContent('1 custom images') // Test plural form
  expect(screen.getByTestId('images-count')).toHaveTextContent('1 custom image')
})

test('Renders the CustomImages with 2 images', () => {
  const routePayload = getCustomImagesRoutePayload({images})
  render(<CustomImagesManagement />, {
    routePayload,
  })
  expect(screen.getByTestId('custom-images-title')).toHaveTextContent('Custom images')
  expect(screen.getByTestId('display-images-section')).toBeVisible()
  expect(screen.getByTestId('images-count')).toHaveTextContent('2 custom images')
})

test('Renders the CustomImages with 0 image', () => {
  const routePayload = {images: []}
  render(<CustomImagesManagement />, {
    routePayload,
  })
  expect(screen.getByTestId('custom-images-title')).toHaveTextContent('Custom images')
  expect(screen.getByTestId('no-images-error')).toHaveTextContent('There are no custom images available.')
  expect(screen.queryByTestId('display-images-section')).toBeNull()
  expect(screen.queryByTestId('image-display-name')).toBeNull()
  expect(screen.queryByTestId('images-count')).toBeNull()
})

describe('Image delete', () => {
  test('happy path', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      status: 200,
      json: async () => {
        return {success: true, errors: []}
      },
    })

    const routePayload = getCustomImagesRoutePayload({platform: 'linux-x64'})
    render(<CustomImagesManagement />, {
      routePayload,
    })

    const trashButton = screen.getByTestId('trash-button')
    fireEvent.click(trashButton)

    const deleteButton = screen.getByTestId('image-delete-button')
    fireEvent.click(deleteButton)

    // calls the delete API
    await act(() =>
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        imageDefinitionDeletePath({imageDefinitionId: '1', isEnterprise: false, entityLogin: routePayload.entityLogin}),
        {
          method: 'DELETE',
        },
      ),
    )

    // gives the list item 'Deleting' status
    const stateEl = screen.getByTestId('image-state-text')
    expect(stateEl).toBeInTheDocument()
    expect(stateEl).toHaveTextContent('Deleting')
  })
})
