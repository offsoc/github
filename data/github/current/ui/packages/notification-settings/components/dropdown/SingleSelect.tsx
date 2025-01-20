import type {FC} from 'react'
import type React from 'react'
import {useCallback, useState} from 'react'
import {ActionMenu, ActionList, type ActionMenuProps} from '@primer/react'

type Props = Partial<ActionMenuProps> & {
  options: string[]
  defaultOption: string
  open?: boolean /// Whether the dropdown starts open
  disabled?: boolean /// Whether the dropdown is disabled
  onChange?: (option: string) => void /// Callback when selection is changed
  optionOverride?: (option: string) => React.ReactNode /// Custom option rendering override
}

const SingleSelect: FC<Props> = ({options, defaultOption, onChange, optionOverride, disabled, open, ...rest}) => {
  const [selectedOption, setSelected] = useState<number>(options.indexOf(defaultOption))

  const onSelectOption = useCallback(
    (idx: number) => {
      setSelected(idx)
      onChange && onChange(options[idx]!)
    },
    [options, onChange, setSelected],
  )

  const optionList = options.map((option, index) => (
    <ActionList.Item
      key={index}
      selected={selectedOption === index}
      onSelect={() => {
        onSelectOption(index)
      }}
    >
      {optionOverride ? optionOverride(option) : option}
    </ActionList.Item>
  ))

  return (
    <ActionMenu open={open} {...rest}>
      <ActionMenu.Button size={'small'} disabled={disabled}>
        {options[selectedOption] ?? defaultOption}
      </ActionMenu.Button>
      <ActionMenu.Overlay>
        <>{optionList.length > 0 && <ActionList selectionVariant="single">{optionList}</ActionList>}</>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

export default SingleSelect
