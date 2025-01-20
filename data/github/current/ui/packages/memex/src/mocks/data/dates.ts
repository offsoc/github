import {addDays, format, subDays} from 'date-fns'

import {formatDateString, formatISODateString} from '../../client/helpers/parsing'

const today = new Date()

const getTomorrow = () => {
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

const getYesterday = () => {
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday
}

const tomorrow = getTomorrow()
const yesterday = getYesterday()

export const todayString = formatDateString(today)

export const todayISOString = formatISODateString(today)
export const tomorrowISOString = formatISODateString(tomorrow)
export const yesterdayISOString = formatISODateString(yesterday)

const startDate = new Date()
const dateFormat = 'yyyy-MM-dd'

export const iteration4Date = format(startDate, dateFormat)
export const iteration5Date = format(addDays(startDate, 14), dateFormat)
export const iteration6Date = format(addDays(startDate, 28), dateFormat)
export const iteration0Date = format(subDays(startDate, 56), dateFormat)
export const iteration1Date = format(subDays(startDate, 42), dateFormat)
export const iteration2Date = format(subDays(startDate, 28), dateFormat)
export const iteration3Date = format(subDays(startDate, 14), dateFormat)

export const threeWeekIteration1Date = format(addDays(startDate, 14), dateFormat)
export const threeWeekIteration2Date = format(addDays(startDate, 14 + 21), dateFormat)
export const threeWeekIteration3Date = format(addDays(startDate, 14 + 21 * 2), dateFormat)
