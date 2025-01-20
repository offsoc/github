import {render} from '@github-ui/react-core/test-utils'
import {act, screen, waitFor} from '@testing-library/react'

import {Filter} from '../Filter'
import {AssigneeFilterProvider, CreatedFilterProvider, ProjectFilterProvider, StateFilterProvider} from '../providers'
import {updateFilterValue} from '../test-utils'
import {type FilterProvider, ProviderSupportStatus} from '../types'
import {
  expectEmptyValueMessage,
  expectErrorMessage,
  expectNoErrorMessage,
  setupAsyncErrorHandler,
  setupProjectsMockApi,
  setupUsersMockApi,
} from './utils/helpers'

describe('Validation', () => {
  let onValidation: jest.Mock

  setupAsyncErrorHandler()

  function renderFilter(filterProviders: FilterProvider[]) {
    onValidation = jest.fn()
    render(
      <Filter
        id="test-filter-bar"
        label="Filter"
        context={{repo: 'github/github'}}
        providers={filterProviders}
        onValidation={onValidation}
      />,
    )

    expect(screen.getByTestId('filter-input')).toHaveAttribute('aria-describedby', '')
  }

  async function appendToFilter(key: string, value: string = '') {
    await updateFilterValue(key, value ? `${value} ` : '')

    await waitFor(() => {
      expect(onValidation).toHaveBeenCalled()
    })
  }

  describe('Freeform', () => {
    it('does not show validation messages when showValidationMessage is false', async () => {
      renderFilter([
        new StateFilterProvider('mixed', {
          support: {status: ProviderSupportStatus.Supported},
          filterTypes: {
            inclusive: true,
            exclusive: true,
            valueless: false,
            multiKey: false,
            multiValue: true,
          },
        }),
      ])

      await appendToFilter('test')

      await waitFor(() => {
        expect(onValidation).toHaveBeenCalled()
      })

      expectNoErrorMessage()
    })
  })

  describe('State', () => {
    it('shows error message when state is invalid', async () => {
      renderFilter([
        new StateFilterProvider('mixed', {
          support: {status: ProviderSupportStatus.Supported},
          filterTypes: {
            inclusive: true,
            exclusive: true,
            valueless: false,
            multiKey: false,
            multiValue: true,
          },
        }),
      ])

      await appendToFilter('state', 'fake')

      expectErrorMessage('state', 'fake')
    })

    it('does not show error message when state value is valid', async () => {
      renderFilter([
        new StateFilterProvider('mixed', {
          support: {status: ProviderSupportStatus.Supported},
          filterTypes: {
            inclusive: true,
            exclusive: true,
            valueless: false,
            multiKey: false,
            multiValue: true,
          },
        }),
      ])

      await appendToFilter('state', 'open')

      expectNoErrorMessage()
    })
  })

  describe('Project', () => {
    setupProjectsMockApi()

    it('shows error message when project is invalid', async () => {
      renderFilter([new ProjectFilterProvider()])

      await appendToFilter('project', 'fake')

      expectErrorMessage('project', 'fake')
    })

    it('does not show error message when project value is valid', async () => {
      renderFilter([new ProjectFilterProvider()])

      await appendToFilter('project', 'github/2169')

      expectNoErrorMessage()
    })

    it('properly validates projects regardless of case', async () => {
      renderFilter([new ProjectFilterProvider()])

      await appendToFilter('project', 'GITHUB/2169')

      expectNoErrorMessage()
    })
  })

  describe('Assignee', () => {
    setupUsersMockApi()

    it('shows error message when assignee is invalid', async () => {
      renderFilter([
        new AssigneeFilterProvider({
          showAtMe: true,
          currentUserAvatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
          currentUserLogin: 'monalisa',
        }),
      ])

      await appendToFilter('assignee', 'invalid')

      expectErrorMessage('assignee', 'invalid')
    })

    it('does not show error message when assignee value is valid', async () => {
      renderFilter([
        new AssigneeFilterProvider({
          showAtMe: true,
          currentUserAvatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
          currentUserLogin: 'monalisa',
        }),
      ])

      await appendToFilter('assignee', 'dusave')

      expectNoErrorMessage()
    })

    it('properly validates assignees regardless of case', async () => {
      renderFilter([
        new AssigneeFilterProvider({
          showAtMe: true,
          currentUserAvatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
          currentUserLogin: 'monalisa',
        }),
      ])

      await appendToFilter('assignee', 'DUSAVE')

      expectNoErrorMessage()
    })

    it('does not show error message when assignee value is @me', async () => {
      renderFilter([
        new AssigneeFilterProvider({
          showAtMe: true,
          currentUserAvatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
          currentUserLogin: 'monalisa',
        }),
      ])

      await appendToFilter('assignee', '@me')

      expectNoErrorMessage()
    })
  })

  describe('Date', () => {
    const operators = ['', '>', '<', '>=', '<=']

    it.each(operators)('does not show message when date only is valid with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}2012-12-12`)

      expectNoErrorMessage()
    })

    it.each(operators)('does not show message when date and time is valid with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}2017-03-01T15:30:15`)

      expectNoErrorMessage()
    })

    it.each(operators)(
      'does not show message when date, time and offset is valid with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}2017-03-01T15:30:15+07:00`)

        expectNoErrorMessage()
      },
    )

    it.each(operators)(
      'does not show message when date, time and zero offset is valid with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}2017-03-01T15:30:15Z`)

        expectNoErrorMessage()
      },
    )

    it.each(operators)(
      'does not show message when date, time and offset is valid with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}2017-03-01T15:30:15+07:00`)

        expectNoErrorMessage()
      },
    )

    it.each(operators)('shows error message when time is invalid with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}2017-03-01T3:30:15pm`)

      expectErrorMessage('created', `${operator}2017-03-01T3:30:15pm`)
    })

    it.each(operators)('does not show message when month is a single digit with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}2012-1-12`)

      expectNoErrorMessage()
    })

    it.each(operators)('does not show message when day is a single digit with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}2012-12-1`)

      expectNoErrorMessage()
    })

    it.each(operators)('does not show message when dynamic "today" value is used with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}@today`)

      expectNoErrorMessage()
    })

    it.each(operators)(
      'does not show message when dynamic value and day calculations is used with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}@today+1d`)

        expectNoErrorMessage()
      },
    )

    it.each(operators)(
      'does not show message when dynamic value and week calculations is used with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}@today-10w`)

        expectNoErrorMessage()
      },
    )

    it.each(operators)(
      'does not show message when dynamic value and month calculations is used with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}@today+1m`)

        expectNoErrorMessage()
      },
    )

    it.each(operators)(
      'does not show message when dynamic value and month calculations is used with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}@today+6m`)

        expectNoErrorMessage()
      },
    )

    it.each(operators)(
      'does not show message when dynamic value and quarter calculations is used with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}@today-2q`)

        expectNoErrorMessage()
      },
    )

    it.each(operators)(
      'does not show message when dynamic value and year calculations is used with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}@today+3y`)

        expectNoErrorMessage()
      },
    )

    it.each(operators)(
      'shows error message when dynamic value and invalid calculation operator is used with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}@today*3d`)

        expectErrorMessage('created', `${operator}@today*3d`)
      },
    )

    it.each(operators)(
      'shows error message when dynamic value and duplicate calculation operator is used with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}@today++3d`)

        expectErrorMessage('created', `${operator}@today++3d`)
      },
    )

    it.each(operators)(
      'shows error message when dynamic value and invalid calculation code is used with operator: %s',
      async operator => {
        renderFilter([new CreatedFilterProvider()])

        await appendToFilter('created', `${operator}@today+3x`)

        expectErrorMessage('created', `${operator}@today+3x`)
      },
    )

    it.each(operators)('shows error message when invalid dynamic value is used with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}@tomorrow`)

      expectErrorMessage('created', `${operator}@tomorrow`)
    })

    it.each(operators)('shows error message when day is invalid with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}2012-12-40`)

      expectErrorMessage('created', `${operator}2012-12-40`)
    })

    it.each(operators)('shows error message when month is invalid with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}2012-30-05`)

      expectErrorMessage('created', `${operator}2012-30-05`)
    })

    it.each(operators)('shows error message when year is invalid with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}20012-01-01`)

      expectErrorMessage('created', `${operator}20012-01-01`)
    })

    it.each(operators)('shows error message when day is missing with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}2012-05`)

      expectErrorMessage('created', `${operator}2012-05`)
    })

    it.each(operators)('shows error message when delimiter is invalid with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}2012.01.01`)

      expectErrorMessage('created', `${operator}2012.01.01`)
    })

    it.each(operators)('shows error message when date is invalid with operator: %s', async operator => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `${operator}test`)

      expectErrorMessage('created', `${operator}test`)
    })

    it('does not show message when valid with operator: ..', async () => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `2012-01-01..2012-02-01`)

      expectNoErrorMessage()
    })
    it('does not show message when using dynamic value with operator: ..', async () => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `@today..2012-01-01`)

      expectNoErrorMessage()
    })

    it('does not show message when date and time with operator: ..', async () => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `2017-01-01T01:00:00+07:00..2017-03-01T15:30:15Z`)

      expectNoErrorMessage()
    })
    it('shows message when only one value provided with operator: ..', async () => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `2012-01-01..`)

      expectEmptyValueMessage('created')
    })
    it('shows message when additional operators used with operator: ..', async () => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `>2012-01-01..2012-02-02`)

      expectErrorMessage('created', `>2012-01-01`)
    })
    it('shows message when only one value is valid with operator: ..', async () => {
      renderFilter([new CreatedFilterProvider()])

      await appendToFilter('created', `2012-01-01..foo`)

      expectErrorMessage('created', `foo`)
    })
  })

  describe('Focus/Blur', () => {
    it('shows error message when input no longer in focus', async () => {
      renderFilter([new StateFilterProvider()])

      await appendToFilter('state', ' ')

      expectEmptyValueMessage('state')
    })

    it('shows error message when input focus is returned', async () => {
      renderFilter([new StateFilterProvider()])

      await appendToFilter('state', ' ')

      const input = screen.getByRole('combobox')
      input.focus()

      expectEmptyValueMessage('state')
    })

    it('shows error message when input blur', async () => {
      renderFilter([new StateFilterProvider()])

      await appendToFilter('state:')

      // eslint-disable-next-line github/no-blur
      screen.getByRole('combobox').blur()

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        jest.runAllTimers()
      })

      expectEmptyValueMessage('state')
    })

    it('does not show error message when active block has validation warning while still focused', async () => {
      renderFilter([new StateFilterProvider()])

      await appendToFilter('test state:')

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        jest.runAllTimers()
      })

      expectNoErrorMessage()
    })
  })
})
