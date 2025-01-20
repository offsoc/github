import {ControlGroup} from '@github-ui/control-group'
import {ActionList, ActionMenu} from '@primer/react'
import {useState} from 'react'

interface ControlGroupDropDownProps {
  title: string
  description?: string
  testId?: string
  options: ControlGroupDropDownOption[]
  onSelect: (option: ControlGroupDropDownOption) => void
}

export type ControlGroupDropDownOption = {
  id: string
  name: string
  selected: boolean
}

const ControlGroupDropDown: React.FC<ControlGroupDropDownProps> = ({
  title,
  description,
  testId = 'control-group-drop-down',
  options: initialOptions,
  onSelect,
}) => {
  const [options, setOptions] = useState<ControlGroupDropDownOption[]>(initialOptions)

  const buttonTestId = `${testId}-button`

  const handleSelect = (option: ControlGroupDropDownOption) => {
    setOptions((prevOptions: ControlGroupDropDownOption[]) =>
      // Set the selected option as selected:
      prevOptions.map(prevOption => ({
        ...prevOption,
        selected: option.id === prevOption.id,
      })),
    )

    // Pass selected option to parent node:
    onSelect(option)
  }

  return (
    <ControlGroup.Item>
      <ControlGroup.Title>{title}</ControlGroup.Title>
      {description && <ControlGroup.Description>{description}</ControlGroup.Description>}
      <ControlGroup.Custom>
        <ActionMenu>
          <ActionMenu.Button data-testid={buttonTestId}>
            {options.find(option => option.selected)?.name}
          </ActionMenu.Button>

          <ActionMenu.Overlay>
            <ActionList selectionVariant="single">
              {options.map((option: ControlGroupDropDownOption) => (
                <ActionList.Item
                  key={option.id}
                  selected={option.selected}
                  onSelect={() => handleSelect(option)}
                  data-testid={`${testId}-item-${option.id}`}
                >
                  {option.name}
                </ActionList.Item>
              ))}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </ControlGroup.Custom>
    </ControlGroup.Item>
  )
}

export default ControlGroupDropDown
