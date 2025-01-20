import {act, render, screen} from '@testing-library/react'
import {createRef} from 'react'
import type {IssueFormElementRef} from '../../types'
import {TextAreaElementInternal} from '../TextAreaElement'
import safeStorage from '@github-ui/safe-storage'

test("ref.focus() triggers the CommentBox's focus", () => {
  const formControlRef = createRef<IssueFormElementRef>()

  render(
    <TextAreaElementInternal
      ref={formControlRef}
      label="cool text box"
      type="textarea"
      sessionStorageKey=""
      subject={{
        type: 'issue',
        repository: {
          databaseId: 0,
          nwo: 'owner/repo',
          slashCommandsEnabled: false,
        },
      }}
    />,
  )

  // TODO: We should fetch by label
  // Affects https://github.com/github/accessibility-audits/issues/5297
  expect(screen.getByRole('textbox')).not.toHaveFocus()

  act(() => {
    formControlRef.current?.focus()
  })

  expect(screen.getByRole('textbox')).toHaveFocus()
})

test("ref.focus() triggers the textarea's focus", () => {
  const formControlRef = createRef<IssueFormElementRef>()

  render(
    <TextAreaElementInternal
      ref={formControlRef}
      sessionStorageKey=""
      render="yes please thank you"
      label="cool text box"
      type="textarea"
      subject={{
        type: 'issue',
        repository: {
          databaseId: 0,
          nwo: 'owner/repo',
          slashCommandsEnabled: false,
        },
      }}
    />,
  )

  expect(screen.getByLabelText('cool text box')).not.toHaveFocus()

  formControlRef.current?.focus()

  expect(screen.getByLabelText('cool text box')).toHaveFocus()
})

test('respects the session storage item', () => {
  const formControlRef = createRef<IssueFormElementRef>()
  const storageKey = 'test-input'
  const storageValue = 'test value'
  const safeSessionStorage = safeStorage('sessionStorage')
  safeSessionStorage.setItem(storageKey, JSON.stringify(storageValue))

  render(
    <TextAreaElementInternal
      ref={formControlRef}
      label="cool input"
      type="textarea"
      placeholder="placeholder"
      sessionStorageKey={storageKey}
      subject={{
        type: 'issue',
        repository: {
          databaseId: 0,
          nwo: 'owner/repo',
          slashCommandsEnabled: false,
        },
      }}
    />,
  )

  expect(screen.getByPlaceholderText('placeholder')).toHaveValue(storageValue)
})
