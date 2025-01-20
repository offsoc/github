import {screen, within, fireEvent} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {type Image, type ImageVersion, ImageSource, ImageVersionState} from '../../../../types/image'
import ImageSelector from '../ImageSelector'
import {platformOptions} from '../../../../types/platform'
import {imageUploadValuesDefault} from '../../../../types/image-upload'

const githubLinux: Image = {
  id: 'ubuntu-latest',
  displayName: 'Latest (22.04)',
  source: ImageSource.Curated,
  platform: 'linux-x64',
  sizeGb: 86,
}
const githubLinuxNonLatest: Image = {
  id: 'ubuntu-20.04',
  displayName: '20.04',
  source: ImageSource.Curated,
  platform: 'linux-x64',
  sizeGb: 86,
}
const githubWindows: Image = {
  id: 'windows-latest',
  displayName: 'Latest (2022)',
  source: ImageSource.Curated,
  platform: 'win-x64',
  sizeGb: 256,
}
const partnerLinux: Image = {
  id: 'partner-linux',
  displayName: 'Partner Linux',
  source: ImageSource.Marketplace,
  platform: 'linux-x64',
  sizeGb: 86,
}
const partnerLinuxWithLatestInName: Image = {
  id: 'partner-linux-latest',
  displayName: 'Partner Linux Latest',
  source: ImageSource.Marketplace,
  platform: 'linux-x64',
  sizeGb: 86,
}
const partnerLinuxWithImageGenerationSupport: Image = {
  id: 'partner-linux-image-gen',
  displayName: 'Partner Linux Image Gen',
  source: ImageSource.Marketplace,
  platform: 'linux-x64',
  sizeGb: 86,
  isImageGenerationSupported: true,
}
const successfulImageVersion: ImageVersion = {
  version: '1.0.0',
  state: ImageVersionState.Ready,
  createdOn: '2024-01-01',
}
const failedImageVersion: ImageVersion = {
  version: '1.2.0',
  state: ImageVersionState.ImportFailed,
  createdOn: '2024-01-01',
}
const latestImageVersion: ImageVersion = {
  version: 'latest',
  state: ImageVersionState.Ready,
  createdOn: '2024-01-01',
}
const customLinux: Image = {
  id: '3',
  displayName: 'Custom Linux Image',
  source: ImageSource.Custom,
  platform: 'linux-x64',
  sizeGb: 86,
  imageVersions: [successfulImageVersion],
}

const images = {
  github: [githubLinux, githubLinuxNonLatest, githubWindows],
  partner: [partnerLinux, partnerLinuxWithLatestInName, partnerLinuxWithImageGenerationSupport],
  custom: [],
}

const imageUploadValues = imageUploadValuesDefault

const defaultTestProps = {
  allImages: images,
  platform: platformOptions[0],
  value: null,
  setValue: jest.fn(),
  onValidationError: jest.fn(),
  imageVersion: null,
  setImageVersion: jest.fn(),
  isImageGenerationFeatureEnabled: false,
  isImageGenerationEnabled: false,
  setIsImageGenerationEnabled: jest.fn(),
  imageUploadValues,
  setImageUploadValues: jest.fn(),
}
const renderImageSelectorWithProps = (props = {}) => {
  const combinedProps = {...defaultTestProps, ...props}
  return render(<ImageSelector {...combinedProps} />)
}

describe('ImageSelector - Non-upload Scenarios', () => {
  test('renders all tabs', () => {
    const allImages = {...images, custom: [customLinux]}
    renderImageSelectorWithProps({allImages})

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const tabs = within(imageSelectorTabs).getAllByRole('tab')
    expect(tabs).toHaveLength(3)

    const curatedTab = within(imageSelectorTabs).getByRole('tab', {name: 'GitHub-owned'})
    expect(curatedTab).toBeInTheDocument()

    const partnerTab = within(imageSelectorTabs).getByRole('tab', {name: 'Partner'})
    expect(partnerTab).toBeInTheDocument()

    const customTab = within(imageSelectorTabs).getByRole('tab', {name: 'Custom'})
    expect(customTab).toBeInTheDocument()
  })

  test('renders only tabs for available images', () => {
    renderImageSelectorWithProps()

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const tabs = within(imageSelectorTabs).getAllByRole('tab')
    expect(tabs).toHaveLength(2)

    const curatedTab = within(imageSelectorTabs).getByRole('tab', {name: 'GitHub-owned'})
    expect(curatedTab).toBeInTheDocument()

    const partnerTab = within(imageSelectorTabs).getByRole('tab', {name: 'Partner'})
    expect(partnerTab).toBeInTheDocument()

    const customTab = within(imageSelectorTabs).queryByRole('tab', {name: 'Custom'})
    expect(customTab).not.toBeInTheDocument()
  })

  test('renders only options for selected platform', () => {
    renderImageSelectorWithProps()

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const curatedTab = within(imageSelectorTabs).getByRole('tab', {name: 'GitHub-owned'})
    expect(curatedTab).toBeInTheDocument()
    fireEvent.click(curatedTab)

    const imageSelectorTabContent = screen.getByTestId('image-selector-tab-content')

    const radios = within(imageSelectorTabContent).getAllByRole('radio')
    const values = radios.map(radio => radio.getAttribute('value'))

    for (const image of images.github.filter(i => i.platform === 'win-x64')) {
      expect(values).not.toContain(image.id)
    }
  })

  test('renders correct content for selected tab', () => {
    renderImageSelectorWithProps()

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const partnerTab = within(imageSelectorTabs).getByRole('tab', {name: 'Partner'})
    expect(partnerTab).toBeInTheDocument()
    fireEvent.click(partnerTab)

    const imageSelectorTabContent = screen.getByTestId('image-selector-tab-content')

    const radios = within(imageSelectorTabContent).getAllByRole('radio')
    const values = radios.map(radio => radio.getAttribute('value'))

    for (const image of images.github) {
      expect(values).not.toContain(image.id)
    }
    for (const image of images.partner) {
      expect(values).toContain(image.id)
    }
  })

  test('properly sets default tab', () => {
    const imagesWithoutGithub = {...images, github: []}
    renderImageSelectorWithProps({allImages: imagesWithoutGithub})

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const partnerTab = within(imageSelectorTabs).getByRole('tab', {name: 'Partner'})
    expect(partnerTab).toBeInTheDocument()
    expect(partnerTab).toHaveAttribute('aria-selected', 'true')

    const imageSelectorTabContent = screen.getByTestId('image-selector-tab-content')

    const radios = within(imageSelectorTabContent).getAllByRole('radio')
    const values = radios.map(radio => radio.getAttribute('value'))

    for (const image of images.partner) {
      expect(values).toContain(image.id)
    }
  })

  test('filters images correctly', () => {
    const extraGithubImage: Image = {
      id: 'ubuntu-22.04',
      displayName: '22.04',
      source: ImageSource.Curated,
      platform: 'linux-x64',
      sizeGb: 86,
    }
    const allImages = {...images, curated: [...images.github, extraGithubImage]}
    renderImageSelectorWithProps({allImages})

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const imageSelectorTabContent = screen.getByTestId('image-selector-tab-content')

    const imageFilterInput = within(imageSelectorTabContent).getByRole('textbox')

    // show values if something matches filter, case-insensitive
    fireEvent.change(imageFilterInput, {target: {value: 'LaTeSt'}})

    const radios = within(imageSelectorTabContent).getAllByRole('radio')
    const values = radios.map(radio => radio.getAttribute('value'))

    expect(values).not.toContain(extraGithubImage.id)
    expect(values).toContain(githubLinux.id)

    // show text if nothing matches filter
    fireEvent.change(imageFilterInput, {target: {value: 'bla-bla'}})
    const notFoundText = within(imageSelectorTabContent).getByText('No images match that filter')

    expect(within(imageSelectorTabContent).queryAllByRole('radio')).toHaveLength(0)
    expect(notFoundText).toBeInTheDocument()
  })

  test('renders image versions for custom image', () => {
    const allImages = {...images, custom: [customLinux]}
    renderImageSelectorWithProps({allImages})

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const customTab = within(imageSelectorTabs).getByRole('tab', {name: 'Custom'})
    expect(customTab).toBeInTheDocument()
    fireEvent.click(customTab)

    const imageSelectorTabContent = screen.getByTestId('image-selector-tab-content')

    const radios = within(imageSelectorTabContent).getAllByRole('radio')
    const customLinuxRadio = radios.find(radio => radio.getAttribute('value') === customLinux.id)
    expect(customLinuxRadio).toBeInTheDocument()
    fireEvent.click(customLinuxRadio!)

    const imageVersionSelector = screen.getByTestId('image-versions-selector-btn')
    expect(imageVersionSelector).toBeInTheDocument()
    fireEvent.click(imageVersionSelector)

    const imageVersionSelectorOptions = screen.getByRole('menu')
    const options = within(imageVersionSelectorOptions).getAllByRole('menuitemradio')

    expect(options).toHaveLength(1)
    expect(options[0]).toHaveAttribute('aria-checked', 'true')
    expect(options[0]).toHaveTextContent(successfulImageVersion.version)
  })

  test('renders image versions for custom image on arm64 platform', () => {
    const customArmLinux: Image = {
      id: '4',
      displayName: 'Custom Arm Linux Image',
      source: ImageSource.Custom,
      platform: 'linux-arm64',
      sizeGb: 86,
      imageVersions: [successfulImageVersion],
    }
    const allImages = {...images, custom: [customLinux, customArmLinux]}
    renderImageSelectorWithProps({allImages, platform: platformOptions[1]})

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const customTab = within(imageSelectorTabs).getByRole('tab', {name: 'Custom'})
    expect(customTab).toBeInTheDocument()
    fireEvent.click(customTab)

    const imageSelectorTabContent = screen.getByTestId('image-selector-tab-content')

    const radios = within(imageSelectorTabContent).getAllByRole('radio')
    const values = radios.map(radio => radio.getAttribute('value'))
    const customArmLinuxRadio = radios.find(radio => radio.getAttribute('value') === customArmLinux.id)
    expect(customArmLinuxRadio).toBeInTheDocument()
    expect(values).toContain(customArmLinux.id)
    expect(values).not.toContain(customLinux.id)
    fireEvent.click(customArmLinuxRadio!)

    const imageVersionSelector = screen.getByTestId('image-versions-selector-btn')
    expect(imageVersionSelector).toBeInTheDocument()
    fireEvent.click(imageVersionSelector)

    const imageVersionSelectorOptions = screen.getByRole('menu')
    const options = within(imageVersionSelectorOptions).getAllByRole('menuitemradio')

    expect(options).toHaveLength(1)
    expect(options[0]).toHaveAttribute('aria-checked', 'true')
    expect(options[0]).toHaveTextContent(successfulImageVersion.version)
  })

  test('renders only successful image versions', () => {
    const customImageWithFailedVersion = {
      ...customLinux,
      imageVersions: [latestImageVersion, successfulImageVersion, failedImageVersion],
    }
    const allImages = {...images, custom: [customImageWithFailedVersion]}
    renderImageSelectorWithProps({allImages})

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const customTab = within(imageSelectorTabs).getByRole('tab', {name: 'Custom'})
    expect(customTab).toBeInTheDocument()
    fireEvent.click(customTab)

    const imageSelectorTabContent = screen.getByTestId('image-selector-tab-content')

    const radios = within(imageSelectorTabContent).getAllByRole('radio')
    const customLinuxRadio = radios.find(radio => radio.getAttribute('value') === customLinux.id)
    expect(customLinuxRadio).toBeInTheDocument()
    fireEvent.click(customLinuxRadio!)

    const imageVersionSelector = screen.getByTestId('image-versions-selector-btn')
    expect(imageVersionSelector).toBeInTheDocument()
    fireEvent.click(imageVersionSelector)

    const imageVersionSelectorOptions = screen.getByRole('menu')
    const options = within(imageVersionSelectorOptions).getAllByRole('menuitemradio')
    const versions = options.map(option => option.getAttribute('key'))

    expect(options).toHaveLength(2)
    expect(versions).not.toContain(failedImageVersion.version)
  })

  test('do not render image if only latest image version available', () => {
    const customImageWithFailedVersion = {
      ...customLinux,
      id: '4',
      imageVersions: [latestImageVersion, failedImageVersion],
    }
    const allImages = {...images, custom: [customImageWithFailedVersion, customLinux]}
    renderImageSelectorWithProps({allImages})

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const customTab = within(imageSelectorTabs).getByRole('tab', {name: 'Custom'})
    expect(customTab).toBeInTheDocument()
    fireEvent.click(customTab)

    const imageSelectorTabContent = screen.getByTestId('image-selector-tab-content')

    const radios = within(imageSelectorTabContent).getAllByRole('radio')
    expect(radios.filter(radio => radio.getAttribute('value') === customImageWithFailedVersion.id)).toHaveLength(0)
  })

  test('renders "latest" description and label for Curated tab', () => {
    renderImageSelectorWithProps()

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const latestCaption = screen.queryByTestId('image-selector-latest-caption')
    expect(latestCaption).toBeInTheDocument()

    const latestLabel = screen.queryByTestId('image-selector-latest-label')
    expect(latestLabel).toHaveTextContent('Latest')

    // select non-latest image
    const imageSelectorTabContent = screen.getByTestId('image-selector-tab-content')
    const radios = within(imageSelectorTabContent).getAllByRole('radio')
    const githubLinuxNonLatestRadio = radios.find(radio => radio.getAttribute('value') === githubLinuxNonLatest.id)
    expect(githubLinuxNonLatestRadio).toBeInTheDocument()
    fireEvent.click(githubLinuxNonLatestRadio!)

    expect(latestCaption).toBeInTheDocument()

    const imageFilterInput = within(imageSelectorTabContent).getByRole('textbox')

    // filter latest
    fireEvent.change(imageFilterInput, {target: {value: 'latest'}})
    expect(latestLabel).toBeInTheDocument()

    // filter only non-latest image
    fireEvent.change(imageFilterInput, {target: {value: githubLinuxNonLatest.id}})
    expect(latestLabel).not.toBeInTheDocument()
  })

  test('does not render "latest" description and label for Partner tab', () => {
    renderImageSelectorWithProps()

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const partnerTab = within(imageSelectorTabs).getByRole('tab', {name: 'Partner'})
    expect(partnerTab).toBeInTheDocument()
    fireEvent.click(partnerTab)

    const latestCaption = screen.queryByTestId('image-selector-latest-caption')
    expect(latestCaption).not.toBeInTheDocument()

    const latestLabel = screen.queryByTestId('image-selector-latest-label')
    expect(latestLabel).not.toBeInTheDocument()
  })
})

describe('ImageSelector - Custom Image Upload Scenarios', () => {
  const customPlatformOption = platformOptions.find(p => p.id === 'custom')!

  test('renders image upload ui', () => {
    renderImageSelectorWithProps({platform: customPlatformOption})

    expect(screen.getByTestId('image-upload-values')).toBeInTheDocument()
  })

  test('does not render image picker tabs or tab content', () => {
    renderImageSelectorWithProps({platform: customPlatformOption})

    expect(screen.queryByTestId('image-selector-tabs')).not.toBeInTheDocument()
    expect(screen.queryByTestId('image-selector-tab-content')).not.toBeInTheDocument()
  })
})

describe('ImageSelector - Image Generation Checkbox', () => {
  test('does not render checkbox when feature is disabled', () => {
    renderImageSelectorWithProps({
      isImageGenerationFeatureEnabled: false,
    })

    const checkbox = screen.queryByTestId('runner-enable-image-generation-checkbox')
    expect(checkbox).not.toBeInTheDocument()
  })

  test('renders checkbox when feature is enabled', () => {
    renderImageSelectorWithProps({
      isImageGenerationFeatureEnabled: true,
    })

    const checkbox = screen.getByTestId('runner-enable-image-generation-checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  test('disables checkbox when selected image does not support image generation', () => {
    renderImageSelectorWithProps({
      isImageGenerationFeatureEnabled: true,
      value: partnerLinux,
    })

    const checkbox = screen.getByTestId('runner-enable-image-generation-checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toBeDisabled()
  })

  test('enables checkbox when selected image supports image generation', () => {
    renderImageSelectorWithProps({
      isImageGenerationFeatureEnabled: true,
      value: partnerLinuxWithImageGenerationSupport,
    })

    const checkbox = screen.getByTestId('runner-enable-image-generation-checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeDisabled()
  })

  test('updates selectedIsImageGenerationEnabled when checkbox is clicked', () => {
    renderImageSelectorWithProps({
      isImageGenerationFeatureEnabled: true,
      value: partnerLinuxWithImageGenerationSupport,
    })

    const checkbox = screen.getByTestId('runner-enable-image-generation-checkbox')
    expect(checkbox).toBeInTheDocument()

    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()
  })
})
