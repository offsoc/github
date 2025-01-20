import type {Meta, StoryObj} from '@storybook/react'
import {RadioActionList, type RadioActionListProps} from './RadioActionList'
import {UNSET_ID} from '@github-ui/item-picker/IssueTypePicker'
import {useState} from 'react'

const meta = {
  title: 'RadioActionList',
  component: RadioActionList,
} satisfies Meta<typeof RadioActionList>

export default meta
type Story = StoryObj<typeof RadioActionList>

const StoryComponent = (args: RadioActionListProps) => {
  const [selectedId, setSelectedId] = useState(UNSET_ID)
  const onChange = (id?: string) => {
    setSelectedId(id ?? UNSET_ID)
  }
  return <RadioActionList {...args} selectedId={selectedId} onChange={onChange} />
}

export const RabioActionListExample: Story = {
  args: {
    items: [
      {
        id: UNSET_ID,
        name: 'None',
      },
      {
        id: '1',
        name: 'Item 1',
        description: 'Description 1',
      },
      {
        id: '2',
        name: 'Item 2',
        description: 'Description 2',
      },
      {
        id: '3',
        name: 'Item 3',
        description: 'Description 3',
      },
    ],
    name: 'listTest',
    groupLabel: 'name',
  },
  render: args => {
    return <StoryComponent {...args} />
  },
}
