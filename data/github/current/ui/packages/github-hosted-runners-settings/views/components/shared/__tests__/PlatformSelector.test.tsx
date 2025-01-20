import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {type Platform, PlatformOsType, platformOptions} from '../../../../types/platform'
import {PlatformSelector} from '../PlatformSelector'
import {getImage, getMachineSpec} from '../../../../test-utils/mock-data'
import {MachineSpecArchitecture} from '../../../../types/machine-spec'

const machineSpecs = [
  getMachineSpec(),
  getMachineSpec({
    id: 'arm-4-core',
    architecture: MachineSpecArchitecture.ARM64,
  }),
]

const images = {
  github: [getImage()],
  partner: [
    getImage({
      platform: 'linux-arm64',
      displayName: 'Arm Linux Image',
    }),
    getImage({
      platform: 'win-arm64',
      displayName: 'Arm Windows Image',
    }),
  ],
}

describe('PlatformSelector', () => {
  test('renders unfiltered', () => {
    render(
      <PlatformSelector
        value={platformOptions[0]}
        setValue={jest.fn()}
        isCustomImageUploadingEnabled={true}
        machineSpecs={machineSpecs}
        images={images}
        onValidationError={jest.fn()}
      />,
    )

    const platformRadioGroup = screen.getByTestId('platform-input')
    expect(platformRadioGroup).toBeInTheDocument()

    const radioGroup = within(platformRadioGroup).getByRole('group')
    expect(radioGroup).toHaveTextContent('Platform')

    // all radios are rendered
    const radios = within(platformRadioGroup).getAllByRole('radio')
    expect(radios).toHaveLength(platformOptions.length)

    // renders a radio and label for each radio button
    for (const option of platformOptions) {
      const radio = within(platformRadioGroup).getByTestId(`platform-option-radio-${option.id}`)
      expect(radio).toBeInTheDocument()
      expect(radio).toHaveAttribute('value', option.id)

      const label = within(platformRadioGroup).getByTestId(`platform-option-label-${option.id}`)
      expect(label).toBeInTheDocument()
      expect(label).toHaveTextContent(option.displayName)
    }

    const saveButton = screen.getByTestId('platform-save-button')
    expect(saveButton).toBeInTheDocument()
  })

  test('filters out ARM64 options when no ARM64 images available', () => {
    const imagesWithoutArm = {...images, partner: []}
    render(
      <PlatformSelector
        value={platformOptions[0]}
        setValue={jest.fn()}
        isCustomImageUploadingEnabled={true}
        machineSpecs={machineSpecs}
        images={imagesWithoutArm}
        onValidationError={jest.fn()}
      />,
    )

    const hasArm = (platform: Platform) => platform.id.endsWith('-arm64')

    const platformRadioGroup = screen.getByTestId('platform-input')
    expect(platformRadioGroup).toBeInTheDocument()

    const radioGroup = within(platformRadioGroup).getByRole('group')
    expect(radioGroup).toHaveTextContent('Platform')

    const radios = within(platformRadioGroup).getAllByRole('radio')
    const values = radios.map(radio => radio.getAttribute('value'))

    for (const option of platformOptions.filter(hasArm)) {
      expect(values).not.toContain(option.id)
    }
  })

  test('filters out ARM64 options when no ARM64 machine spec available', () => {
    const machineSpecsWithoutArm = machineSpecs.filter(spec => spec.architecture !== MachineSpecArchitecture.ARM64)
    render(
      <PlatformSelector
        value={platformOptions[0]}
        setValue={jest.fn()}
        isCustomImageUploadingEnabled={true}
        machineSpecs={machineSpecsWithoutArm}
        images={images}
        onValidationError={jest.fn()}
      />,
    )

    const hasArm = (platform: Platform) => platform.id.endsWith('-arm64')

    const platformRadioGroup = screen.getByTestId('platform-input')
    expect(platformRadioGroup).toBeInTheDocument()

    const radioGroup = within(platformRadioGroup).getByRole('group')
    expect(radioGroup).toHaveTextContent('Platform')

    const radios = within(platformRadioGroup).getAllByRole('radio')
    const values = radios.map(radio => radio.getAttribute('value'))

    for (const option of platformOptions.filter(hasArm)) {
      expect(values).not.toContain(option.id)
    }
  })

  test('filters out Linux ARM64 options when no Linux ARM64 images available', () => {
    const imagesWithWindowsArmOnly = {
      ...images,
      partner: [
        getImage({
          platform: 'win-arm64',
          displayName: 'Arm Windows Image',
        }),
      ],
    }
    render(
      <PlatformSelector
        value={platformOptions[0]}
        setValue={jest.fn()}
        isCustomImageUploadingEnabled={true}
        machineSpecs={machineSpecs}
        images={imagesWithWindowsArmOnly}
        onValidationError={jest.fn()}
      />,
    )

    const hasLinuxArm = (platform: Platform) => platform.id.endsWith('linux-arm64')

    const platformRadioGroup = screen.getByTestId('platform-input')
    expect(platformRadioGroup).toBeInTheDocument()

    const radioGroup = within(platformRadioGroup).getByRole('group')
    expect(radioGroup).toHaveTextContent('Platform')

    const radios = within(platformRadioGroup).getAllByRole('radio')
    const values = radios.map(radio => radio.getAttribute('value'))

    for (const option of platformOptions.filter(hasLinuxArm)) {
      expect(values).not.toContain(option.id)
    }
  })

  test('filters out custom image uploading option when feature is not enabled', () => {
    render(
      <PlatformSelector
        value={platformOptions[0]}
        setValue={jest.fn()}
        isCustomImageUploadingEnabled={false}
        machineSpecs={machineSpecs}
        images={images}
        onValidationError={jest.fn()}
      />,
    )

    const isCustom = (platform: Platform) => platform.osType === PlatformOsType.Custom

    const platformRadioGroup = screen.getByTestId('platform-input')
    expect(platformRadioGroup).toBeInTheDocument()

    const radioGroup = within(platformRadioGroup).getByRole('group')
    expect(radioGroup).toHaveTextContent('Platform')

    const radios = within(platformRadioGroup).getAllByRole('radio')
    const values = radios.map(radio => radio.getAttribute('value'))

    for (const option of platformOptions.filter(isCustom)) {
      expect(values).not.toContain(option.id)
    }
  })
})
