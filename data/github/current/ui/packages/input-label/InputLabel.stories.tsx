import {TextInput} from '@primer/react'
import type {Meta} from '@storybook/react'
import {useId} from 'react'
import InputLabel from './InputLabel'

const meta = {
  title: 'InputLabel',
} satisfies Meta<typeof InputLabel>

export default meta

const InputLabelWithInput = () => {
  const id = useId()
  return (
    <>
      <InputLabel htmlFor={id} as="label">
        Input label
      </InputLabel>
      <TextInput id={id} />
    </>
  )
}

export const InputLabelExample = {
  render: InputLabelWithInput,
}
