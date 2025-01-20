import type {PropertyDefinition} from '@github-ui/custom-properties-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {Box} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import type {Meta} from '@storybook/react'
import type {ComponentProps} from 'react'

import {useEditCustomProperties} from '../hooks/use-edit-custom-properties'
import {sampleDefinitions} from './__tests__/test-helpers'
import {CustomPropertyValuesTable} from './CustomPropertyValuesTable'

interface StoryArgs {
  propertiesOverlayEditorEnabled: boolean
}

const meta: Meta<StoryArgs> = {
  title: 'Apps/Custom Properties/Components/CustomPropertyValuesTable',
  decorators: [
    (Story, {args}) => (
      <Wrapper>
        <Story {...args} />
      </Wrapper>
    ),
  ],
  args: {
    propertiesOverlayEditorEnabled: true,
  },
  argTypes: {
    propertiesOverlayEditorEnabled: {control: {type: 'boolean'}},
  },
}

export default meta

const sampleProps: ComponentProps<typeof CustomPropertyValuesTable> = {
  definitions: [
    ...sampleDefinitions,
    {
      propertyName: 'color',
      description: 'Pick a color',
      valueType: 'string',
      required: false,
      defaultValue: null,
      allowedValues: null,
      valuesEditableBy: 'org_actors',
      regex: null,
    },
  ],
  editableDefinitions: sampleDefinitions.slice(0, 5),
  propertyValuesMap: {
    ['cost_center_id']: {propertyName: 'cost_center_id', value: 'eur', changed: true, mixed: false},
    color: {propertyName: 'color', value: 'red', changed: true, mixed: false},
  },
  setPropertyValue: () => {},
  revertPropertyValue: () => {},
  showLockMessages: true,
  orgName: 'properties-game',
}

export const Default = (argProps: StoryArgs) => {
  const editProps = useEditCustomProperties(
    [
      {
        ['cost_center_id']: 'eur',
        color: 'red',
      },
    ],
    sampleProps.definitions,
  )

  return <CustomPropertyValuesTable {...sampleProps} {...editProps} {...argProps} />
}

export const ReadOnly = (argProps: StoryArgs) => {
  return <CustomPropertyValuesTable {...sampleProps} {...argProps} editableDefinitions={[]} />
}

export const ReadOnlyTruncation = (argProps: StoryArgs) => {
  return (
    <CustomPropertyValuesTable
      {...sampleProps}
      {...argProps}
      definitions={[
        {
          propertyName: 'text_property_very_long_name_that_is_hard_to_fit',
          valueType: 'string',
        } as PropertyDefinition,
        {
          propertyName: 'single_select_very_long_name_that_is_hard_to_fit',
          valueType: 'single_select',
        } as PropertyDefinition,
        {
          propertyName: 'multi_select_very_long_name_that_is_hard_to_fit',
          valueType: 'multi_select',
        } as PropertyDefinition,
      ]}
      propertyValuesMap={{
        ['text_property_very_long_name_that_is_hard_to_fit']: {
          changed: false,
          propertyName: 'text_property_very_long_name_that_is_hard_to_fit',
          value: 'yet_one_more_very_long_option_that_is_hard_to_fit',
          mixed: false,
        },
        ['single_select_very_long_name_that_is_hard_to_fit']: {
          changed: false,
          propertyName: 'single_select_very_long_name_that_is_hard_to_fit',
          value: 'yet_one_more_very_long_option_that_is_hard_to_fit',
          mixed: false,
        },
        ['multi_select_very_long_name_that_is_hard_to_fit']: {
          changed: false,
          propertyName: 'multi_select_very_long_name_that_is_hard_to_fit',
          value: [
            'small',
            'medium',
            'large_value',
            'very_long_option_that_is_hard_to_fit',
            'another_very_long_option_that_is_hard_to_fit',
            'yet_one_more_very_long_option_that_is_hard_to_fit',
          ],
          mixed: false,
        },
      }}
      editableDefinitions={[]}
    />
  )
}

export const WithBorders = (argProps: StoryArgs) => {
  return (
    <Box
      sx={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'border.default',
        borderRadius: 2,
      }}
    >
      <CustomPropertyValuesTable {...sampleProps} {...argProps} />
    </Box>
  )
}

export const InsideADialog = () => {
  return (
    <Dialog
      sx={{display: 'flex', flexDirection: 'column'}}
      width="xlarge"
      onClose={() => {}}
      renderBody={() => (
        <Dialog.Body sx={{p: 0}}>
          <CustomPropertyValuesTable {...sampleProps} />
        </Dialog.Body>
      )}
      footerButtons={[
        {content: 'Cancel', onClick: () => {}, sx: {mr: 1}, buttonType: 'default'},
        {content: 'Save changes', type: 'submit', onClick: () => {}, buttonType: 'primary'},
      ]}
    />
  )
}

export const NotShowingLockMessage = (argProps: StoryArgs) => {
  return <CustomPropertyValuesTable {...sampleProps} {...argProps} showLockMessages={false} />
}

export const RequiredPropertiesNotShowingUndo = (argProps: StoryArgs) => {
  const requiredDefinitionProps = {
    ...sampleProps,
    definitions: sampleDefinitions.filter(definition => definition.required),
  }
  return <CustomPropertyValuesTable {...requiredDefinitionProps} {...argProps} showUndo={false} />
}
