/* eslint eslint-comments/no-use: off */

import {ThemeProvider} from '@primer/react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {MemexColumnDataType} from '../../../../client/api/columns/contracts/memex-column'
import type {DateValue} from '../../../../client/api/columns/contracts/storage'
import {DateEditor} from '../../../../client/components/react_table/editors/date-editor'
import {moveTableFocus, useStableTableNavigation} from '../../../../client/components/react_table/navigation'
import {usePostStats} from '../../../../client/hooks/common/use-post-stats'
import {useUpdateItem} from '../../../../client/hooks/use-update-item'
import {EmptyValue, withValue} from '../../../../client/models/column-value'
import {createMemexItemModel, type IssueModel} from '../../../../client/models/memex-item-model'
import {FocusType, NavigationDirection} from '../../../../client/navigation/types'
import {customDateColumn} from '../../../../mocks/data/columns'
import {DefaultOpenIssue} from '../../../../mocks/memex-items'
import {asMockHook} from '../../../mocks/stub-utilities'

jest.mock('../../../../client/hooks/use-update-item')
jest.mock('../../../../client/hooks/common/use-post-stats')
jest.mock('../../../../client/components/react_table/navigation')

let someIssue
let model: IssueModel
let updateItem: jest.Mock
let navigationDispatch: jest.Mock
let user: ReturnType<typeof userEvent.setup>

const Wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <ThemeProvider>{children}</ThemeProvider>

describe('DateEditor', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2022-08-01 12:00:00').getTime())
    user = userEvent.setup({advanceTimers: jest.advanceTimersByTime})
  })

  beforeEach(() => {
    someIssue = DefaultOpenIssue
    model = createMemexItemModel(someIssue) as IssueModel
    updateItem = jest.fn()
    navigationDispatch = jest.fn()
    asMockHook(useUpdateItem).mockReturnValue({updateItem})
    asMockHook(useStableTableNavigation).mockReturnValue({navigationDispatch})
    asMockHook(usePostStats).mockReturnValue({postStats: jest.fn()})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty date cell with no date', () => {
    render(
      <DateEditor replaceContents={false} currentValue={EmptyValue} model={model} columnId={24242} rowIndex={1} />,
      {
        wrapper: Wrapper,
      },
    )

    expect(screen.getByTestId('table-cell-date-editor')).toHaveTextContent('')
  })

  it('renders date cell with selected date', () => {
    const dateValue: DateValue = {
      value: new Date('2022-08-06'),
    }

    render(
      <DateEditor
        replaceContents={false}
        currentValue={withValue(dateValue)}
        model={model}
        columnId={customDateColumn.id as number}
        rowIndex={1}
      />,
      {
        wrapper: Wrapper,
      },
    )

    expect(screen.getByTestId('table-cell-date-editor')).toHaveTextContent('Aug 6, 2022')
  })

  it('should have datepicker open on initial render', () => {
    const dateValue: DateValue = {
      value: new Date('2022-08-06'),
    }

    render(
      <DateEditor
        replaceContents={false}
        currentValue={withValue(dateValue)}
        model={model}
        columnId={customDateColumn.id as number}
        rowIndex={1}
      />,
      {
        wrapper: Wrapper,
      },
    )

    expect(screen.getByTestId('datepicker-panel')).toBeInTheDocument()
  })

  it('should trigger an item update, close datepicker and return focus to cell when date is clicked', async () => {
    const dateValue: DateValue = {
      value: new Date('2022-08-06'),
    }

    render(
      <DateEditor
        replaceContents={false}
        currentValue={withValue(dateValue)}
        model={model}
        columnId={customDateColumn.id as number}
        rowIndex={1}
      />,
      {
        wrapper: Wrapper,
      },
    )

    const element = await waitFor(() => screen.findByTestId('day-08/10/2022'))
    await user.click(element)

    expect(updateItem).toHaveBeenCalledWith(model, {
      dataType: MemexColumnDataType.Date,
      memexProjectColumnId: customDateColumn.id,
      value: {value: new Date('2022-08-10')},
    })
    expect(screen.queryByTestId('datepicker-panel')).not.toBeInTheDocument()
    await waitFor(() => expect(navigationDispatch).toHaveBeenCalledWith(moveTableFocus({focusType: FocusType.Focus})))
  })

  it('should trigger an item update, close datepicker and set focus to cell in next row when date is selected via keyboard', async () => {
    const dateValue: DateValue = {
      value: new Date('2022-08-06'),
    }

    render(
      <DateEditor
        replaceContents={false}
        currentValue={withValue(dateValue)}
        model={model}
        columnId={customDateColumn.id as number}
        rowIndex={1}
      />,
      {
        wrapper: Wrapper,
      },
    )

    await user.keyboard('{Tab}{Tab}{ArrowRight}{Enter}')

    expect(updateItem).toHaveBeenCalledWith(model, {
      dataType: MemexColumnDataType.Date,
      memexProjectColumnId: customDateColumn.id,
      value: {value: new Date('2022-08-07')},
    })
    expect(screen.queryByTestId('datepicker-panel')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(navigationDispatch).toHaveBeenCalledWith(
        moveTableFocus({y: NavigationDirection.Next, focusType: FocusType.Focus}),
      ),
    )
  })

  it('should trigger a item update, close datepicker and return focus to cell when date is cleared', async () => {
    const dateValue: DateValue = {
      value: new Date('2022-08-06'),
    }

    render(
      <DateEditor
        replaceContents={false}
        currentValue={withValue(dateValue)}
        model={model}
        columnId={customDateColumn.id as number}
        rowIndex={1}
      />,
      {
        wrapper: Wrapper,
      },
    )

    const element = await waitFor(() => screen.findByText('Clear'))
    await user.click(element)

    expect(updateItem).toHaveBeenCalledWith(model, {
      dataType: MemexColumnDataType.Date,
      memexProjectColumnId: customDateColumn.id,
      value: undefined,
    })
    expect(screen.queryByTestId('datepicker-panel')).not.toBeInTheDocument()
    await waitFor(() => expect(navigationDispatch).toHaveBeenCalledWith(moveTableFocus({focusType: FocusType.Focus})))
  })

  it('should close datepicker and return focus to cell  with no updates on pressing the Escape key', async () => {
    const dateValue: DateValue = {
      value: new Date('2022-08-06'),
    }

    render(
      <DateEditor
        replaceContents={false}
        currentValue={withValue(dateValue)}
        model={model}
        columnId={customDateColumn.id as number}
        rowIndex={1}
      />,
      {
        wrapper: Wrapper,
      },
    )

    await user.keyboard('{Escape}')

    expect(updateItem).not.toHaveBeenCalled()
    expect(screen.queryByTestId('datepicker-panel')).not.toBeInTheDocument()
    await waitFor(() => expect(navigationDispatch).toHaveBeenCalledWith(moveTableFocus({focusType: FocusType.Focus})))
  })

  it('should close datepicker and return focus to cell with no updates on cell click', async () => {
    const dateValue: DateValue = {
      value: new Date('2022-08-06'),
    }

    render(
      <DateEditor
        replaceContents={false}
        currentValue={withValue(dateValue)}
        model={model}
        columnId={customDateColumn.id as number}
        rowIndex={1}
      />,
      {
        wrapper: Wrapper,
      },
    )

    const element = await waitFor(() => screen.findByTestId('table-cell-date-editor'))
    await user.click(element)

    expect(updateItem).not.toHaveBeenCalled()
    expect(screen.queryByTestId('datepicker-panel')).not.toBeInTheDocument()
    await waitFor(() => expect(navigationDispatch).toHaveBeenCalledWith(moveTableFocus({focusType: FocusType.Focus})))
  })
})
