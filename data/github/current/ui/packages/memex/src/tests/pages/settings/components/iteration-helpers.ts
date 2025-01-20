import {screen, within} from '@testing-library/react'

/** Extract the iteration names from the rendered component */
export async function getDisplayedIterationNames(): Promise<Array<string>> {
  const rows = await screen.findAllByRole('listitem')
  const nameElements: Array<string> = []
  for (const row of rows) {
    // Rows can be iterations or breaks, and breaks don't have iteration-title
    const element = within(row).queryByTestId<HTMLInputElement>('iteration-title')
    if (element) nameElements.push(element.value)
  }
  return nameElements
}
