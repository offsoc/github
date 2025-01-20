import {Box, Text} from '@primer/react'
import type {Meta} from '@storybook/react'

import {useEditCustomProperties} from '../hooks/use-edit-custom-properties'
import {
  requiredBooleanDefinition,
  requiredLongMultiSelectDefinition,
  requiredLongStringDefinition,
  requiredMultiSelectDefinition,
  requiredSingleSelectDefinition,
  requiredStringDefinition,
} from './__tests__/test-helpers'
import {PropertiesOverlayEditor} from './PropertiesOverlayEditor'

const meta: Meta = {
  title: 'Apps/Custom Properties/Components/PropertiesOverlayEditor',
  component: PropertiesOverlayEditor,
  decorators: [
    Story => (
      <Box sx={{width: 200}}>
        <Story />
      </Box>
    ),
  ],
}

export default meta

const definitions = [
  requiredStringDefinition,
  requiredSingleSelectDefinition,
  requiredBooleanDefinition,
  requiredMultiSelectDefinition,
]
export const Default = () => {
  const {propertyValuesMap, setPropertyValue} = useEditCustomProperties(
    [
      {
        [requiredStringDefinition.propertyName]: 'something',
        [requiredMultiSelectDefinition.propertyName]: ['EU', 'US'],
      },
    ],
    definitions,
  )

  return (
    <>
      {definitions.map(def => {
        const valueField = propertyValuesMap[def.propertyName]

        return (
          <Box key={def.propertyName} sx={{p: 3}}>
            <Text sx={{mb: 2}}>{def.valueType}</Text>
            <PropertiesOverlayEditor
              onApply={v => setPropertyValue(def.propertyName, v)}
              appliedValue={valueField?.value}
              org="github"
              mixed={!!valueField?.mixed}
              propertyDefinition={def}
            />
          </Box>
        )
      })}
    </>
  )
}

const longDefinitions = [requiredLongStringDefinition, requiredLongMultiSelectDefinition]

export const Truncation = () => {
  const {propertyValuesMap, setPropertyValue} = useEditCustomProperties([{}], longDefinitions)

  return (
    <>
      {longDefinitions.map(def => {
        const valueField = propertyValuesMap[def.propertyName]

        return (
          <Box key={def.propertyName} sx={{p: 3}}>
            <Text sx={{mb: 2}}>{def.valueType}</Text>
            <PropertiesOverlayEditor
              onApply={v => setPropertyValue(def.propertyName, v)}
              appliedValue={valueField?.value}
              org="github"
              mixed={!!valueField?.mixed}
              propertyDefinition={def}
            />
          </Box>
        )
      })}
    </>
  )
}

export const Mixed = () => {
  const {propertyValuesMap, setPropertyValue} = useEditCustomProperties(
    [
      {
        [requiredStringDefinition.propertyName]: 'something',
        [requiredSingleSelectDefinition.propertyName]: 'true',
        [requiredBooleanDefinition.propertyName]: 'false',
        [requiredMultiSelectDefinition.propertyName]: ['EU', 'US'],
      },
      {},
    ],
    definitions,
  )

  return (
    <>
      {definitions.map(def => {
        const valueField = propertyValuesMap[def.propertyName]

        return (
          <Box key={def.propertyName} sx={{p: 3}}>
            <Text sx={{mb: 2}}>{def.valueType}</Text>
            <PropertiesOverlayEditor
              onApply={v => setPropertyValue(def.propertyName, v)}
              appliedValue={valueField?.value}
              org="github"
              mixed={!!valueField?.mixed}
              propertyDefinition={def}
            />
          </Box>
        )
      })}
    </>
  )
}
