import {ActionMenu, ActionList} from '@primer/react'
import {useState} from 'react'

const ActionMenuItem = () => {
  const options = [
    {
      name: 'Fast forward',
    },
    {
      name: 'Recursive',
    },
    {
      name: 'Ours',
    },
    {
      name: 'Octopus',
    },
    {
      name: 'Resolve',
    },
    {
      name: 'Subtree',
    },
  ]
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedType = options[selectedIndex]

  return (
    <ActionMenu>
      <ActionMenu.Button>{selectedType?.name}</ActionMenu.Button>
      <ActionMenu.Overlay width="auto">
        <ActionList selectionVariant="single">
          {options.map((option, index) => (
            <ActionList.Item key={index} selected={index === selectedIndex} onSelect={() => setSelectedIndex(index)}>
              {option.name}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

export default ActionMenuItem
