import type {Meta} from '@storybook/react'
import {addDays} from 'date-fns'

import {DatePicker, type DatePickerProps} from '../date-picker'

const meta = {
  title: 'Recipes/Date Picker',
  component: DatePicker,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    anchor: {control: 'select', options: ['input', 'button', 'icon-only'], defaultValue: 'button'},
    anchoredOverlayProps: {table: {disable: true}},
    anchorClassName: {table: {disable: true}},
    compressedHeader: {control: 'boolean', defaultValue: false},
    configuration: {table: {disable: true}},
    confirmation: {control: 'boolean', defaultValue: false},
    confirmUnsavedClose: {control: {type: 'boolean'}, defaultValue: false},
    dateFormat: {control: 'select', options: ['short', 'long'], defaultValue: 'short'},
    disabled: {control: 'boolean', defaultValue: false},
    disableWeekends: {control: 'boolean', defaultValue: false},
    iconPlacement: {control: 'select', options: ['start', 'end', 'none'], defaultValue: 'start'},
    maxDate: {control: 'date'},
    minRangeSize: {control: 'number', if: {arg: 'variant', eq: 'range'}},
    maxRangeSize: {control: 'number', if: {arg: 'variant', eq: 'range'}},
    maxSelections: {control: 'number', if: {arg: 'variant', eq: 'multi'}},
    minDate: {control: 'date'},
    onChange: {action: 'Date changed'},
    onClose: {action: 'Date Picker closed'},
    onOpen: {action: 'Date Picker opened'},
    open: {table: {disable: true}},
    placeholder: {control: 'text', defaultValue: 'Choose date...'},
    showInputs: {control: 'boolean', defaultValue: true},
    showTodayButton: {control: 'boolean', defaultValue: true},
    showClearButton: {control: 'boolean', defaultValue: false},
    variant: {control: 'select', options: ['single', 'multi', 'range'], defaultValue: 'single'},
    view: {control: 'select', options: ['1-month', '2-month'], defaultValue: '1-month'},
    value: {table: {disable: true}},
    weekStartsOn: {
      control: 'select',
      options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      defaultValue: 'Sunday',
    },
  },
} satisfies Meta<typeof DatePicker>

export default meta

const defaultArgs: Partial<DatePickerProps> = {
  anchor: 'button',
  compressedHeader: false,
  confirmation: false,
  confirmUnsavedClose: false,
  dateFormat: 'short',
  disabled: false,
  disableWeekends: false,
  iconPlacement: 'start',
  placeholder: 'Choose date...',
  showInputs: true,
  showTodayButton: true,
  showClearButton: false,
  variant: 'single',
  view: '1-month',
  weekStartsOn: 'Sunday',
}

export const Single = {
  args: {
    ...defaultArgs,
    variant: 'single',
    value: new Date(),
  },
  render: (args: DatePickerProps) => (
    <DatePicker
      {...args}
      maxDate={args.maxDate && new Date(args.maxDate)}
      minDate={args.minDate && new Date(args.minDate)}
    />
  ),
}
export const SingleWithOpenOverlay = {
  args: {
    ...defaultArgs,
    open: true,
    variant: 'single',
    value: new Date(),
  },
  render: (args: DatePickerProps) => (
    <DatePicker
      {...args}
      maxDate={args.maxDate && new Date(args.maxDate)}
      minDate={args.minDate && new Date(args.minDate)}
    />
  ),
}
export const Multi = {
  args: {
    ...defaultArgs,
    variant: 'multi',
    value: [new Date(), addDays(new Date(), 2), addDays(new Date(), 5)],
  },
  render: (args: DatePickerProps) => (
    <DatePicker
      {...args}
      maxDate={args.maxDate && new Date(args.maxDate)}
      minDate={args.minDate && new Date(args.minDate)}
    />
  ),
}
export const Range = {
  args: {
    ...defaultArgs,
    variant: 'range',
    value: null,
  },
  render: (args: DatePickerProps) => (
    <DatePicker
      {...args}
      maxDate={args.maxDate && new Date(args.maxDate)}
      minDate={args.minDate && new Date(args.minDate)}
    />
  ),
}
