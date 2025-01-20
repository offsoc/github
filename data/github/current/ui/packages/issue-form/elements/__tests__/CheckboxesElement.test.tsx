import {render, screen} from '@testing-library/react'
import {CheckboxesElementInternal} from '../CheckboxesElement'
import {createRef} from 'react'
import type {IssueFormElementRef} from '../../types'
import safeStorage from '@github-ui/safe-storage'

test("ref.focus() triggers first available checkbox's focus", () => {
  const formControlRef = createRef<IssueFormElementRef>()
  const checkboxOptions = [
    {
      label: 'Checkbox 1',
      labelHTML: 'Checkbox 1',
      required: false,
    },
    {
      label: 'Checkbox 2',
      labelHTML: 'Checkbox 2',
      required: false,
    },
  ]

  render(
    <CheckboxesElementInternal
      ref={formControlRef}
      checkboxOptions={checkboxOptions}
      label=""
      type="checkboxes"
      sessionStorageKey=""
    />,
  )

  expect(screen.getByLabelText('Checkbox 1')).not.toHaveFocus()
  expect(screen.getByLabelText('Checkbox 2')).not.toHaveFocus()

  formControlRef.current?.focus()

  expect(screen.getByLabelText('Checkbox 1')).toHaveFocus()
  expect(screen.getByLabelText('Checkbox 2')).not.toHaveFocus()
})

test('respects the session storage value', () => {
  const storageKey = 'test-input'
  const storageValue = [true, false]
  const safeSessionStorage = safeStorage('sessionStorage')
  safeSessionStorage.setItem(storageKey, JSON.stringify(storageValue))

  const formControlRef = createRef<IssueFormElementRef>()
  const checkboxOptions = [
    {
      label: 'Checkbox 1',
      labelHTML: 'Checkbox 1',
      required: false,
    },
    {
      label: 'Checkbox 2',
      labelHTML: 'Checkbox 2',
      required: false,
    },
  ]
  render(
    <CheckboxesElementInternal
      ref={formControlRef}
      checkboxOptions={checkboxOptions}
      label=""
      type="checkboxes"
      sessionStorageKey={storageKey}
    />,
  )

  expect(screen.getByLabelText('Checkbox 1')).toBeChecked()
  expect(screen.getByLabelText('Checkbox 2')).not.toBeChecked()
})
