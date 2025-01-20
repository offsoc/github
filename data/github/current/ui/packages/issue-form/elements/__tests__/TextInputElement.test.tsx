import {act, render, screen} from '@testing-library/react'
import {createRef} from 'react'
import type {IssueFormElementRef} from '../../types'
import {TextInputElementInternal} from '../TextInputElement'
import safeStorage from '@github-ui/safe-storage'

test("ref.focus() triggers the inner input's focus", () => {
  const formControlRef = createRef<IssueFormElementRef>()

  render(<TextInputElementInternal ref={formControlRef} label="cool input" type="input" sessionStorageKey="" />)

  expect(screen.getByLabelText('cool input')).not.toHaveFocus()

  act(() => formControlRef.current?.focus())

  expect(screen.getByLabelText('cool input')).toHaveFocus()
})

test('respects the session storage item', () => {
  const formControlRef = createRef<IssueFormElementRef>()
  const storageKey = 'test-input'
  const storageValue = 'test value'
  const safeSessionStorage = safeStorage('sessionStorage')
  safeSessionStorage.setItem(storageKey, JSON.stringify(storageValue))

  render(
    <TextInputElementInternal ref={formControlRef} label="cool input" type="input" sessionStorageKey={storageKey} />,
  )

  expect(screen.getByLabelText('cool input')).toHaveValue(storageValue)
})
