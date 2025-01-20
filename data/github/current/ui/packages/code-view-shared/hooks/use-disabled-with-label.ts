import {useState} from 'react'

export function useDisabledWithLabel(label: string, disabledLabel: string, action: () => Promise<unknown>) {
  const [disabled, setDisabled] = useState(false)

  return {
    disabled,
    label: disabled ? disabledLabel : label,
    action: async () => {
      setDisabled(true)
      await action()
      setDisabled(false)
    },
  }
}
