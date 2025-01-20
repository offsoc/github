/* eslint eslint-comments/no-use: off */

import {ThemeProvider} from '@primer/react'
import {act, render as _render, type RenderResult, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {Iteration, IterationConfiguration} from '../../../../client/api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../../../client/api/columns/contracts/memex-column'
import ToastContainer from '../../../../client/components/toasts/toast-container'
import {intervalDatesDescription} from '../../../../client/helpers/iterations'
import {type ColumnModel, createColumnModel} from '../../../../client/models/column-model'
import {IterationFieldOptions} from '../../../../client/pages/settings/components/iteration-field-options'
import {ColumnsContext, ColumnsStableContext} from '../../../../client/state-providers/columns/columns-state-provider'
import {
  ProjectDetailsContext,
  ProjectNumberContext,
} from '../../../../client/state-providers/memex/memex-state-provider'
import {InitialItems} from '../../../../stories/data-source'
import {createMockEnvironment} from '../../../create-mock-environment'
import {mergeIterationChanges} from '../../../mocks/models/iteration-configuration'
import {createColumnsContext} from '../../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../../mocks/state-providers/columns-stable-context'
import {assertIterationColumnModel} from '../../../models/column-model'
import {defaultProjectDetails, existingProject} from '../../../state-providers/memex/helpers'
import {QueryClientWrapper} from '../../../test-app-wrapper'
import {getDisplayedIterationNames} from './iteration-helpers'

// mock that tells use that the column is already loaded
jest.mock('../../../../client/state-providers/columns/use-find-loaded-field-ids', () => {
  return {__esModule: true, useFindLoadedFieldIds: () => ({findLoadedFieldIds: () => [1234]})}
})

const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
  createMockEnvironment({
    jsonIslandData: {
      'memex-items-data': InitialItems,
    },
  })
  return (
    <QueryClientWrapper>
      <ThemeProvider>
        <ProjectNumberContext.Provider value={existingProject()}>
          <ColumnsContext.Provider value={createColumnsContext()}>
            <ColumnsStableContext.Provider value={createColumnsStableContext()}>
              {/* ProjectDetailsContext is used to access the title for displaying a confirmation message */}
              <ProjectDetailsContext.Provider value={defaultProjectDetails()}>
                <ToastContainer>
                  {children}
                  <div id="__primerPortalRoot__" />
                </ToastContainer>
              </ProjectDetailsContext.Provider>
            </ColumnsStableContext.Provider>
          </ColumnsContext.Provider>
        </ProjectNumberContext.Provider>
      </ThemeProvider>
    </QueryClientWrapper>
  )
}

describe('IterationFieldOptions', () => {
  let column: ColumnModel
  let configuration: IterationConfiguration
  let onUpdate: (changes: Partial<IterationConfiguration>) => Promise<void>
  let updatePromise: Promise<unknown> = Promise.resolve()
  let newConfiguration: IterationConfiguration
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2021-09-22').getTime())
    user = userEvent.setup({advanceTimers: jest.advanceTimersByTime})
    const memexColumn = {
      dataType: MemexColumnDataType.Iteration,
      id: 1234,
      name: 'Iteration',
      userDefined: true,
      defaultColumn: true,
      databaseId: 5678,
      position: 1,
      settings: {
        configuration: {
          startDay: 1,
          duration: 14,
          iterations: [
            {
              id: 'iteration-4',
              startDate: '2021-09-20',
              duration: 14,
              title: 'Iteration 4',
              titleHtml: 'Iteration 4',
            },
            {
              id: 'iteration-5',
              startDate: '2021-10-04',
              duration: 14,
              title: 'Iteration 5',
              titleHtml: 'Iteration 5',
            },
            {
              id: 'iteration-6',
              startDate: '2021-10-18',
              duration: 14,
              title: 'Iteration 6',
              titleHtml: 'Iteration 6',
            },
          ],
          completedIterations: [
            {
              id: 'iteration-3',
              startDate: '2021-09-06',
              duration: 14,
              title: 'Iteration 3',
              titleHtml: 'Iteration 3',
            },
            {
              id: 'iteration-1',
              startDate: '2021-08-09',
              duration: 14,
              title: 'Iteration 1',
              titleHtml: 'Iteration 1',
            },
            {
              id: 'iteration-2',
              startDate: '2021-08-23',
              duration: 14,
              title: 'Iteration 2',
              titleHtml: 'Iteration 2',
            },
          ],
        },
      },
    }

    column = createColumnModel(memexColumn)

    onUpdate = (changes: Partial<IterationConfiguration>) => {
      assertIterationColumnModel(column)
      newConfiguration = mergeIterationChanges(column.settings.configuration, changes)
      updatePromise = Promise.resolve(newConfiguration)
      return Promise.resolve()
    }

    assertIterationColumnModel(column)
    configuration = column.settings.configuration!
  })

  const render = () =>
    _render(
      <IterationFieldOptions
        column={column}
        fieldName={column.name}
        serverConfiguration={configuration}
        onUpdate={onUpdate}
      />,
      {
        wrapper,
      },
    )

  const saveChanges = async (rerender: RenderResult['rerender']) => {
    const saveButton = await screen.findByTestId('iteration-field-settings-save')
    await user.click(saveButton)

    await act(async () => {
      await updatePromise
    })

    rerender(
      <IterationFieldOptions
        column={column}
        fieldName={column.name}
        serverConfiguration={newConfiguration}
        onUpdate={onUpdate}
      />,
    )
  }

  it('can append an iteration with the correct dates', async () => {
    const {rerender} = render()

    await expect(screen.findAllByRole('listitem')).resolves.toHaveLength(3)

    const addIterationButton = screen.getByTestId('add-default-iteration-button')
    if (!addIterationButton) throw new Error('Unable to locate add iteration button')

    await user.click(addIterationButton)

    const updatedRows = await screen.findAllByRole('listitem')

    expect(updatedRows).toHaveLength(4)
    const newRow = updatedRows[3]

    await saveChanges(rerender)
    const iterations = newConfiguration.iterations

    const lastIteration = newConfiguration.iterations[iterations.length - 1]
    const description = intervalDatesDescription(lastIteration)
    expect(within(newRow).getByTestId('iteration-title')).toHaveValue(lastIteration.title)
    expect(within(newRow).getByTestId('iteration-or-break-dates')).toHaveTextContent(description)
  })

  it('can rename an iteration', async () => {
    const iterationId = 'iteration-5'

    const {rerender} = render()

    const rows = await screen.findAllByRole('listitem')
    const secondRow = rows[1]

    const iterationTitle = within(secondRow).getByTestId('iteration-title')
    if (!iterationTitle) throw new Error('Unable to locate add iteration button')

    await user.click(iterationTitle)

    const inputTitle = await waitFor(() => within(secondRow).getByTestId('iteration-title'))
    expect(inputTitle).toBeInTheDocument()

    await user.clear(inputTitle)
    await user.type(inputTitle, 'Sprint 2')
    await user.keyboard('{Tab}')
    await saveChanges(rerender)

    const iterations = newConfiguration.iterations

    const updatedIteration = iterations.find(i => i.id === iterationId)
    expect(updatedIteration!.title).toEqual('Sprint 2')

    const updatedRows = await screen.findAllByRole('listitem')
    const newRow = updatedRows[1]

    await waitFor(() => expect(within(newRow).getByTestId('iteration-title')).toHaveValue('Sprint 2'))
  })

  it('can delete an iteration', async () => {
    const iterationId = 'iteration-5'

    const {rerender} = render()

    const rows = await screen.findAllByRole('listitem')
    const secondRow = rows[1]

    const deleteButton = within(secondRow).getByTestId('delete-iteration')
    await user.click(deleteButton)

    expect(secondRow).not.toBeInTheDocument()

    const iterationNames = await getDisplayedIterationNames()
    expect(iterationNames).toHaveLength(2)
    expect(iterationNames).not.toContain('Iteration 5')

    await saveChanges(rerender)

    expect(newConfiguration.iterations.find(iteration => iteration.id === iterationId)).toBeUndefined()
  })

  // https://github.com/github/memex/issues/7528
  it('when several new iterations exist, one can be deleted without deleting all of them', async () => {
    render()

    const addButton = await screen.findByTestId('add-default-iteration-button')
    await user.click(addButton)
    await user.click(addButton)
    await user.click(addButton)
    await user.click(addButton)

    expect(await getDisplayedIterationNames()).toHaveLength(7)

    const rows = await screen.findAllByRole('listitem')
    const rowToDelete = rows[4]

    const deleteButton = within(rowToDelete).getByTestId('delete-iteration')
    await user.click(deleteButton)

    expect(rowToDelete).not.toBeInTheDocument()
    expect(await getDisplayedIterationNames()).toHaveLength(6)
  })

  it('clears local changes when reset', async () => {
    render()

    const rows = await screen.findAllByRole('listitem')
    const secondRow = rows[1]

    const iterationTitle = within(secondRow).getByTestId('iteration-title')
    if (!iterationTitle) throw new Error('Unable to locate add iteration button')

    await user.click(iterationTitle)

    const inputTitle = await waitFor(() => within(secondRow).getByTestId('iteration-title'))
    expect(inputTitle).toBeInTheDocument()

    await user.clear(inputTitle)
    await user.type(inputTitle, 'Sprint 5')
    await user.keyboard('{Tab}')

    const updatedRows = await screen.findAllByRole('listitem')
    const newRow = updatedRows[1]

    const cancelButton = await screen.findByTestId('iteration-field-settings-reset')
    await user.click(cancelButton)

    expect(within(newRow).getByTestId('iteration-title')).toHaveValue('Iteration 5')
  })

  it('clears settings saved message when reset', async () => {
    const {rerender} = render()

    const rows = await screen.findAllByRole('listitem')
    const secondRow = rows[1]

    const iterationTitle = within(secondRow).getByTestId('iteration-title')
    if (!iterationTitle) throw new Error('Unable to locate add iteration button')

    await user.click(iterationTitle)

    const inputTitle = await waitFor(() => within(secondRow).getByTestId('iteration-title'))

    await user.clear(inputTitle)
    await user.type(inputTitle, 'Sprint 5')
    await user.keyboard('{Tab}')

    await saveChanges(rerender)

    const resetButton = await screen.findByTestId('iteration-field-settings-reset')
    await user.click(resetButton)

    expect(screen.queryByText('Changes saved')).toBeNull()
  })

  it('can update an iteration date range', async () => {
    const iterationId = 'iteration-5'

    const {rerender} = render()

    const rows = await screen.findAllByRole('listitem')
    const fifthRow = rows[1]

    const iterationDatesButton = within(fifthRow).getByTestId('iteration-or-break-dates')
    if (!iterationDatesButton) throw new Error('Unable to locate iteration date range edit button')

    await user.click(iterationDatesButton)

    const datePicker = await screen.findByTestId('datepicker-panel')
    const oct10 = await within(datePicker).findByTestId('day-10/10/2021')
    const oct16 = await within(datePicker).findByTestId('day-10/16/2021')
    const applyButton = await within(datePicker).findByTestId('datepicker-apply')

    expect(datePicker).toBeInTheDocument()
    await user.click(oct10)
    await user.click(oct16)
    await user.click(applyButton)
    await saveChanges(rerender)
    expect(datePicker).not.toBeInTheDocument()

    const iterationAfterChange = newConfiguration.iterations.find(({id}) => id === iterationId)
    expect(iterationAfterChange!.startDate).toEqual('2021-10-10')
    expect(iterationAfterChange!.duration).toEqual(7)

    const updatedRows = await screen.findAllByRole('listitem')
    const updatedDates = within(updatedRows[2]).getByTestId('iteration-or-break-dates') // This index is 1 more than expected(1) because a break was inserted
    expect(updatedDates.textContent).toEqual(intervalDatesDescription(iterationAfterChange))

    // editing the dates has created a break
    const breakDates = within(updatedRows[1]).getByTestId('iteration-dates-diff')
    expect(within(breakDates).getByTestId('iteration-or-break-dates')).toHaveTextContent('Oct 04 - Oct 09')
  })

  it('can rename a completed iteration', async () => {
    const iterationId = 'iteration-1'

    const {rerender} = render()

    await user.click(await screen.findByTestId('completed-iterations'))

    const rows = await screen.findAllByRole('listitem')
    const firstRow = rows[0]

    const iterationTitle = within(firstRow).getByTestId('iteration-title')
    if (!iterationTitle) throw new Error('Unable to locate add iteration button')

    await user.click(iterationTitle)

    const inputTitle = await waitFor(() => within(firstRow).getByTestId('iteration-title'))
    expect(inputTitle).toBeInTheDocument()

    await user.clear(inputTitle)
    await user.type(inputTitle, 'Sprint 1')
    await user.keyboard('{Tab}')

    await saveChanges(rerender)

    const completedIterations = newConfiguration.completedIterations

    const lastIteration = completedIterations.find(i => i.id === iterationId)
    expect(lastIteration!.title).toEqual('Sprint 1')

    const updatedRows = await screen.findAllByRole('listitem')
    const newRow = updatedRows[0]

    expect(within(newRow).getByTestId('iteration-title')).toHaveValue('Sprint 1')
  })

  it('renders active iterations in ascending order', async () => {
    render()

    const names = await getDisplayedIterationNames()
    expect(names).toEqual(['Iteration 4', 'Iteration 5', 'Iteration 6'])
  })

  it('renders completed iterations in ascending order', async () => {
    render()

    await user.click(await screen.findByTestId('completed-iterations'))

    const names = await getDisplayedIterationNames()
    expect(names).toEqual(['Iteration 1', 'Iteration 2', 'Iteration 3'])
  })

  it('renders delete button for all iterations', async () => {
    render()

    const rows = await screen.findAllByRole('listitem')

    for (const row of rows) {
      expect(within(row).getByTestId('delete-iteration')).not.toBeNull()
      // inputs are also rendered
      expect(within(row).getByRole('textbox')).not.toBeNull()
    }
  })

  it('can open and close add custom iteration modal', async () => {
    render()

    const customAddButton = screen.getByTestId('add-custom-iteration-button')
    await user.click(customAddButton)

    const customIterationModal = screen.getByTestId('custom-iteration-modal')
    expect(customIterationModal).toBeVisible()

    const cancelButton = within(customIterationModal).getByTestId('cancel-add-custom-iteration')
    await user.click(cancelButton)
    expect(customIterationModal).not.toBeVisible()
  })

  it('can change duration type', async () => {
    render()

    const customAddButton = screen.getByTestId('add-custom-iteration-button')
    await user.click(customAddButton)

    const customIterationModal = screen.getByTestId('custom-iteration-modal')

    const durationButton = within(customIterationModal).getByTestId('duration-units-button')
    await user.click(durationButton)

    // screen.debug()
    // const primerRoot = screen.query
    const weeksDurationMenuItem = screen.getByTestId('duration-weeks-menu-item')
    await user.click(weeksDurationMenuItem)

    await waitFor(() => {
      expect(within(customIterationModal).getByTestId('duration-units-value')).toHaveTextContent('weeks')
    })

    await user.click(durationButton)

    const daysDurationMenuItem = screen.getByTestId('duration-days-menu-item')
    await user.click(daysDurationMenuItem)

    await waitFor(() => {
      expect(within(customIterationModal).getByTestId('duration-units-value')).toHaveTextContent('days')
    })
  })

  it('discards input when modal is closed without saving', async () => {
    render()

    const customAddButton = screen.getByTestId('add-custom-iteration-button')
    await user.click(customAddButton)

    const customIterationModal = screen.getByTestId('custom-iteration-modal')
    const durationInput = within(customIterationModal).getByTestId('duration-quantity-input')

    expect(durationInput).toHaveValue(2)
    await user.clear(durationInput)
    await user.type(durationInput, '55')

    const cancelButton = within(customIterationModal).getByTestId('cancel-add-custom-iteration')
    await user.click(cancelButton)

    await user.click(customAddButton)

    // The modal got unmounted and remounted so query it again
    const newCustomIterationModal = screen.getByTestId('custom-iteration-modal')
    const newDurationInput = within(newCustomIterationModal).getByTestId('duration-quantity-input')
    expect(newDurationInput).toHaveValue(2)
  })

  it('can add iteration with custom length and saves duration when iteration is added', async () => {
    const {rerender} = render()

    const customAddButton = screen.getByTestId('add-custom-iteration-button')
    await user.click(customAddButton)

    const customIterationModal = screen.getByTestId('custom-iteration-modal')
    const durationInput = within(customIterationModal).getByTestId('duration-quantity-input')
    await user.clear(durationInput)
    await user.type(durationInput, '5')

    const saveButton = within(customIterationModal).getByTestId('save-add-custom-iteration')
    await user.click(saveButton)

    await saveChanges(rerender)
    expect(newConfiguration.duration).toEqual(35) // duration becomes 35 days as it'll be 5 weeks

    // Make sure the duration persists when an iteration is created:
    await user.click(customAddButton)
    // The modal got unmounted and remounted so query it again
    const newCustomIterationModal = screen.getByTestId('custom-iteration-modal')
    const newDurationInput = within(newCustomIterationModal).getByTestId('duration-quantity-input')
    expect(newDurationInput).toHaveValue(5)
  })

  it('shows strike through text for all the updates made for iteration before saving', async () => {
    render()

    await user.click(await screen.findByTestId('completed-iterations'))

    const rows = await screen.findAllByRole('listitem')
    const firstRow = rows[0]

    const iterationTitle = within(firstRow).getByTestId('iteration-title')
    if (!iterationTitle) throw new Error('Unable to locate iteration title')

    await user.click(iterationTitle)

    const inputTitle = await waitFor(() => within(firstRow).getByTestId('iteration-title'))
    expect(inputTitle).toBeInTheDocument()

    await user.clear(inputTitle)
    await user.type(inputTitle, 'Sprint 1')
    await user.keyboard('{Tab}')

    const iterationDatesButton = within(firstRow).getByTestId('iteration-or-break-dates')
    if (!iterationDatesButton) throw new Error('Unable to locate iteration date range edit button')

    await user.click(iterationDatesButton)

    const datePicker = await screen.findByTestId('datepicker-panel')
    const aug15 = await within(datePicker).findByTestId('day-08/15/2021')
    const aug25 = await within(datePicker).findByTestId('day-08/25/2021')
    const applyButton = await within(datePicker).findByTestId('datepicker-apply')

    expect(datePicker).toBeInTheDocument()
    await user.click(aug15)
    await user.click(aug25)
    await user.click(applyButton)

    const updatedRows = await screen.findAllByRole('listitem')
    const updatedFirstRow = updatedRows[0]

    const titleDiff = within(updatedFirstRow).getByTestId('iteration-title-diff')
    expect(within(titleDiff).getByTestId('original-value')).toHaveTextContent('Iteration 1')
    expect(within(titleDiff).getByTestId('iteration-title')).toHaveValue('Sprint 1')

    const datesDiff = within(updatedFirstRow).getByTestId('iteration-dates-diff')
    expect(within(datesDiff).getByTestId('original-value')).toHaveTextContent('Aug 09 - Aug 22')
    expect(within(datesDiff).getByTestId('updated-value')).toHaveTextContent('Aug 15 - Aug 25')
  })

  it('shows message when changes to completed iterations affects active iterations', async () => {
    render()

    await user.click(await screen.findByTestId('completed-iterations'))

    const rows = await screen.findAllByRole('listitem')
    const firstRow = rows[0]

    const iterationDatesButton = within(firstRow).getByTestId('iteration-or-break-dates')
    await user.click(iterationDatesButton)

    const datePicker = await screen.findByTestId('datepicker-panel')
    const aug15 = await within(datePicker).findByTestId('day-08/15/2021')
    const aug25 = await within(datePicker).findByTestId('day-08/25/2021')
    const applyButton = await within(datePicker).findByTestId('datepicker-apply')

    expect(datePicker).toBeInTheDocument()
    await user.click(aug15)
    await user.click(aug25)
    await user.click(applyButton)

    const notice = await screen.findByTestId('active-changes-notice')
    expect(notice).toHaveTextContent('3 active iterations will also be pushed forward.')
  })

  describe('iteration breaks', () => {
    it('can add breaks between iterations from settings page with insert break button', async () => {
      render()

      const addBreakButtons = await screen.findAllByTestId('add-break-button')
      await user.click(addBreakButtons[1])

      const updatedRows = await screen.findAllByRole('listitem')
      const updatedBreakRow = updatedRows[1]
      const updatedSecondRow = updatedRows[2]
      const updatedThirdRow = updatedRows[3]

      const breakDates = within(updatedBreakRow).getByTestId('iteration-dates-diff')
      expect(within(breakDates).getByTestId('updated-value')).toHaveTextContent('Oct 04 - Oct 17')

      const fifthRowDatesDiff = within(updatedSecondRow).getByTestId('iteration-dates-diff')
      expect(within(fifthRowDatesDiff).getByTestId('original-value')).toHaveTextContent('Oct 04 - Oct 17')
      expect(within(fifthRowDatesDiff).getByTestId('updated-value')).toHaveTextContent('Oct 18 - Oct 31')

      const sixthRowDatesDiff = within(updatedThirdRow).getByTestId('iteration-dates-diff')
      expect(within(sixthRowDatesDiff).getByTestId('original-value')).toHaveTextContent('Oct 18 - Oct 31')
      expect(within(sixthRowDatesDiff).getByTestId('updated-value')).toHaveTextContent('Nov 01 - Nov 14')
    })

    it('renders a break when an iteration is deleted between otherwise consecutive iterations', async () => {
      const iterationId = 'iteration-5'
      render()

      const rows = await screen.findAllByRole('listitem')
      const secondRow = rows[1]

      const deleteIterationButton = within(secondRow).getByTestId('delete-iteration')
      if (!deleteIterationButton) throw new Error('Unable to locate iteration delete button')

      await user.click(deleteIterationButton)

      const updatedRows = await screen.findAllByRole('listitem')

      // No change in row count as a break was inserted
      expect(updatedRows.length).toBe(rows.length)

      // A break is created with the same duration as the deleted iteration
      const breakDates = within(updatedRows[1]).getByTestId('iteration-dates-diff')
      expect(within(breakDates).getByTestId('iteration-or-break-dates')).toHaveTextContent(
        intervalDatesDescription(configuration.iterations.find((iteration: Iteration) => iteration.id === iterationId)),
      )
    })

    it("renders a break when an iteration's end date is pulled back", async () => {
      const iterationId = 'iteration-5'

      const {rerender} = render()

      const rows = await screen.findAllByRole('listitem')
      const secondRow = rows[1]

      const iterationDatesButton = within(secondRow).getByTestId('iteration-or-break-dates')
      if (!iterationDatesButton) throw new Error('Unable to locate iteration date range edit button')

      await user.click(iterationDatesButton)

      const datePicker = await screen.findByTestId('datepicker-panel')
      const oct17 = await within(datePicker).findByTestId('day-10/17/2021')
      const oct16 = await within(datePicker).findByTestId('day-10/16/2021')
      const applyButton = await within(datePicker).findByTestId('datepicker-apply')

      expect(datePicker).toBeInTheDocument()
      await user.click(oct17)
      await user.click(oct16)
      await user.click(applyButton)
      await saveChanges(rerender)
      expect(datePicker).not.toBeInTheDocument()

      const iterationAfterChange = newConfiguration.iterations.find(({id}) => id === iterationId)
      expect(iterationAfterChange!.startDate).toEqual('2021-10-04')
      expect(iterationAfterChange!.duration).toEqual(13) // We reduced the duration of the iteration by 1

      const updatedRows = await screen.findAllByRole('listitem')
      const updatedDates = within(updatedRows[1]).getByTestId('iteration-dates-diff')
      expect(within(updatedDates).getByTestId('iteration-or-break-dates')).toHaveTextContent('Oct 04 - Oct 16')

      // A break of length 1 is created between iteration-5 and iteration-6
      const breakDates = within(updatedRows[2]).getByTestId('iteration-dates-diff')
      expect(within(breakDates).getByTestId('iteration-or-break-dates')).toHaveTextContent(
        intervalDatesDescription({
          startDate: '2021-10-17',
          duration: 1,
        }),
      )
    })

    it('can edit an iteration break and renders the diff', async () => {
      const {rerender} = render()

      const addBreakButtons = await screen.findAllByTestId('add-break-button')
      await user.click(addBreakButtons[1])

      let updatedRows = await screen.findAllByRole('listitem')

      const breakDatesDiff = within(updatedRows[1]).getByTestId('iteration-dates-diff')
      expect(within(breakDatesDiff).getByTestId('updated-value')).toHaveTextContent('Oct 04 - Oct 17')

      await saveChanges(rerender)
      updatedRows = await screen.findAllByRole('listitem')

      const breakDatesButton = within(updatedRows[1]).getByTestId('iteration-or-break-dates')
      if (!breakDatesButton) throw new Error('Unable to locate break date range edit button')

      await user.click(breakDatesButton)

      const datePicker = await screen.findByTestId('datepicker-panel')
      const oct17 = await within(datePicker).findByTestId('day-10/17/2021')
      const oct16 = await within(datePicker).findByTestId('day-10/16/2021') // shorten the break by 1
      const applyButton = await within(datePicker).findByTestId('datepicker-apply')

      expect(datePicker).toBeInTheDocument()
      await user.click(oct17)
      await user.click(oct16)
      await user.click(applyButton)

      updatedRows = await screen.findAllByRole('listitem')
      const updatedBreakRow = updatedRows[1]

      const datesDiff = within(updatedBreakRow).getByTestId('iteration-dates-diff')
      expect(within(datesDiff).getByTestId('original-value')).toHaveTextContent('Oct 04 - Oct 17')
      expect(within(datesDiff).getByTestId('updated-value')).toHaveTextContent('Oct 04 - Oct 16')
    })

    it('can delete an iteration break', async () => {
      const {rerender} = render()

      const addBreakButtons = await screen.findAllByTestId('add-break-button')
      await user.click(addBreakButtons[1])

      let updatedRows = await screen.findAllByRole('listitem')

      const breakDatesDiff = within(updatedRows[1]).getByTestId('iteration-dates-diff')
      expect(within(breakDatesDiff).getByTestId('updated-value')).toHaveTextContent('Oct 04 - Oct 17')

      await saveChanges(rerender)
      updatedRows = await screen.findAllByRole('listitem')

      const deleteBreakButton = within(updatedRows[1]).getByTestId('delete-iteration')
      await user.click(deleteBreakButton)

      updatedRows = await screen.findAllByRole('listitem')
      const rowFive = updatedRows[1]
      const rowSix = updatedRows[2]

      const fifthRowDiff = within(rowFive).getByTestId('iteration-dates-diff')
      expect(within(fifthRowDiff).getByTestId('original-value')).toHaveTextContent('Oct 18 - Oct 31')
      expect(within(fifthRowDiff).getByTestId('updated-value')).toHaveTextContent('Oct 04 - Oct 17')

      const sixthRowDiff = within(rowSix).getByTestId('iteration-dates-diff')
      expect(within(sixthRowDiff).getByTestId('original-value')).toHaveTextContent('Nov 01 - Nov 14')
      expect(within(sixthRowDiff).getByTestId('updated-value')).toHaveTextContent('Oct 18 - Oct 31')
    })
  })
})
