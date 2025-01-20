import type {PropertyDefinition} from '@github-ui/custom-properties-types'

export const requiredSingleSelectDefinition: PropertyDefinition = {
  propertyName: 'contains_phi',
  description: 'Is this repository used to process Protected Health Data under HIPAA?',
  valueType: 'single_select',
  required: true,
  defaultValue: 'false',
  allowedValues: ['false', 'true'],
  valuesEditableBy: 'org_actors',
  regex: null,
}

export const singleSelectDefinition: PropertyDefinition = {
  propertyName: 'data_sensitivity',
  description:
    'Level of sensitivity of data processed by this repository once deployed. Refer to our data classification policy for details on determining classification levels.',
  valueType: 'single_select',
  required: false,
  defaultValue: null,
  allowedValues: ['high', 'medium', 'low'],
  valuesEditableBy: 'org_actors',
  regex: null,
}

export const requiredStringDefinition: PropertyDefinition = {
  propertyName: 'cost_center_id',
  description: 'The department to which costs may be charged for accounting purposes.',
  valueType: 'string',
  required: true,
  defaultValue: 'us',
  allowedValues: null,
  valuesEditableBy: 'org_actors',
  regex: null,
}

export const stringDefinition: PropertyDefinition = {
  propertyName: 'notes',
  description: 'Enter some notes if you want',
  valueType: 'string',
  required: false,
  defaultValue: null,
  allowedValues: null,
  valuesEditableBy: 'org_actors',
  regex: null,
}

export const requiredLongStringDefinition: PropertyDefinition = {
  propertyName: 'text_property_very_long_name_that_is_hard_to_fit',
  description: null,
  valueType: 'string',
  required: true,
  defaultValue: 'yet_one_more_very_long_option_that_is_hard_to_fit',
  allowedValues: null,
  valuesEditableBy: 'org_actors',
  regex: null,
}

export const optionalBooleanDefinition: PropertyDefinition = {
  propertyName: 'yes_no',
  description: 'maybe?',
  valueType: 'true_false',
  required: false,
  defaultValue: null,
  allowedValues: null,
  valuesEditableBy: 'org_actors',
  regex: null,
}

export const requiredBooleanDefinition: PropertyDefinition = {
  propertyName: 'legacy',
  description: 'Is it a legacy?',
  valueType: 'true_false',
  required: true,
  defaultValue: 'true',
  allowedValues: null,
  valuesEditableBy: 'org_actors',
  regex: null,
}

export const requiredMultiSelectDefinition: PropertyDefinition = {
  propertyName: 'region',
  description: 'Region of operation',
  valueType: 'multi_select',
  required: true,
  defaultValue: ['EU', 'Asia'],
  allowedValues: ['EU', 'US', 'Asia'],
  valuesEditableBy: 'org_actors',
  regex: null,
}

export const requiredLongMultiSelectDefinition: PropertyDefinition = {
  propertyName: 'multi_select_very_long_name_that_is_hard_to_fit',
  description: null,
  valueType: 'multi_select',
  required: true,
  defaultValue: [
    'small',
    'medium',
    'large_value',
    'very_long_option_that_is_hard_to_fit',
    'another_very_long_option_that_is_hard_to_fit',
    'yet_one_more_very_long_option_that_is_hard_to_fit',
  ],
  allowedValues: [
    'small',
    'medium',
    'large_value',
    'very_long_option_that_is_hard_to_fit',
    'another_very_long_option_that_is_hard_to_fit',
    'yet_one_more_very_long_option_that_is_hard_to_fit',
  ],
  valuesEditableBy: 'org_actors',
  regex: null,
}

export const multiSelectDefinition: PropertyDefinition = {
  propertyName: 'platform',
  description: 'Which platforms is this repo intended for? All those that apply',
  valueType: 'multi_select',
  required: false,
  defaultValue: null,
  allowedValues: ['android', 'ios', 'web'],
  valuesEditableBy: 'org_actors',
  regex: null,
}

export const sampleDefinitions: PropertyDefinition[] = [
  requiredSingleSelectDefinition,
  singleSelectDefinition,
  requiredStringDefinition,
  stringDefinition,
  multiSelectDefinition,
]
