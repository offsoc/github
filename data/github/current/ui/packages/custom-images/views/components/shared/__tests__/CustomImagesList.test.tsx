import {screen, render} from '@testing-library/react'
import CustomImagesList from '../CustomImagesList'
import {customLinuxImage, customWindowsImage} from '../../../../test-utils/mock-data'

describe('CustomImagesList', () => {
  const entityLogin = 'fake-entity-login'
  const isEnterprise = false

  test('renders no images message when images list is empty', () => {
    render(<CustomImagesList entityLogin={entityLogin} images={[]} isEnterprise={isEnterprise} />)

    const noImagesError = screen.getByTestId('no-images-error')
    expect(noImagesError).toBeInTheDocument()
    expect(noImagesError).toHaveTextContent('There are no custom images available.')
  })

  test('renders image list correctly with images', () => {
    render(
      <CustomImagesList
        entityLogin={entityLogin}
        images={[customLinuxImage, customWindowsImage]}
        isEnterprise={isEnterprise}
      />,
    )

    const displayImagesSection = screen.getByTestId('display-images-section')
    expect(displayImagesSection).toBeInTheDocument()

    const imagesCount = screen.getByTestId('images-count')
    expect(imagesCount).toHaveTextContent('2 custom images')

    const customImageItems = screen.getAllByTestId('custom-image-item')
    expect(customImageItems.length).toBe(2)
  })

  test('renders filtered images based on search query', () => {
    render(
      <CustomImagesList
        entityLogin={entityLogin}
        images={[customLinuxImage, customWindowsImage]}
        isEnterprise={isEnterprise}
        searchQuery="linux"
      />,
    )

    const customImageItems = screen.getAllByTestId('custom-image-item')
    expect(customImageItems.length).toBe(1)
    expect(screen.getByText(customLinuxImage.displayName)).toBeInTheDocument()
  })
})
