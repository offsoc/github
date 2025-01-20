import {format as dateFnsFormat, isValid, parse} from 'date-fns'

import {DateResources} from '../strings.en-us'
import {type DateFormat, type InternalSelection, isRangeSelection, type SelectionVariant} from '../types'
import {sanitizeDate} from './functions'

const SHORT_FORMAT = 'MMM d'
const LONG_FORMAT = 'MMM d, yyyy'
const INPUT_FORMAT = 'MM/dd/yyyy'

export const getDateFormat = (userFormat: DateFormat): string => {
  return userFormat === 'short' ? SHORT_FORMAT : userFormat === 'long' ? LONG_FORMAT : userFormat
}

export const parseDate = (dateString: string, additionalFormats: DateFormat[] = []): Date | null => {
  const reference = sanitizeDate(new Date())
  for (const format of ['PP', 'P', ...additionalFormats.map(getDateFormat)]) {
    const date = parse(dateString, format, reference)
    if (isValid(date)) return sanitizeDate(date)
  }
  return null
}
type FormatDateOptions = {
  selection?: InternalSelection
  dateFormat?: string
  placeholder?: string
  rawFormat?: boolean
  variant?: SelectionVariant
}

export const formatDate = (date: Date, dateFormat: string) => {
  const today = sanitizeDate(new Date())
  if (dateFormat !== SHORT_FORMAT && dateFormat !== LONG_FORMAT) {
    return dateFnsFormat(date, dateFormat)
  }

  if (dateFormat === SHORT_FORMAT && date.getUTCFullYear() !== today.getUTCFullYear()) {
    return dateFnsFormat(date, LONG_FORMAT)
  }
  return dateFnsFormat(date, dateFormat)
}

export const formatSelection = ({
  selection,
  dateFormat,
  placeholder = 'Choose Date',
  rawFormat = false,
  variant = 'single',
}: FormatDateOptions) => {
  if (!selection) {
    if (rawFormat) return ''
    return placeholder
  }

  let template = 'MMM d'
  if (!rawFormat && dateFormat) {
    template = getDateFormat(dateFormat)
  } else {
    template = INPUT_FORMAT
  }

  switch (variant) {
    case 'single': {
      if (selection instanceof Date) {
        return formatDate(selection, template)
      } else if (Array.isArray(selection) && selection?.[0] instanceof Date) {
        return formatDate(selection[0], template)
      } else if (isRangeSelection(selection)) {
        return formatDate(selection.from, template)
      } else {
        return DateResources.invalidSelection
      }
    }
    case 'multi': {
      if (Array.isArray(selection)) {
        if (selection.length > 3 && !rawFormat) return `${selection.length} Selected`
        if (selection.length === 0 && !rawFormat) return placeholder
        const formatted = selection
          .map(d => {
            return formatDate(d, template)
          })
          .join(', ')
        return formatted
      } else if (selection instanceof Date) {
        return [selection].map(d => formatDate(d, template)).join(', ')
      } else if (isRangeSelection(selection)) {
        return [selection.from, selection.to].map(d => (d ? formatDate(d, template) : '')).join(', ')
      } else {
        return DateResources.invalidSelection
      }
    }
    case 'range': {
      if (isRangeSelection(selection)) {
        return Object.entries(selection)
          .map(([, date]) => (date ? formatDate(date, template) : ''))
          .join(' - ')
      } else if (selection instanceof Date) {
        return Object.entries({from: selection, to: null})
          .map(([, date]) => (date ? formatDate(date, template) : ''))
          .join(' - ')
      } else if (Array.isArray(selection)) {
        return (
          Object.entries({from: selection.at(0), to: selection.at(1)})
            // to date can still be null
            .map(([, date]) => (date ? formatDate(date, template) : ''))
            .join(' - ')
        )
      } else {
        return DateResources.invalidSelection
      }
    }
    default: {
      return DateResources.invalidConfiguration
    }
  }
}
