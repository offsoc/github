import {render, fireEvent, screen} from '@testing-library/react'
import MachineSpecSelect from '../MachineSpecSelect'
import {getImage, getNewRunnerRoutePayload, getMachineSpec} from '../../../../test-utils/mock-data'
import {MachineSpecArchitecture, type MachineSpec} from '../../../../types/machine-spec'
import {ImageSource} from '../../../../types/image'
import {platformOptions} from '../../../../types/platform'

describe('MachineSpecSelect', () => {
  const mockSetValue = jest.fn()
  const mockOnSave = jest.fn()
  const mockOnSelect = jest.fn()
  const defaultPlatform = platformOptions.find(p => p.architecture === MachineSpecArchitecture.x64)!

  const defaultProps = {
    value: null,
    runnerImage: null,
    platform: defaultPlatform,
    options: [] satisfies MachineSpec[],
    isImageGenerationEnabled: false,
    setValue: mockSetValue,
    onSave: mockOnSave,
    onSelect: mockOnSelect,
  } as const satisfies React.ComponentProps<typeof MachineSpecSelect>

  it('renders save button if selectedImage is not null', () => {
    const image = getImage()
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} />)
    expect(screen.getByTestId('runner-machine-spec-save-button')).toBeInTheDocument()
  })

  it('calls setValue and onSave when save button is clicked', () => {
    const image = getImage()
    const runnerPayload = getNewRunnerRoutePayload()
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} options={runnerPayload.machineSpecs} />)
    fireEvent.click(screen.getByTestId('runner-machine-spec-radio-4-core'))
    fireEvent.click(screen.getByTestId('runner-machine-spec-save-button'))
    expect(mockSetValue).toHaveBeenCalled()
    expect(mockOnSave).toHaveBeenCalled()
  })

  it('renders the save button as disabled when no value is selected', () => {
    const image = getImage()
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} />)
    expect(screen.getByTestId('runner-machine-spec-save-button')).toBeDisabled()
  })

  it('calls onSelect when a machine spec is selected', () => {
    const image = getImage()
    const runnerPayload = getNewRunnerRoutePayload()
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} options={runnerPayload.machineSpecs} />)
    fireEvent.click(screen.getByTestId('runner-machine-spec-radio-4-core'))
    expect(mockOnSelect).toHaveBeenCalled()
  })

  it('calls onSelect when the save button is clicked', () => {
    const image = getImage()
    const runnerPayload = getNewRunnerRoutePayload()
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} options={runnerPayload.machineSpecs} />)
    fireEvent.click(screen.getByTestId('runner-machine-spec-radio-4-core'))
    fireEvent.click(screen.getByTestId('runner-machine-spec-save-button'))
    expect(mockOnSelect).toHaveBeenCalled()
  })

  it('renders all provided machine spec options', () => {
    const image = getImage()
    const runnerPayload = getNewRunnerRoutePayload()
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} options={runnerPayload.machineSpecs} />)

    for (const spec of runnerPayload.machineSpecs) {
      expect(screen.getByText(spec.id)).toBeInTheDocument()
    }
  })

  it('renders only machine specs that satisfy the minimum storage requirement of the selected image', () => {
    const image = getImage({sizeGb: 100})
    const machineSpecTooSmall = getMachineSpec({id: 'small-spec', storageGb: 10})
    const machineSpecLargeEnough = getMachineSpec({id: 'large-spec', storageGb: 10000})

    const options = [machineSpecTooSmall, machineSpecLargeEnough]
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} options={options} />)

    expect(screen.queryByTestId('runner-machine-spec-radio-small-spec')).not.toBeInTheDocument()
    expect(screen.getByTestId('runner-machine-spec-radio-large-spec')).toBeInTheDocument()
  })

  it('renders machine spec storage sizes at maximum of 1024GB if image generation is enabled', () => {
    const specId = 'big-storage'
    const cpuCores = 4
    const memoryGb = 16
    const storageGb = 99999
    const machineSpec = getMachineSpec({id: specId, type: 'basic', cpuCores, memoryGb, storageGb})
    const options = [machineSpec]
    render(<MachineSpecSelect {...defaultProps} options={options} isImageGenerationEnabled={true} />)
    expect(screen.getByTestId(`runner-machine-spec-radio-text-secondary-${specId}`)).toHaveTextContent(
      `${memoryGb} GB RAM · 1024 GB SSD`,
    )
  })

  it('renders machine spec option correctly for a basic spec', () => {
    const image = getImage({source: ImageSource.Marketplace})

    const specId = '4-core'
    const cpuCores = 4
    const memoryGb = 16
    const storageGb = 150
    const machineSpec = getMachineSpec({id: specId, type: 'basic', cpuCores, memoryGb, storageGb})

    render(<MachineSpecSelect {...defaultProps} options={[machineSpec]} runnerImage={image} />)

    expect(screen.getByTestId(`runner-machine-spec-radio-text-primary-${specId}`)).toHaveTextContent(specId)
    expect(screen.getByTestId(`runner-machine-spec-radio-text-secondary-${specId}`)).toHaveTextContent(
      `${memoryGb} GB RAM · ${storageGb} GB SSD`,
    )
    expect(screen.queryByTestId(`runner-machine-spec-radio-documentation-link-${specId}`)).not.toBeInTheDocument()
  })

  it('renders machine spec option correctly for a ARM64 spec', () => {
    const image = getImage({source: ImageSource.Marketplace})

    const specId = 'arm-4-core'
    const cpuCores = 4
    const memoryGb = 16
    const storageGb = 150
    const machineSpec = getMachineSpec({id: specId, type: 'basic', cpuCores, memoryGb, storageGb})

    render(<MachineSpecSelect {...defaultProps} options={[machineSpec]} runnerImage={image} />)

    expect(screen.getByTestId(`runner-machine-spec-radio-text-primary-${specId}`)).toHaveTextContent(`${cpuCores}-core`)
    expect(screen.getByTestId(`runner-machine-spec-radio-text-secondary-${specId}`)).toHaveTextContent(
      `${memoryGb} GB RAM · ${storageGb} GB SSD`,
    )
    expect(screen.queryByTestId(`runner-machine-spec-radio-documentation-link-${specId}`)).not.toBeInTheDocument()
  })

  it('renders machine spec option correctly for a gpu spec', () => {
    const image = getImage({source: ImageSource.Marketplace})

    const specId = 'gpu-t4-4-core'
    const cpuCores = 4
    const memoryGb = 16
    const storageGb = 150
    const documentationUrl = 'https://example.com'
    const gpu = {
      count: 1,
      name: 'NVIDIA Tesla T4',
      memoryGb: 16,
    }
    const machineSpec = getMachineSpec({
      id: specId,
      type: 'gpu_optimized',
      cpuCores,
      memoryGb,
      storageGb,
      gpu,
      documentationUrl,
    })

    render(<MachineSpecSelect {...defaultProps} options={[machineSpec]} runnerImage={image} />)
    expect(screen.getByTestId(`runner-machine-spec-radio-text-primary-${specId}`)).toHaveTextContent(
      `${gpu.count} x ${gpu.name} · ${gpu.memoryGb} GB VRAM`,
    )
    expect(screen.getByTestId(`runner-machine-spec-radio-text-secondary-${specId}`)).toHaveTextContent(
      `${cpuCores}-core · ${memoryGb} GB RAM · ${storageGb} GB SSD`,
    )
    expect(screen.queryByTestId(`runner-machine-spec-radio-documentation-link-${specId}`)).toHaveAttribute(
      'href',
      documentationUrl,
    )
  })

  it('renders multiple tabs when multiple machine spec types are valid', () => {
    // NOTE: the image source can't be curated, because we don't have GPU SKUs for curated images
    const image = getImage({source: ImageSource.Marketplace})

    const availableSpecs = ['basic', 'gpu_optimized'] as const
    const options = availableSpecs.map(specType => getMachineSpec({type: specType}))
    render(<MachineSpecSelect {...defaultProps} options={options} runnerImage={image} />)

    for (const specType of availableSpecs) {
      expect(screen.getByTestId(`runner-machine-spec-tab-${specType}`)).toBeInTheDocument()
    }
  })

  it('does not render tabs when no spec types are given', () => {
    const image = getImage()
    render(<MachineSpecSelect {...defaultProps} options={[]} runnerImage={image} />)
    expect(screen.queryByTestId(`runner-machine-spec-tabs`)).not.toBeInTheDocument()
  })

  it('does not render tabs when only 1 spec type is available', () => {
    const image = getImage()
    const specType = 'basic'
    const options = [getMachineSpec({type: specType})]
    render(<MachineSpecSelect {...defaultProps} options={options} runnerImage={image} />)
    expect(screen.queryByTestId(`runner-machine-spec-tabs`)).toBeNull()
  })

  it('does render only x64 machine specs for x64 selected platform', () => {
    const image = getImage()
    const machineSpecs = [
      getMachineSpec(),
      getMachineSpec({
        id: 'arm-4-core',
        architecture: MachineSpecArchitecture.ARM64,
      }),
    ]
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} options={machineSpecs} />)

    for (const spec of machineSpecs.filter(ms => ms.architecture === MachineSpecArchitecture.ARM64)) {
      expect(screen.queryByText(spec.id)).not.toBeInTheDocument()
    }
  })

  it('does render only arm64 machine specs for arm64 selected platform', () => {
    const image = getImage()
    const machineSpecs = [
      getMachineSpec(),
      getMachineSpec({
        id: 'arm-4-core',
        architecture: MachineSpecArchitecture.ARM64,
      }),
    ]
    const platform = platformOptions.find(p => p.architecture === MachineSpecArchitecture.ARM64)!
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} options={machineSpecs} platform={platform} />)

    for (const spec of machineSpecs.filter(ms => ms.architecture === MachineSpecArchitecture.x64)) {
      expect(screen.queryByTestId(`runner-machine-spec-radio-text-primary-${spec.id}`)).not.toBeInTheDocument()
    }
  })

  it('preselects the first spec of the sole tab when no value is selected', () => {
    const image = getImage()
    const machineSpecs = [getMachineSpec({id: 'basic-1'}), getMachineSpec({id: 'basic-2'})]
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} options={machineSpecs} />)

    expect(screen.getByTestId('runner-machine-spec-radio-basic-1')).toBeChecked()
  })

  it('preselects the first spec of the first of two tabs when no value is selected', () => {
    const image = getImage()
    const machineSpecs = [
      getMachineSpec({id: 'basic-1'}),
      getMachineSpec({id: 'basic-2'}),
      getMachineSpec({id: 'gpu-1', type: 'gpu_optimized'}),
      getMachineSpec({id: 'gpu-2', type: 'gpu_optimized'}),
    ]
    render(<MachineSpecSelect {...defaultProps} runnerImage={image} options={machineSpecs} />)

    expect(screen.getByTestId('runner-machine-spec-radio-basic-1')).toBeChecked()
  })
})
