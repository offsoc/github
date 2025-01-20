import {session} from '@github/turbo'

interface ProgressBar {
  setValue(n: number): void
  hide(): void
  show(): void
}

interface BrowserAdapter {
  progressBar: ProgressBar
}

const adapter = session.adapter as typeof session.adapter & BrowserAdapter

// Start the ProgressBar at the top of the page.
export const beginProgressBar = () => {
  adapter.progressBar.setValue(0)
  adapter.progressBar.show()
}

// Complete the ProgressBar at the top of the page.
export const completeProgressBar = () => {
  adapter.progressBar.setValue(1)
  adapter.progressBar.hide()
}
