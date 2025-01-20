import type {PropertyValue} from '@github-ui/custom-properties-types'
import type {Meta} from '@storybook/react'
import {useState} from 'react'

import {CustomPropertyBooleanSelect} from './CustomPropertyBooleanSelect'

const meta: Meta = {
  title: 'Apps/Custom Properties/Components/CustomPropertyBooleanSelect',
  component: CustomPropertyBooleanSelect,
}

export default meta

export const OptionalBooleanSelect = () => {
  const [value, setValue] = useState<PropertyValue>('')

  return (
    <CustomPropertyBooleanSelect
      defaultValue={null}
      mixed={false}
      propertyValue={value as string}
      onChange={setValue}
      orgName="github"
    />
  )
}

export const RequiredBooleanSelect = () => {
  const [value, setValue] = useState<PropertyValue>('')

  return (
    <CustomPropertyBooleanSelect
      defaultValue="true"
      mixed={false}
      propertyValue={value as string}
      onChange={setValue}
      orgName="github"
    />
  )
}

export const OptionalBooleanMixedSelect = () => {
  const [value, setValue] = useState<PropertyValue>('')
  const [mixed, setMixed] = useState(true)

  return (
    <CustomPropertyBooleanSelect
      defaultValue={null}
      mixed={mixed}
      propertyValue={value as string}
      onChange={newValue => {
        setValue(newValue)
        setMixed(false)
      }}
      orgName="github"
    />
  )
}

export const RequiredBooleanMixedSelect = () => {
  const [value, setValue] = useState<PropertyValue>('')
  const [mixed, setMixed] = useState(true)

  return (
    <CustomPropertyBooleanSelect
      defaultValue="true"
      mixed={mixed}
      propertyValue={value as string}
      onChange={newValue => {
        setValue(newValue)
        setMixed(false)
      }}
      orgName="github"
    />
  )
}
