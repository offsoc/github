import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {SearchDropdown} from '../SearchDropdown'

Object.defineProperty(window.Element.prototype, 'scrollTo', {
  writable: true,
  value: jest.fn(),
})

const sampleProps: React.ComponentProps<typeof SearchDropdown> = {
  title: 'TestLabel',
  inputLabel: 'label',
  items: [
    {text: 'Foo', id: 'foo'},
    {text: 'Bar', id: 'bar'},
  ],
  selectedItem: {text: 'Foo', id: 'foo'},
  onSelect: jest.fn(),
}

describe('SearchDropdown', () => {
  test('accessible name includes label and selected item', () => {
    render(<SearchDropdown {...sampleProps} />)

    expect(screen.getByRole('button', {name: 'TestLabel: Foo'})).toBeInTheDocument()
  })

  test('accessible name is the label: None when no initial selection', () => {
    render(<SearchDropdown {...sampleProps} selectedItem={undefined} />)

    expect(screen.getByRole('button', {name: 'TestLabel: None'})).toBeInTheDocument()
  })

  test('filters items', async () => {
    const {user} = render(<SearchDropdown {...sampleProps} selectedItem={undefined} />)

    await user.click(screen.getByRole('button'))
    await screen.findByRole('dialog')

    expect(screen.getByText('Foo')).toBeInTheDocument()
    expect(screen.getByText('Bar')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox'), 'bar')

    expect(screen.queryByText('Foo')).not.toBeInTheDocument()
    expect(screen.getByText('Bar')).toBeInTheDocument()
  })
})
