import {useState} from 'react'
import {Checkbox, FormControl, type CheckboxProps} from '@primer/react'

type UncheckedValueCheckboxProps = CheckboxProps & {
  uncheckedValue?: string
  label?: string
  caption?: string
}

export default function UncheckedValueCheckbox(props: UncheckedValueCheckboxProps) {
  const {checked, defaultChecked, name, label, onChange, value = '1', uncheckedValue = '0', caption} = props
  const [localVal, setLocalVal] = useState(checked || defaultChecked ? value : uncheckedValue)

  return (
    <>
      <input type="hidden" name={name} value={localVal} data-testid="realInput" />
      <FormControl>
        <Checkbox
          name=""
          checked={checked || (localVal === value ? true : false)}
          onChange={e => {
            if (checked) {
              setLocalVal(value)
            } else {
              setLocalVal(localVal === value ? uncheckedValue : value)
            }
            onChange && onChange(e)
          }}
        />
        <FormControl.Label>{label}</FormControl.Label>
        <FormControl.Caption>{caption}</FormControl.Caption>
      </FormControl>
    </>
  )
}
