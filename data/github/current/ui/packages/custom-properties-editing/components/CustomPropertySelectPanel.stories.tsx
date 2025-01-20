import type {PropertyDefinition, PropertyValue} from '@github-ui/custom-properties-types'
import {Box} from '@primer/react'
import type {Meta} from '@storybook/react'
import {useState} from 'react'

import {CustomPropertyMultiSelectPanel} from '..'
import {
  multiSelectDefinition,
  requiredMultiSelectDefinition,
  requiredSingleSelectDefinition,
  singleSelectDefinition,
} from './__tests__/test-helpers'
import {CustomPropertySingleSelectPanel} from './CustomPropertySelectPanel'

const meta: Meta = {
  title: 'Apps/Custom Properties/Components/CustomPropertySelectPanel',
  component: CustomPropertyMultiSelectPanel,
}

export default meta

export const MultiSelectPanel = () => {
  const [values, setValue] = useState<PropertyValue>(['ios', 'web'])

  return (
    <CustomPropertyMultiSelectPanel
      propertyDefinition={multiSelectDefinition}
      mixed={false}
      propertyValue={values as string[]}
      onChange={setValue}
    />
  )
}

const allowedValues = [
  'very_long_option_that_is_hard_to_fit',
  'another_very_long_option_that_is_hard_to_fit',
  'yet_one_more_very_long_option_that_is_hard_to_fit',
]
export const MultiSelectPanelTruncation = () => {
  const definition: PropertyDefinition = {
    ...multiSelectDefinition,
    allowedValues,
  }

  const requiredDefinition: PropertyDefinition = {
    ...requiredMultiSelectDefinition,
    defaultValue: allowedValues.slice(0, 1),
    allowedValues,
  }

  const props = {
    propertyDefinition: definition,
    mixed: false,
    onChange: () => undefined,
  }
  const requiredProps = {
    ...props,
    propertyDefinition: requiredDefinition,
    propertyValue: [],
  }

  return (
    <Box sx={{width: 180, display: 'flex', flexDirection: 'column', gap: 2}}>
      <span>Nothing selected</span>
      <CustomPropertyMultiSelectPanel {...props} propertyValue={[]} />

      <span>1 selected</span>
      <CustomPropertyMultiSelectPanel {...props} propertyValue={allowedValues.slice(0, 1)} />

      <span>Single default value</span>
      <CustomPropertyMultiSelectPanel {...requiredProps} />

      <span>Multiple selected</span>
      <CustomPropertyMultiSelectPanel {...props} propertyValue={allowedValues.slice(0, 2)} />

      <span>Multiple default values</span>
      <CustomPropertyMultiSelectPanel
        {...requiredProps}
        propertyDefinition={{...requiredDefinition, defaultValue: allowedValues.slice(0, 2)}}
      />
    </Box>
  )
}

export const SingleSelectPanelTruncation = () => {
  const definition: PropertyDefinition = {
    ...singleSelectDefinition,
    allowedValues,
  }

  const requiredDefinition: PropertyDefinition = {
    ...requiredSingleSelectDefinition,
    defaultValue: allowedValues[0]!,
    allowedValues,
  }

  const props = {
    propertyDefinition: definition,
    mixed: false,
    onChange: () => undefined,
  }
  const requiredProps = {
    ...props,
    propertyDefinition: requiredDefinition,
    propertyValue: '',
  }

  return (
    <Box sx={{width: 180, display: 'flex', flexDirection: 'column', gap: 2}}>
      <span>Nothing selected</span>
      <CustomPropertySingleSelectPanel {...props} propertyValue="" />

      <span>Selected</span>
      <CustomPropertySingleSelectPanel {...props} propertyValue={allowedValues[0]!} />

      <span>Default value</span>
      <CustomPropertySingleSelectPanel {...requiredProps} />
    </Box>
  )
}
