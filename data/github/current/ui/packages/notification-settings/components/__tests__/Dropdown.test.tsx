import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

// Component(s) under test
import SingleSelect from '../dropdown/SingleSelect'
import MultipleSelect from '../dropdown/MultipleSelect'

describe('SingleSelect Dropdown', () => {
  test('renders the dropdown', () => {
    render(<SingleSelect options={[]} defaultOption={''} />)

    expect(screen.getByRole('button')).toBeVisible()
  })

  test('renders the options', async () => {
    const {user} = render(<SingleSelect options={['first', 'second']} defaultOption={''} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('first')).toBeVisible()
    expect(screen.getByText('second')).toBeVisible()
  })

  test('renders the default option', () => {
    render(<SingleSelect options={['first', 'second']} defaultOption={'second'} />)

    expect(screen.getByText('second')).toBeVisible()
  })

  test('selects the second option', async () => {
    const {user} = render(<SingleSelect options={['first', 'second']} defaultOption={'first'} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('second'))

    expect(screen.getByText('second')).toBeVisible()
    expect(screen.queryByText('first')).toBeNull()
  })

  test('allows to select a single option', async () => {
    const {user} = render(<SingleSelect options={['first', 'second']} defaultOption={''} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('second'))
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('first'))

    expect(screen.getByText('first')).toBeVisible()
    expect(screen.queryByText('second')).toBeNull()
  })

  test('selecting an option triggers callback', async () => {
    // Keep track of received calls
    const calls: string[] = []
    const callback: {(payload: string): void} = opt => calls.push(opt)

    const {user} = render(<SingleSelect options={['first', 'second']} defaultOption={''} onChange={callback} />)

    // Click open the selector and choose 'second'
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('second'))

    // Expect 'second' to be in callback
    expect(calls.length).toBeGreaterThan(0)
    expect(calls[0]).toBe('second')

    // Repeat above but select 'first' and close selector
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('first'))
    expect(calls.length).toBeGreaterThan(1)
    expect(calls[1]).toBe('first')
  })

  test('renders not disabled by default', async () => {
    const {user} = render(<SingleSelect options={['first', 'second']} defaultOption={'default'} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('second')).toBeVisible()
  })

  test('can be disabled', async () => {
    const {user} = render(<SingleSelect options={['first', 'second']} defaultOption={'default'} disabled={true} />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    // Clicking the button should not open the dropdown
    await user.click(button)
    expect(screen.queryByText('second')).not.toBeInTheDocument()
  })
})

describe('MultipleSelect Dropdown', () => {
  const options = {first: 'first', second: 'second'}

  test('renders the dropdown', () => {
    render(
      <MultipleSelect
        title="Make a selection"
        listOptions={{}}
        selectedListOptions={[]}
        onSaveCallback={() => void 0}
      />,
    )

    expect(screen.getByRole('button')).toBeVisible()
  })

  test('renders the options', async () => {
    const {user} = render(
      <MultipleSelect
        title="Make a selection"
        listOptions={options}
        selectedListOptions={[]}
        onSaveCallback={() => void 0}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('first')).toBeVisible()
    expect(screen.getByText('second')).toBeVisible()
  })

  test('renders the default option', () => {
    render(
      <MultipleSelect
        title="Make a selection"
        listOptions={options}
        defaultMenuButtonOption={'default option'}
        selectedListOptions={[]}
        onSaveCallback={() => void 0}
      />,
    )

    expect(screen.getByText('default option')).toBeVisible()
  })

  test('renders the prefix', () => {
    const {container} = render(
      <MultipleSelect
        title="Make a selection"
        listOptions={options}
        defaultMenuButtonOption={'default option'}
        menuButtonPrefix={'prefix: '}
        selectedListOptions={['second']}
        onSaveCallback={() => void 0}
      />,
    )

    expect(container).toHaveTextContent('prefix: second')
  })

  test('selecting a list option triggers correct callback', async () => {
    // Keep track of received calls
    const calls: string[] = []
    const callback: {(options: string[], variants: string[]): void} = opts => calls.push(...opts)

    const {user} = render(
      <MultipleSelect
        title="Make a selection"
        listOptions={options}
        selectedListOptions={[]}
        onSaveCallback={callback}
      />,
    )

    // Click open the selector and choose 'second'
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('second'))

    // Click the save button for setting
    await user.click(screen.getByText('Save'))

    // Expect 'second' to be in callback
    expect(calls.length).toBeGreaterThan(0)
    expect(calls[0]).toBe('second')

    // Unselect 'second', select 'first' and save
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('second'))
    await user.click(screen.getByText('first'))
    await user.click(screen.getByText('Save'))

    expect(calls.length).toBeGreaterThan(1)
    expect(calls[1]).toBe('first')
  })

  test('does not render the variants options by default', async () => {
    const {user} = render(
      <MultipleSelect
        title="Make a selection"
        listOptions={options}
        listVariants={{first: 'variant 1', second: 'variant 2'}}
        defaultMenuButtonOption={'default option'}
        selectedListOptions={[]}
        onSaveCallback={() => void 0}
      />,
    )

    await user.click(screen.getByRole('button'))

    expect(screen.queryByText('variant 1')).toBeNull()
    expect(screen.queryByText('variant 2')).toBeNull()
  })

  test('selects a variant', async () => {
    const {user} = render(
      <MultipleSelect
        title="Make a selection"
        listOptions={options}
        listVariants={{first: 'variant 1', second: 'variant 2'}}
        selectedListVariants={['first']}
        defaultMenuButtonOption={'default option'}
        selectedListOptions={['second']}
        onSaveCallback={() => void 0}
      />,
    )

    await user.click(screen.getByRole('button'))

    expect(screen.getAllByRole('option', {name: 'variant 1'})[0]).toHaveAttribute('aria-selected', 'true')
    expect(screen.getAllByRole('option', {name: 'variant 2'})[0]).toHaveAttribute('aria-selected', 'false')
  })

  test('selecting an variant option triggers correct callback', async () => {
    // Keep track of received calls
    const calls: string[] = []
    const callback: {(options: string[], variants: string[]): void} = (_, vars) => calls.push(...vars)

    const {user} = render(
      <MultipleSelect
        title="Make a selection"
        listOptions={options}
        listVariants={{first: 'variant 1', second: 'variant 2'}}
        defaultMenuButtonOption={'default option'}
        selectedListOptions={['second']}
        onSaveCallback={callback}
      />,
    )

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('variant 2'))

    // Click the save button for setting
    await user.click(screen.getByText('Save'))

    // Expect 'second' to be in callback
    expect(calls.length).toBeGreaterThan(0)
    expect(calls[0]).toBe('second')

    // Repeat above but only select 'first' and save selector
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('variant 2'))
    await user.click(screen.getByText('variant 1'))
    await user.click(screen.getByText('Save'))

    expect(calls.length).toBeGreaterThan(1)
    expect(calls[1]).toBe('first')
  })

  test('renders the variant in the dropdown)', async () => {
    const {user} = render(
      <MultipleSelect
        title="Make a selection"
        listOptions={options}
        listVariants={{first: 'variant 1', second: 'variant 2'}}
        selectedListOptions={['second']}
        selectedListVariants={['first']}
        defaultMenuButtonOption={'default option'}
        onSaveCallback={() => void 0}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('second. (variant 1)')).toBeVisible()
  })

  test('does not show variants when no list options are selected', async () => {
    const {user} = render(
      <MultipleSelect
        title="Make a selection"
        listOptions={options}
        listVariants={{first: 'variant 1', second: 'variant 2'}}
        selectedListOptions={[]}
        onSaveCallback={() => void 0}
        defaultMenuButtonOption={'default option'}
      />,
    )

    await user.click(screen.getByRole('button'))

    expect(screen.queryByRole('option', {name: 'variant 1'})).toBeNull()
    expect(screen.queryByRole('option', {name: 'variant 2'})).toBeNull()
  })

  test('allows to select multiple options', async () => {
    const {user} = render(
      <MultipleSelect
        title="Make a selection"
        listOptions={options}
        selectedListOptions={['first', 'second']}
        defaultMenuButtonOption={'default option'}
        onSaveCallback={() => void 0}
      />,
    )

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('first, second')).toBeVisible()
    expect(screen.queryByText('default option')).toBeNull()
  })
})
