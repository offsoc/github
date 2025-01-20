import type {Meta, StoryObj} from '@storybook/react'
import {expect, userEvent, within} from '@storybook/test'

import {Filter, type FilterProps} from '../Filter'
import {handlers} from '../mocks/handlers'
import {
  ArchivedFilterProvider,
  AssigneeFilterProvider,
  AuthorFilterProvider,
  ClosedFilterProvider,
  CreatedFilterProvider,
  InBodyFilterProvider,
  StateFilterProvider,
  StatusFilterProvider,
  UpdatedFilterProvider,
} from '../providers'
import {ProviderSupportStatus} from '../types'
import {setupMockFilterProviders} from './utils/mock-providers'

type Story = StoryObj<typeof Filter>

export default {
  title: 'Recipes/Filter/Interactions/Advanced Filter Dialog',
  component: Filter,
  parameters: {
    msw: {
      handlers,
    },
  },
} satisfies Meta<typeof Filter>

const defaultArgs: Partial<FilterProps> = {
  id: 'filter-sb',
  context: {repo: 'github/github'},
  label: 'Filter suggestions',
  providers: setupMockFilterProviders(),
  settings: {aliasMatching: false},
}

export const Default = {args: defaultArgs}

export const ShouldShowEmptyMessageByDefault: Story = {
  ...Default,
  name: 'Should show empty message by default',
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider('mixed')],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const advancedFilterDialogButton = canvas.getByTestId('advanced-filter-button')

    await userEvent.click(advancedFilterDialogButton)
    await expect(canvas.getByTestId('advanced-filter-dialog-content')).toBeInTheDocument()
    await expect(canvas.getByTestId('afd-no-content')).toBeInTheDocument()
  },
}

export const ShouldAddFilterRowWhenSelected: Story = {
  ...Default,
  name: 'Should add filter row when selected',
  args: {
    ...defaultArgs,
    providers: [
      new StateFilterProvider('mixed', {
        support: {status: ProviderSupportStatus.Supported},
        filterTypes: {
          inclusive: true,
          exclusive: true,
          valueless: true,
          multiKey: false,
          multiValue: true,
        },
      }),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)
    const advancedFilterDialogButton = canvas.getByTestId('advanced-filter-button')
    await userEvent.click(advancedFilterDialogButton)

    const addFilterButton = canvas.getByRole('button', {name: 'Add a filter'})
    await userEvent.click(addFilterButton)

    const menuItems = canvas.getByRole('menu', {name: 'Filter options'}).children
    await expect(menuItems).toHaveLength(3)

    await expect(canvas.getByTestId('advanced-filter-dialog-content')).toBeInTheDocument()

    await userEvent.click(menuItems[0] as HTMLElement)

    await expect(canvas.queryByTestId('afd-no-content')).not.toBeInTheDocument()
    const filterRows = canvas.getAllByTestId('afd-filter-row')
    await expect(filterRows).toHaveLength(1)
  },
}

export const ShouldNotApplyFilterChangesWhenCanceled: Story = {
  ...Default,
  name: 'Should not apply filter changes when canceled',
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider('mixed')],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox', {name: 'Filter suggestions'})

    await userEvent.type(input, 'foo')

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    const rawTextFilter = canvas.getByRole('textbox', {name: 'Value 1'})
    await userEvent.type(rawTextFilter, '-bar')

    const cancelButton = canvas.getByRole('button', {name: 'Cancel'})
    await userEvent.click(cancelButton)

    const closeAndDiscardButton = canvas.getByRole('button', {name: 'Close and discard'})
    await userEvent.click(closeAndDiscardButton)

    await expect(canvas.queryByTestId('advanced-filter-dialog-content')).not.toBeInTheDocument()
    await expect(input).not.toHaveValue('foo state:')
  },
}

export const ShouldApplyFilterChangesWhenSaved: Story = {
  ...Default,
  name: 'Should apply filter changes when saved',
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider('mixed'), new CreatedFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox', {name: 'Filter suggestions'})

    await userEvent.type(input, 'foo')

    const styledInput = canvas.getByTestId('styled-input-content')
    await expect(styledInput.querySelector('.text-block')).toHaveTextContent('foo')

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    const rawTextFilter = canvas.getByRole('textbox', {name: 'Value 1'})
    await userEvent.type(rawTextFilter, '-bar')

    const addFilterButton = canvas.getByRole('button', {name: 'Add a filter'})
    await userEvent.click(addFilterButton)

    const menuItems = canvas.getByRole('menu', {name: 'Filter options'}).children
    await userEvent.click(menuItems[0] as HTMLElement)

    const createdRow = canvas.getAllByTestId('afd-filter-row')[1]
    await expect(createdRow).toBeInTheDocument()

    const dateInput = within(createdRow!).getByPlaceholderText('YYYY-MM-DD')
    await userEvent.type(dateInput, '2022-12-12')
    await userEvent.click(canvas.getByRole('button', {name: 'Apply'}))

    await expect(canvas.queryByTestId('advanced-filter-dialog-content')).not.toBeInTheDocument()
    await expect(input).toHaveValue('foo-bar created:<2022-12-12')
  },
}

export const ShouldUpdateTheFilterProviderOperator: Story = {
  ...Default,
  name: 'Should update the filter provider operator',
  args: {
    ...defaultArgs,
    providers: [
      new StateFilterProvider('mixed', {
        support: {status: ProviderSupportStatus.Supported},
        filterTypes: {
          inclusive: true,
          exclusive: true,
          valueless: true,
          multiKey: false,
          multiValue: true,
        },
      }),
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    const addFilterButton = canvas.getByRole('button', {name: 'Add a filter'})
    await userEvent.click(addFilterButton)

    const menuItems = canvas.getByRole('menu', {name: 'Filter options'}).children
    await userEvent.click(menuItems[0] as HTMLElement)

    await expect(canvas.getByTestId('advanced-filter-dialog-content')).toBeInTheDocument()

    const filterRows = canvas.getAllByTestId('afd-filter-row')
    await expect(filterRows).toHaveLength(1)

    await expect(canvas.getByLabelText('Operator 1')).toHaveTextContent('is')

    await userEvent.click(canvas.getByLabelText('Operator 1'))
    await userEvent.click(canvas.getByRole('menuitemradio', {name: 'is not one of'}))
    await expect(canvas.getByLabelText('Operator 1')).toHaveTextContent('is not')
  },
}

export const ShouldUpdateTheFilterProvideValueForASelectType: Story = {
  ...Default,
  name: 'Should update the filter provider value for a select type',
  args: {
    ...defaultArgs,
    providers: [new AssigneeFilterProvider({showAtMe: true})],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    const addFilterButton = canvas.getByRole('button', {name: 'Add a filter'})
    await userEvent.click(addFilterButton)

    const menuItems = canvas.getByRole('menu', {name: 'Filter options'}).children
    await expect(menuItems).toHaveLength(3)
    await userEvent.click(menuItems[0] as HTMLElement)

    await expect(canvas.getByTestId('advanced-filter-dialog-content')).toBeInTheDocument()

    const filterRows = canvas.getAllByTestId('afd-filter-row')
    await expect(filterRows).toHaveLength(1)

    const valueSelectButton = canvas.getByRole('button', {name: 'Value 1'})
    await userEvent.click(valueSelectButton)

    const selectList = canvas.getByRole('listbox')
    await userEvent.click(within(selectList).getByRole('option', {name: 'dusave'}))

    await expect(valueSelectButton).toHaveTextContent('Dustin Savery')
  },
}

export const ShouldUpdateTheFilterProvideValueForABooleanSelectType: Story = {
  ...Default,
  name: 'Should update the filter provider value for a boolean select type',
  args: {
    ...defaultArgs,
    providers: [new ArchivedFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    const addFilterButton = canvas.getByRole('button', {name: 'Add a filter'})
    await userEvent.click(addFilterButton)

    const menuItems = canvas.getByRole('menu', {name: 'Filter options'}).children
    await expect(menuItems).toHaveLength(2)
    await userEvent.click(menuItems[0] as HTMLElement)

    await expect(canvas.getByTestId('advanced-filter-dialog-content')).toBeInTheDocument()

    const filterRows = canvas.getAllByTestId('afd-filter-row')
    await expect(filterRows).toHaveLength(1)

    const valueSelectButton = canvas.getByRole('button', {name: 'Make a selection'})
    await userEvent.click(valueSelectButton)

    const menu = canvas.getByRole('menu', {name: 'Make a selection'})
    await expect(within(menu).getAllByRole('menuitemradio')).not.toHaveLength(0)

    const valueMenuItems = within(menu).getAllByRole('menuitemradio')
    await userEvent.click(valueMenuItems[1] as Element)

    await expect(valueSelectButton).toHaveTextContent('False')
  },
}

export const ShouldUpdateTheFilterProvideValueForASingleSelectType: Story = {
  ...Default,
  name: 'Should update the filter provider value for a single select type',
  args: {
    ...defaultArgs,
    providers: [new AuthorFilterProvider({showAtMe: true})],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    const addFilterButton = canvas.getByRole('button', {name: 'Add a filter'})
    await userEvent.click(addFilterButton)

    const menuItems = canvas.getByRole('menu', {name: 'Filter options'}).children
    await expect(menuItems).toHaveLength(2)
    await userEvent.click(menuItems[0] as HTMLElement)

    await expect(canvas.getByTestId('advanced-filter-dialog-content')).toBeInTheDocument()
    const filterRows = canvas.getAllByTestId('afd-filter-row')
    await expect(filterRows).toHaveLength(1)

    const selectButton = canvas.getByRole('button', {name: 'Value 1'})
    await userEvent.click(selectButton)

    const selectList = canvas.getByRole('listbox')

    await userEvent.click(within(selectList).getByRole('option', {name: 'dusave'}))

    await expect(selectButton).toHaveTextContent('Dustin Savery')
  },
}

export const ShouldUpdateTheFilterProvideValueForTheFromToProvider: Story = {
  ...Default,
  name: 'Should update the filter provider value for a from/to provider',
  args: {
    ...defaultArgs,
    providers: [new UpdatedFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    const addFilterButton = canvas.getByRole('button', {name: 'Add a filter'})
    await userEvent.click(addFilterButton)

    const menuItems = canvas.getByRole('menu', {name: 'Filter options'}).children
    await expect(menuItems).toHaveLength(3)
    await userEvent.click(menuItems[2] as HTMLElement)

    await userEvent.click(canvas.getByLabelText('Qualifier 1'))
    await userEvent.click(canvas.getByLabelText('Operator 1'))
    await userEvent.click(canvas.getByRole('menuitemradio', {name: 'between'}))
    await expect(canvas.getByLabelText('Operator 1')).toHaveTextContent('between')

    const fromValueInput = canvas.getByTestId('afd-row-0-from')
    const toValueInput = canvas.getByTestId('afd-row-0-to')

    await userEvent.type(fromValueInput, '2022-12-12')
    await userEvent.type(toValueInput, '2023-12-12')

    await expect(fromValueInput).toHaveValue('2022-12-12')
    await expect(toValueInput).toHaveValue('2023-12-12')
  },
}

export const CanDisableTextFilterWhenDisableAdvancedTextFilterTrue: Story = {
  ...Default,
  name: 'Can disable text filter when disableAdvancedTextFilter is true and variant is button',
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider('mixed')],
    settings: {disableAdvancedTextFilter: true},
    variant: 'button',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    const addFilterButton = canvas.getByRole('button', {name: 'Add a filter'})
    await userEvent.click(addFilterButton)

    const menuItems = canvas.getByRole('menu', {name: 'Filter options'}).children
    await expect(menuItems).toHaveLength(1)
  },
}

export const CanDeleteAFilterRowAndUpdateInput: Story = {
  ...Default,
  name: 'Can delete a filter row and update the input',
  args: {
    ...defaultArgs,
    providers: [new StatusFilterProvider()],
    initialFilterValue: 'status:success status:failure',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox', {name: 'Filter suggestions'})
    input.focus()

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    const filterRows = canvas.getAllByTestId('afd-filter-row')
    await expect(filterRows).toHaveLength(2)

    await userEvent.click(canvas.getByTestId('afd-filter-row-delete-0'))
    await userEvent.click(canvas.getByRole('button', {name: 'Apply'}))

    await expect(canvas.queryByTestId('advanced-filter-dialog-content')).not.toBeInTheDocument()
    await expect(input).toHaveValue('status:failure')
  },
}

export const CanEditAndDeleteATextRowAndUpdateInput: Story = {
  ...Default,
  name: 'Can edit and delete a text row and update the input',
  args: {
    ...defaultArgs,
    providers: [new StatusFilterProvider()],
    initialFilterValue: 'test1',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox', {name: 'Filter suggestions'})
    input.focus()

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    const filterRows = canvas.getAllByTestId('afd-filter-row')
    await expect(filterRows).toHaveLength(1)
    await expect(canvas.getByTestId('afd-row-0')).toHaveValue('test1')

    const addFilterButton = canvas.getByRole('button', {name: 'Add a filter'})
    await userEvent.click(addFilterButton)
    await userEvent.keyboard('ttt{Enter}')

    const textInput = canvas.getByRole('textbox', {name: 'Value 2'})
    await userEvent.type(textInput, 'test2')

    await userEvent.click(canvas.getByTestId('afd-filter-row-delete-0'))
    await expect(canvas.getByTestId('afd-row-0')).toHaveValue('test2')

    await userEvent.click(canvas.getByRole('button', {name: 'Apply'}))
    await expect(canvas.queryByTestId('advanced-filter-dialog-content')).not.toBeInTheDocument()
    await expect(input).toHaveValue('test2')
  },
}

export const ShouldMaintainValueWhenSwitchingBetweenTextQualifiers: Story = {
  ...Default,
  name: 'Should maintain value when switching between text qualifiers',
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider('mixed'), new InBodyFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox', {name: 'Filter suggestions'})
    input.focus()
    await userEvent.type(input, 'foo')

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    await expect(canvas.getByTestId('afd-row-0')).toHaveValue('foo')

    await userEvent.click(canvas.getByLabelText('Qualifier 1'))
    await userEvent.click(canvas.getByRole('menuitemradio', {name: 'In body'}))

    await expect(canvas.getByTestId('afd-row-0')).toHaveValue('foo')

    await userEvent.type(canvas.getByTestId('afd-row-0'), 'bar')

    await userEvent.click(canvas.getByLabelText('Qualifier 1'))
    await userEvent.click(canvas.getByRole('menuitemradio', {name: 'Text'}))

    await expect(canvas.getByTestId('afd-row-0')).toHaveValue('foobar')

    await userEvent.click(canvas.getByRole('button', {name: 'Apply'}))
    await expect(canvas.queryByTestId('advanced-filter-dialog-content')).not.toBeInTheDocument()
    await expect(input).toHaveValue('foobar')
  },
}

export const ShouldResetValueWhenSwitchingBetweenQualifiersOfDifferentTypes: Story = {
  ...Default,
  name: 'Should reset value when switching between qualifiers of different types',
  args: {
    ...defaultArgs,
    providers: [new StateFilterProvider('mixed'), new CreatedFilterProvider(), new ClosedFilterProvider()],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    const input = canvas.getByRole('combobox', {name: 'Filter suggestions'})
    input.focus()
    await userEvent.type(input, 'created:<2024-04-04 foo')

    const advancedFilterDialogButton = canvas.getByRole('button', {name: 'Advanced filter dialog'})
    await userEvent.click(advancedFilterDialogButton)

    await expect(canvas.getByTestId('afd-row-0')).toHaveValue('2024-04-04')

    await userEvent.click(canvas.getByLabelText('Qualifier 1'))
    await userEvent.click(canvas.getByRole('menuitemradio', {name: 'Text'}))

    await expect(canvas.getByTestId('afd-row-0')).toHaveValue('')
    await userEvent.type(canvas.getByTestId('afd-row-0'), 'foo')

    await userEvent.click(canvas.getByLabelText('Qualifier 1'))
    await userEvent.click(canvas.getByRole('menuitemradio', {name: 'Closed date'}))

    await expect(canvas.getByTestId('afd-row-0')).toHaveValue('')
    await userEvent.type(canvas.getByTestId('afd-row-0'), '2024-01-01')

    await userEvent.click(canvas.getByRole('button', {name: 'Apply'}))
    await expect(canvas.queryByTestId('advanced-filter-dialog-content')).not.toBeInTheDocument()
  },
}
