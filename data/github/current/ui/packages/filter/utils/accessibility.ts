import {announce} from '@github-ui/aria-live'

// This is a delay we configure to avoid screen readers from reading the suggestions list immediately on change
const SCREEN_READER_FEEDBACK_TIMEOUT_MS = 150

let screenReaderTimeout: NodeJS.Timeout | null

export const updateScreenReaderFeedback = (message: string = '') => {
  if (screenReaderTimeout) clearTimeout(screenReaderTimeout)
  screenReaderTimeout = setTimeout(() => {
    announce(message)
  }, SCREEN_READER_FEEDBACK_TIMEOUT_MS)
}
