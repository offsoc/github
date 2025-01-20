import {act, screen, within} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import GroupMenu, {type GroupKey} from '../GroupMenu'

describe('GroupMenu', () => {
  it('should render', async () => {
    const props = {
      groupKey: 'status' as GroupKey,
      onGroupKeyChanged: (): void => {},
    }
    render(<GroupMenu {...props} />)
    expect(within(screen.getByTestId('group-menu-button')).getByText('State')).toBeInTheDocument()
  })

  it('should invoke callback when selecting a value', () => {
    const onGroupKeyChanged = jest.fn()
    const props = {
      groupKey: 'status' as GroupKey,
      onGroupKeyChanged,
    }
    render(<GroupMenu {...props} />)

    const button = screen.getByTestId('group-menu-button')
    expect(button).toBeInTheDocument()

    act(() => button.click())

    const dropdownItems = within(screen.getByRole('menu')).getAllByRole('menuitemradio')

    const severity = dropdownItems[1]
    expect(severity).toBeInTheDocument()
    expect(severity).toHaveTextContent('Severity')

    act(() => severity?.click())
    expect(onGroupKeyChanged).toHaveBeenCalledTimes(1)
  })
})
