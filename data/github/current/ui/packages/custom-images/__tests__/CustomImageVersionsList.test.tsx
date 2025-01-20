import {act, fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {CustomImageVersionsList} from '../routes/CustomImageVersionsList'
import {imageVersionDeletePath} from '../helpers/paths'
import {getCustomImageVersionsRoutePayload, customLinuxImage, readyImageVersion} from '../test-utils/mock-data'

import {verifiedFetchJSON} from '@github-ui/verified-fetch'
const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))

test('Renders versions', () => {
  const routePayload = getCustomImageVersionsRoutePayload()
  render(<CustomImageVersionsList />, {
    routePayload,
  })
  expect(screen.queryByTestId('no-versions-error')).toBeNull()
  expect(screen.getByTestId('custom-image-versions-title')).toHaveTextContent(
    `Custom images / ${customLinuxImage.displayName}`,
  )
  expect(screen.getByTestId('display-versions-section')).toBeVisible()
  expect(screen.getByTestId('versions-count')).toHaveTextContent('2 versions')
  expect(screen.getByTestId('display-versions-section')).toBeVisible()
})

test('Renders message when no versions', () => {
  const routePayload = getCustomImageVersionsRoutePayload({versions: []})
  render(<CustomImageVersionsList />, {
    routePayload,
  })
  expect(screen.getByTestId('no-versions-error')).toHaveTextContent('There are no image versions available.')
  expect(screen.getByTestId('no-versions-error')).toBeVisible()
  expect(screen.queryByTestId('versions-count')).toBeNull()
  expect(screen.queryByTestId('display-versions-section')).toBeNull()
})

describe('Image version delete', () => {
  test('happy path - can delete a ready image version', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      status: 200,
      json: async () => {
        return {success: true, errors: []}
      },
    })

    const imageDefinitionId = '112233'
    const isEnterprise = false
    const entityLogin = 'josh-corp'
    const versions = [readyImageVersion]

    const routePayload = getCustomImageVersionsRoutePayload({imageDefinitionId, isEnterprise, entityLogin, versions})
    render(<CustomImageVersionsList />, {
      routePayload,
    })

    const trashButton = screen.getByTestId('trash-button')
    fireEvent.click(trashButton)

    const deleteButton = screen.getByTestId('image-version-delete-button')
    fireEvent.click(deleteButton)

    // calls the delete API
    await act(() =>
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        imageVersionDeletePath({imageDefinitionId, version: readyImageVersion.version, isEnterprise, entityLogin}),
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
