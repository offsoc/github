import type {ColorName} from '@github-ui/use-named-color'
import {screen} from '@testing-library/react'
import {useState} from 'react'
import {render} from '@github-ui/react-core/test-utils'
import {ColorPicker} from '../ColorPicker'

const UncontrolledColorPicker = ({label}: {label: string}) => {
  const [value, setValue] = useState<ColorName>('RED')
  return <ColorPicker value={value} onChange={setValue} label={label} />
}

const renderColorPicker = () => {
  const view = render(<UncontrolledColorPicker label="Color Picker" />)

  const red = screen.getByRole('radio', {name: 'Red'})
  const green = screen.getByRole('radio', {name: 'Green'})

  return {rendered: view, red, green}
}

describe('ColorPicker', () => {
  it('renders the component with semantic label', () => {
    renderColorPicker()
    expect(screen.getByRole('group', {name: 'Color Picker'})).toBeInTheDocument()
  })

  it('updates when a value is clicked', async () => {
    const {
      red,
      green,
      rendered: {user},
    } = renderColorPicker()

    expect(red).toBeChecked()

    await user.click(green)

    expect(red).not.toBeChecked()
    expect(green).toBeChecked()
  })
})
