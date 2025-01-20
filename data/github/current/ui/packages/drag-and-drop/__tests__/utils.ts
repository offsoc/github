import {setupUserEvent} from '@github-ui/react-core/test-utils'
import {act, screen, within} from '@testing-library/react'

import type {DragAndDropMoveOptions} from '../utils/types'

const userEvent = setupUserEvent()

export async function selectMoveAction(action: DragAndDropMoveOptions) {
  await userEvent.selectOptions(screen.getByRole('combobox', {name: 'Action *'}), action)

  act(() => jest.runAllTimers())
}

export async function selectRow(rowNumber?: number | string) {
  const element = screen.getByRole('spinbutton', {name: 'Move to row *'})
  await userEvent.clear(element)
  if (rowNumber !== undefined) {
    await userEvent.type(element, `${rowNumber}`)
  }

  screen.getByRole('button', {name: 'Move item'}).focus()

  act(() => jest.runAllTimers())
}

export async function selectBefore(title?: string) {
  const element = screen.getByRole('combobox', {name: 'Move item before *'})
  await userEvent.clear(element)
  if (title) {
    await userEvent.type(element, title)
  }
  await userEvent.keyboard('{Enter}')

  screen.getByRole('button', {name: 'Move item'}).focus()

  act(() => jest.runAllTimers())
}

export async function selectAfter(title?: string) {
  const element = screen.getByRole('combobox', {name: 'Move item after *'})
  await userEvent.clear(element)
  if (title) {
    await userEvent.type(element, title)
  }
  await userEvent.keyboard('{Enter}')

  screen.getByRole('button', {name: 'Move item'}).focus()

  act(() => jest.runAllTimers())
}

export async function submitModal() {
  await userEvent.click(screen.getByRole('button', {name: 'Move item'}))

  act(() => jest.runAllTimers())
}

export function expectAnnouncement(announcement: string) {
  expect(screen.getByTestId('js-global-screen-reader-notice-assertive')).toHaveTextContent(announcement)
}

export function expectErrorMessage(message: string) {
  expect(within(screen.getByRole('dialog')).getByText(message)).toBeInTheDocument()
}

export function expectFlashMessage(message: string) {
  expect(screen.getByTestId('drag-and-drop-move-modal-flash')).toHaveTextContent(message)
}
