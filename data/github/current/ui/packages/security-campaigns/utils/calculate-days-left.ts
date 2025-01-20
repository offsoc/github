const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24

export const calculateDaysLeft = (date: Date) => Math.floor((date.getTime() - Date.now()) / MILLISECONDS_IN_DAY)
