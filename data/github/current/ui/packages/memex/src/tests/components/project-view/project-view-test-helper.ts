import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Resources} from '../../../client/strings'

export async function findSaveChangesButton() {
  return screen.findByRole('button', {name: 'Save'})
}

export async function findRevertChangesButton() {
  return screen.findByTestId('filter-actions-reset-changes-button')
}

export async function findClearFilterQueryButton() {
  return screen.findByRole('button', {name: 'Clear filter'})
}

export async function expectSaveChangesButtonToHaveFocus() {
  const saveChangesButton = await findSaveChangesButton()
  expect(saveChangesButton).toHaveFocus()
}

export async function expectRevertChangesButtonToHaveFocus() {
  const revertChangesButton = await findRevertChangesButton()
  expect(revertChangesButton).toHaveFocus()
}

export async function expectClearFilterQueryButtonToHaveFocus() {
  const clearFilterQueryButton = await findClearFilterQueryButton()
  expect(clearFilterQueryButton).toHaveFocus()
}

export async function expectFilterInputToHaveFocus() {
  const filterInput = await findFilterInput()
  expect(filterInput).toHaveFocus()
}

export async function enterFilterText(text: string) {
  const filterInput = await findFilterInput()
  await userEvent.type(filterInput, text)
}

export async function findFilterInput() {
  return screen.findByLabelText('Filter by keyword or by field')
}

export async function expectAddNewItemButtonToHaveFocus() {
  const addNewItemButton = await screen.findByRole('button', {name: Resources.createNewItemOrAddExistingIssueAriaLabel})
  expect(addNewItemButton).toHaveFocus()
}
