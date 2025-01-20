import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'
import {useState} from 'react'

import type {FilterProps} from '../Filter'
import {Filter} from '../Filter'
import {StateFilterProvider, StatusFilterProvider} from '../providers'
import {updateFilterValue} from '../test-utils'
import {SubmitEvent} from '../types'
import {
  appendToFilterAndRenderAsyncSuggestions,
  expectFilterValueToBe,
  expectSuggestionsToMatchSnapshot,
  selectSuggestion,
  setupAsyncErrorHandler,
} from './utils/helpers'

describe('Filter', () => {
  setupAsyncErrorHandler()

  it('renders both a filter input and a filter button by default', () => {
    render(<Filter id="test-filter-bar" label="Filter" providers={[]} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
  it('renders only a filter input if the variant is set to input', () => {
    render(<Filter id="test-filter-bar" label="Filter" providers={[]} variant="input" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
  it('renders only a filter button if the variant is set to button', () => {
    render(<Filter id="test-filter-bar" label="Filter" providers={[]} variant="button" />)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
  it('renders a normal button by default', () => {
    render(<Filter id="test-filter-bar" label="Filter" providers={[]} />)
    expect(screen.getByRole('button')).toHaveTextContent('Filter')
  })
  it('renders a compact button if the filterButtonVariant is set to compact', () => {
    render(<Filter id="test-filter-bar" label="Filter" providers={[]} filterButtonVariant="compact" />)
    expect(screen.getByRole('button')).not.toContain('Filter')
  })

  it('renders initialFilterValue', async () => {
    const initialFilterValue = 'initial-value'

    render(<Filter id="test-filter-bar" label="Filter" providers={[]} initialFilterValue={initialFilterValue} />)

    expect(await screen.findByTestId('styled-input-content')).toHaveTextContent(initialFilterValue)
    expectFilterValueToBe(initialFilterValue)
  })

  it('should render a screen-reader only label by default', () => {
    render(<Filter id="test-filter-bar" label="Filter" providers={[]} />)
    expect(screen.getByTestId('filter-bar-label').classList).toContain('sr-only')
  })
  it('should render a visible label', () => {
    render(<Filter id="test-filter-bar" label="Filter" visuallyHideLabel={false} providers={[]} />)
    expect(screen.getByTestId('filter-bar-label').classList).not.toContain('sr-only')
  })

  it('expects aria-controls to match ID of suggestions list', async () => {
    const filterProviders = [new StateFilterProvider('mixed')]

    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)
    await updateFilterValue('s')
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-controls', 'test-filter-bar-results')
    expect(screen.getByRole('listbox')).toHaveAttribute('id', 'test-filter-bar-results')
  })

  it('expects aria-activedescendant to be undefined when no suggestion is active', async () => {
    const filterProviders = [new StateFilterProvider('mixed')]

    const {user} = render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    const input = screen.getByRole('combobox')
    await updateFilterValue('s')

    expect(input).not.toHaveAttribute('aria-activedescendant')
    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', 'suggestion-0')
  })

  it('suggestion item should only have aria-label defined with filter type', async () => {
    const filterProviders = [new StateFilterProvider('mixed')]

    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)
    await updateFilterValue('')

    expect(screen.getAllByRole('option')[0]).toHaveAttribute(
      'aria-label',
      'State, Filter, Look for open / closed items',
    )
    expect(screen.getAllByRole('option')[0]).not.toHaveAttribute('aria-labelledby')
  })

  describe('Events', () => {
    it('calls the onChange callback when the filter input changes', async () => {
      const onChange = jest.fn()
      const {user} = render(<Filter id="test-filter-bar" label="Filter" providers={[]} onChange={onChange} />)

      const input = screen.getByRole('combobox')
      await user.type(input, '1234')

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledTimes(4)
      })
    })

    it('calls the onKeyDown callback when a key is pressed in the filter input', async () => {
      const onKeyDown = jest.fn()
      const {user} = render(<Filter id="test-filter-bar" label="Filter" providers={[]} onKeyDown={onKeyDown} />)
      const input = screen.getByRole('combobox')
      await user.type(input, '{Enter}')

      await waitFor(() => {
        expect(onKeyDown).toHaveBeenCalled()
      })
    })

    it('calls the onValidation callback when the filter input is validated', async () => {
      const onValidation = jest.fn()
      render(
        <Filter
          id="test-filter-bar"
          label="Filter"
          providers={[]}
          onValidation={onValidation}
          showValidationMessage={true}
        />,
      )

      await updateFilterValue('1234')

      await waitFor(() => {
        expect(onValidation).toHaveBeenCalled()
      })
    })

    it('calls onValidation with filter query', async () => {
      const onValidation = jest.fn()
      render(
        <Filter
          id="test-filter-bar"
          label="Filter"
          providers={[]}
          onValidation={onValidation}
          showValidationMessage={true}
        />,
      )

      await updateFilterValue('1234')

      await waitFor(() => {
        expect(onValidation).toHaveBeenLastCalledWith([], expect.objectContaining({raw: '1234'}))
      })
    })

    it('does not highlight if query is invalid (unbalanced quotes)', async () => {
      const onValidation = jest.fn()
      render(<Filter id="test-filter-bar" label="Filter" providers={[]} onValidation={onValidation} />)
      const defaultFilterQueryObject = expect.objectContaining({raw: ''})

      await updateFilterValue('is:"')

      await waitFor(() => {
        // When quotes are not balanced, error blocks are not processed
        expect(onValidation).toHaveBeenCalledWith([], defaultFilterQueryObject)
      })

      await appendToFilterAndRenderAsyncSuggestions('issue"')

      await waitFor(() => {
        expect(onValidation).toHaveBeenCalledWith([], defaultFilterQueryObject)
      })
    })

    it('should trigger an external form submission on "Enter" when a suggestion is not selected or active', async () => {
      const onSubmit = jest.fn()

      const {user} = render(
        <form id="test" onSubmit={onSubmit}>
          <Filter id="test-filter-bar" label="Filter" providers={[]} />
        </form>,
      )
      const input = screen.getByRole('combobox')

      // Deselect the active suggestion
      await user.type(input, '{home}')

      // Trigger form submission
      await user.type(input, '{enter}')

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })

    it('should not trigger an external form submission on "Enter" when a filter suggestion is selected or active', async () => {
      const onSubmit = jest.fn()

      const {user} = render(
        <form id="test" onSubmit={onSubmit}>
          <Filter id="test-filter-bar" label="Filter" providers={[]} />
        </form>,
      )
      const input = screen.getByRole('combobox')

      // Trigger form submission
      await user.type(input, '{enter}')

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })

    it('should trigger the onSubmit callback on "Enter" when a filter value suggestion is selected', async () => {
      const onSubmit = jest.fn()

      const filterProviders = [new StateFilterProvider(), new StatusFilterProvider()]
      render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} onSubmit={onSubmit} />)
      const input = screen.getByRole('combobox')

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled()
      })

      input.focus()

      await updateFilterValue('st')

      expectSuggestionsToMatchSnapshot()
      await selectSuggestion('State')

      expectFilterValueToBe('state:')

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled()
      })

      expectSuggestionsToMatchSnapshot()
      await selectSuggestion('Open')

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
      expect(onSubmit.mock.lastCall[1]).toBe(SubmitEvent.SuggestionSelected)
    })

    it('should trigger the onSubmit callback on "Enter" when a filter value suggestion is not selected', async () => {
      const onSubmit = jest.fn()

      const filterProviders = [new StateFilterProvider(), new StatusFilterProvider()]
      const {user} = render(
        <Filter id="test-filter-bar" label="Filter" providers={filterProviders} onSubmit={onSubmit} />,
      )
      const input = screen.getByRole('combobox')

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled()
      })

      input.focus()

      await updateFilterValue('st')

      expectSuggestionsToMatchSnapshot()
      await selectSuggestion('State')

      expectFilterValueToBe('state:')

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled()
      })

      await user.type(input, '{Enter}')

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
      expect(onSubmit.mock.lastCall[1]).toBe(SubmitEvent.ExplicitSubmit)
    })
  })

  describe('Externally controlled', () => {
    it('updates the input immediately', async () => {
      const onKeyDown = jest.fn()
      const {user} = render(<ExternallyControlledFilter onKeyDown={onKeyDown} />)
      const input = screen.getByRole('combobox')
      await user.type(input, '1256')
      expect(input).toHaveValue('1256')

      await user.keyboard('{ArrowLeft}{ArrowLeft}34')
      expect(input).toHaveValue('123456')

      await user.tripleClick(input)
      await user.keyboard('{Backspace}')
      expect(input).toHaveValue('')

      // This waitFor is necessary to avoid the async act() error
      await waitFor(() => expect(onKeyDown).toHaveBeenCalled())
    })
  })
})

function ExternallyControlledFilter(props: Partial<FilterProps>) {
  const [value, setValue] = useState('')
  return <Filter id="test-id" label="Filter!!!" providers={[]} filterValue={value} onChange={setValue} {...props} />
}

describe('Filter Input', () => {
  setupAsyncErrorHandler()

  it('renders a blank filter input if no value is provided', () => {
    render(<Filter id="test-filter-bar" label="Filter" providers={[]} />)
    expectFilterValueToBe('')
  })
  it('renders a filter input with the provided value', () => {
    render(<Filter id="test-filter-bar" label="Filter" providers={[]} filterValue="test" />)
    expectFilterValueToBe('test')
  })
  it('renders a filter input with the provided placeholder', () => {
    render(<Filter id="test-filter-bar" label="Filter" providers={[]} placeholder="test" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', 'test')
  })
})
