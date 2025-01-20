import {Box, Button, Link, Text, TabNav, RadioGroup, FormControl, Radio} from '@primer/react'
import {useEffect, useState} from 'react'
import type {FieldProgressionFieldEditComponentProps} from './FieldProgressionField'
import type {MachineSpec} from '../../../types/machine-spec'
import {ImageSource, type Image} from '../../../types/image'
import type {Platform} from '../../../types/platform'

const tabs = [
  {name: 'General', specType: 'basic'} as const,
  {name: 'GPU-powered', specType: 'gpu_optimized'} as const,
] as const satisfies ReadonlyArray<{specType: MachineSpec['type']; name: string}>

type Tab = (typeof tabs)[number]

export default function MachineSpecSelect({
  value,
  setValue,
  onSave,
  options,
  runnerImage,
  platform,
  onSelect,
  isImageGenerationEnabled,
}: FieldProgressionFieldEditComponentProps<MachineSpec> & {
  options: MachineSpec[]
  platform: Platform | null
  runnerImage: Image | null
  onSelect: () => void
  isImageGenerationEnabled: boolean
}) {
  const [selectedSpec, setSelectedSpec] = useState<MachineSpec | null>(value)
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null)

  // determine which specs to show for this runner image, which spec types to show as tabs (e.g. basic, gpu type specs),
  // and which tab to make active (defaults to the first tab in case the selected tab is not available for this runner image)
  const filteredSpecs = filterSpecs({machineSpecs: options, runnerImage, platform, isImageGenerationEnabled})
  const filteredTabs = tabs.filter(tab => filteredSpecs.some(spec => spec.type === tab.specType))
  const activeTab =
    filteredTabs.find(tab => tab.specType === selectedTab?.specType) ??
    filteredTabs.find(tab => tab.specType === selectedSpec?.type) ??
    filteredTabs[0]
  const activeTabSpecs = filteredSpecs.filter(spec => spec.type === activeTab?.specType)

  const handleRadioSelect = (id: string | null) => {
    const matchingSpec = activeTabSpecs.find(spec => spec.id === id) ?? null
    setSelectedSpec(matchingSpec)
    onSelect()
  }

  const handleSave = () => {
    setValue(selectedSpec)
    onSave?.()

    // treat clicking save as a select event, in case a radio option was selected,
    // but the user forgot to click save
    onSelect()
  }

  useEffect(() => {
    // if there is no selected spec yet, preselect first spec on the tab
    if (!selectedSpec && activeTabSpecs.length > 0) {
      setSelectedSpec(activeTabSpecs[0] ?? null)
    }
  }, [activeTabSpecs, selectedSpec])

  return (
    <div data-testid="runner-machine-spec-select">
      {filteredTabs.length > 1 && (
        <TabNav
          sx={{
            paddingTop: 2,
            paddingX: '8px',
            '> nav': {
              marginX: '-8px',
              paddingX: '8px',
            },
          }}
          data-testid="runner-machine-spec-tabs"
          aria-label="Size"
        >
          {filteredTabs.map(tab => (
            <TabNav.Link
              data-testid={`runner-machine-spec-tab-${tab.specType}`}
              sx={{
                cursor: tab === activeTab ? 'default' : 'pointer',
              }}
              key={tab.name}
              selected={activeTab === tab}
              onClick={() => setSelectedTab(tab)}
              aria-controls="runner-machine-spec-tabs"
              as={Button}
            >
              {tab.name}
            </TabNav.Link>
          ))}
        </TabNav>
      )}

      <RadioGroup
        name="runner-machine-spec-radio-group"
        sx={{padding: 3, display: 'flex', flexDirection: 'column', gap: 2}}
        onChange={handleRadioSelect}
      >
        <RadioGroup.Label visuallyHidden>Size</RadioGroup.Label>
        {activeTabSpecs
          .map(spec => ({...spec, displayText: machineSpecDisplayText(spec)}))
          .map(spec => (
            <FormControl key={spec.id} sx={{paddingBottom: 2}}>
              <Radio
                checked={selectedSpec?.id === spec.id}
                value={spec.id}
                data-testid={`runner-machine-spec-radio-${spec.id}`}
                aria-labelledby="size"
              />
              <FormControl.Label>
                <Text sx={{display: 'block'}} data-testid={`runner-machine-spec-radio-text-primary-${spec.id}`}>
                  {spec.displayText.radioButtonPrimary}
                </Text>
                <Text
                  className="text-small text-normal"
                  sx={{color: 'fg.subtle', display: 'block'}}
                  data-testid={`runner-machine-spec-radio-text-secondary-${spec.id}`}
                >
                  {spec.displayText.radioButtonSecondary}
                </Text>
                {spec.documentationUrl && (
                  <Link
                    className="text-small text-normal"
                    href={spec.documentationUrl}
                    data-testid={`runner-machine-spec-radio-documentation-link-${spec.id}`}
                  >
                    {spec.id}
                  </Link>
                )}
              </FormControl.Label>
            </FormControl>
          ))}
      </RadioGroup>

      <Box
        sx={{
          borderTopColor: 'border.default',
          borderTopStyle: 'solid',
          borderTopWidth: 1,
          padding: 3,
          paddingBottom: 0,
          width: '100%',
        }}
      >
        <Button data-testid="runner-machine-spec-save-button" onClick={handleSave} disabled={!selectedSpec}>
          Save
        </Button>
      </Box>
    </div>
  )
}

export function machineSpecDisplayText(spec: MachineSpec) {
  if (spec.type === 'gpu_optimized' && spec.gpu) {
    return {
      radioButtonPrimary: `${spec.gpu?.count} x ${spec.gpu?.name} · ${spec.gpu?.memoryGb} GB VRAM`,
      radioButtonSecondary: `${spec.cpuCores}-core · ${spec.memoryGb} GB RAM · ${spec.storageGb} GB SSD`,
      closedBoxSummary: `GPU-powered, ${spec.gpu?.count} x ${spec.gpu?.name} · ${spec.cpuCores}-core
         · ${spec.gpu?.memoryGb} GB VRAM · ${spec.memoryGb} GB RAM · ${spec.storageGb} GB SSD`,
    } as const
  }

  return {
    radioButtonPrimary: `${spec.cpuCores}-core`,
    radioButtonSecondary: `${spec.memoryGb} GB RAM · ${spec.storageGb} GB SSD`,
    closedBoxSummary: `${spec.cpuCores}-core · ${spec.memoryGb} GB RAM · ${spec.storageGb} GB SSD`,
  } as const
}

function filterSpecs(input: {
  machineSpecs: MachineSpec[]
  runnerImage: Image | null
  platform: Platform | null
  isImageGenerationEnabled: boolean
}) {
  const isImageRestrictedForGpu =
    input.runnerImage?.source === ImageSource.Curated && input.runnerImage?.platform !== 'custom'

  return (
    input.machineSpecs
      .map(spec => ({
        ...spec,
        // If image generation is enabled, we need to truncate the machine spec storage size to 1024GB.
        // This ensures that the displayed value and validation matches the backend logic.
        storageGb: input.isImageGenerationEnabled ? Math.min(spec.storageGb, 1024) : spec.storageGb,
      }))
      // only include specs that can satisfy the min storage requirement for the selected image
      .filter(spec => input.runnerImage === null || spec.storageGb >= input.runnerImage.sizeGb)
      // Curated images don't play well with GPU SKUs, so we hide GPU specs if the selected image is curated
      .filter(spec => !(isImageRestrictedForGpu && spec.type === 'gpu_optimized'))
      // x64 platform supports only x64 specs, and arm64 platform supports only arm64 specs
      .filter(spec => spec.architecture === input.platform?.architecture)
  )
}
