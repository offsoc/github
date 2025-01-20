import type {ArgTypes} from '@storybook/react'

export const defaultParameters = {controls: {expanded: true, sort: 'alpha'}}
export const defaultArgTypes: ArgTypes = {
  radioGroupName: {
    if: {arg: 'selectType', eq: 'single'},
    control: {type: 'text'},
  },
  inactiveText: {
    control: {type: 'boolean'},
    mapping: {
      true: 'Maximum number of items reached. Inactive text',
      false: '',
    },
  },
  _PrivateItemWrapper: {table: {disable: true}},
  children: {table: {disable: true}},
}
