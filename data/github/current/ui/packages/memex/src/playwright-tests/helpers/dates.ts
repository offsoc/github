export const today = new Date()

const getYesterday = () => {
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday
}

const getTomorrow = () => {
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

export const tomorrow = getTomorrow()
const yesterday = getYesterday()

const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
} as const

export function parseISODateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function parseDateString(value: Date, extraFormatOptions = {}): string {
  return value.toLocaleDateString('en-us', {...DATE_FORMAT_OPTIONS, ...extraFormatOptions})
}

/** The current date, formatted for en-US, for use in tests */
export const todayString = parseDateString(today)
/** The current date, converted into the representation expected when displaying in the search filter */
export const todayISOString = parseISODateString(today)
/** Tomorrow's date, formatted for en-US, for use in tests */
export const tomorrowString = parseDateString(tomorrow)
/** Tomorrow's date, converted into the representation expected when displaying in the search filter */
export const tomorrowISOString = tomorrow.toISOString().slice(0, 10)

/** Yesterday's date, formatted for en-US, for use in tests */
export const yesterdayString = parseDateString(yesterday)
/** Yesterday's date, converted into the representation expected when displaying in the search filter */
export const yesterdayISOString = parseISODateString(yesterday)
