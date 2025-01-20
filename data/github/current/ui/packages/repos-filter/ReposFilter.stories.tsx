import type {Meta} from '@storybook/react'
import {useState} from 'react'

import {type PropertyDefinition, ReposFilter} from './ReposFilter'

const meta: Meta = {
  title: 'ReposComponents/ReposFilter',
  decorators: [(Story, {args}) => <Story {...args} />],
}

export default meta

const customProperties: PropertyDefinition[] = [
  {
    propertyName: 'cost-center',
    valueType: 'single_select',
    allowedValues: ['101', '102', '103'],
  },
  {
    propertyName: 'environment',
    valueType: 'single_select',
    allowedValues: ['testing', 'staging', 'production'],
  },
  {
    propertyName: 'first-responder',
    valueType: 'string',
  },
  {
    propertyName: 'is-released',
    valueType: 'true_false',
  },
]

export const Default = () => {
  const [value, setValue] = useState('')

  return (
    <ReposFilter id="sb-id" definitions={customProperties} filterValue={value} label="Repos!!!" onChange={setValue} />
  )
}
