import {Box, Button, FormControl, Radio, RadioGroup} from '@primer/react'
import {useState, type ChangeEvent} from 'react'
import type {FieldProgressionFieldEditComponentProps} from './FieldProgressionField'
import {PlatformOsType, type Platform, platformOptions} from '../../../types/platform'
import {PlatformIcon} from './PlatformIcon'
import {MachineSpecArchitecture, type MachineSpec} from '../../../types/machine-spec'
import type {Image} from '../../../types/image'

interface IProps extends FieldProgressionFieldEditComponentProps<Platform> {
  isCustomImageUploadingEnabled: boolean
  machineSpecs: MachineSpec[]
  images: {[key: string]: Image[]}
  onValidationError: (error: boolean) => void
}

function isArmMachineSpecAvailable(machineSpecs: MachineSpec[]) {
  return machineSpecs.some((machineSpec: MachineSpec) => machineSpec.architecture === MachineSpecArchitecture.ARM64)
}

function isLinuxArmAvailable(machineSpecs: MachineSpec[], images: {[key: string]: Image[]}) {
  const linuxArmImages = Object.values(images)
    .reduce((acc, value) => acc.concat(value), [])
    .some(image => image.platform === 'linux-arm64')

  return linuxArmImages && isArmMachineSpecAvailable(machineSpecs)
}

function isWindowsArmAvailable(machineSpecs: MachineSpec[], images: {[key: string]: Image[]}) {
  const windowsArmImages = Object.values(images)
    .reduce((acc, value) => acc.concat(value), [])
    .some(image => image.platform === 'win-arm64')

  return windowsArmImages && isArmMachineSpecAvailable(machineSpecs)
}

export function PlatformSelector(props: IProps) {
  const [editorValue, setEditorValue] = useState<Platform | null>(props.value || platformOptions[0] || null)

  const handleInputChange = (selected: string | null, e: React.ChangeEvent<HTMLInputElement> | undefined) => {
    if (e) {
      const selectedPlatform = platformOptions.find(option => option.id === selected)
      setEditorValue(selectedPlatform || null)
    }
  }

  const handleSave = () => {
    props.onValidationError(false)
    if (!editorValue) {
      props.onValidationError(true)
      return
    }

    props.setValue(editorValue)
    if (props.onSave) {
      props.onSave()
    }
  }

  const availableOptions = platformOptions.filter(option => {
    const isLinuxArm64 = option.architecture === MachineSpecArchitecture.ARM64 && option.osType === PlatformOsType.Linux
    const isWindowsArm64 =
      option.architecture === MachineSpecArchitecture.ARM64 && option.osType === PlatformOsType.Windows
    const isCustomPlatform = option.osType === PlatformOsType.Custom

    return (
      (props.isCustomImageUploadingEnabled || !isCustomPlatform) &&
      (isLinuxArmAvailable(props.machineSpecs, props.images) || !isLinuxArm64) &&
      (isWindowsArmAvailable(props.machineSpecs, props.images) || !isWindowsArm64)
    )
  })

  return (
    <>
      <Box sx={{m: 3, mt: 2}} data-testid="platform-input">
        <RadioGroup
          name={'platformRadioGroup'}
          onChange={(selected, e: ChangeEvent<HTMLInputElement> | undefined) => {
            handleInputChange(selected, e)
          }}
        >
          <RadioGroup.Label visuallyHidden>Platform</RadioGroup.Label>
          {availableOptions.map(option => (
            <FormControl key={option.id}>
              <Radio
                value={option.id}
                checked={option === editorValue}
                data-testid={`platform-option-radio-${option.id}`}
              />
              <FormControl.Label sx={{fontWeight: 'normal'}} data-testid={`platform-option-label-${option.id}`}>
                <PlatformIcon osType={option.osType} className="mr-2 color-fg-muted" />
                {option.displayName}
              </FormControl.Label>
            </FormControl>
          ))}
        </RadioGroup>
      </Box>
      <Box sx={{borderTopColor: 'border.default', borderTopStyle: 'solid', borderTopWidth: 1}}>
        <Button sx={{m: 3, mb: 0}} onClick={handleSave} data-testid="platform-save-button">
          Save
        </Button>
      </Box>
    </>
  )
}
