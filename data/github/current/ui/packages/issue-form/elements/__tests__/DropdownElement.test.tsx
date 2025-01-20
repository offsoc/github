import {render, screen} from '@testing-library/react'
import {createRef} from 'react'
import type {IssueFormElementRef} from '../../types'
import {DropdownElementInternal} from '../DropdownElement'
import safeStorage from '@github-ui/safe-storage'

test("ref.focus() triggers the menu anchor's focus", () => {
  const formControlRef = createRef<IssueFormElementRef>()
  const options = ['Option 1', 'Option 2']

  render(
    <DropdownElementInternal
      ref={formControlRef}
      label="select stuff"
      options={options}
      type="dropdown"
      sessionStorageKey=""
    />,
  )

  // TODO: We should fetch by label
  // Affects https://github.com/github/accessibility-audits/issues/5297
  expect(screen.getByRole('button')).not.toHaveFocus()

  formControlRef.current?.focus()

  expect(screen.getByRole('button')).toHaveFocus()
})

test('Default value with value 0 works correctly', () => {
  const formControlRef = createRef<IssueFormElementRef>()
  const options = ['Option 1', 'Option 2']

  render(
    <DropdownElementInternal
      ref={formControlRef}
      label="select stuff"
      options={options}
      type="dropdown"
      defaultOptionIndex={0}
      sessionStorageKey=""
    />,
  )

  expect(screen.getByText('Option 1')).toBeInTheDocument()
  expect(screen.queryByText('Option 2')).not.toBeInTheDocument()
})

test('Default value works correctly', () => {
  const formControlRef = createRef<IssueFormElementRef>()
  const options = ['Option 1', 'Option 2']

  render(
    <DropdownElementInternal
      ref={formControlRef}
      label="select stuff"
      options={options}
      type="dropdown"
      defaultOptionIndex={1}
      sessionStorageKey=""
    />,
  )

  expect(screen.getByText('Option 2')).toBeInTheDocument()
  expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
})

test('Invalid default value is ignored', () => {
  const formControlRef = createRef<IssueFormElementRef>()
  const options = ['Option 1', 'Option 2']

  render(
    <DropdownElementInternal
      ref={formControlRef}
      label="select stuff"
      options={options}
      type="dropdown"
      defaultOptionIndex={5}
      sessionStorageKey=""
    />,
  )

  expect(screen.getByText('Option 1')).toBeInTheDocument()
  expect(screen.queryByText('Option 2')).not.toBeInTheDocument()
})

test('Invalid default value is ignored on multiple selection', () => {
  const formControlRef = createRef<IssueFormElementRef>()
  const options = ['Option 1', 'Option 2']

  render(
    <DropdownElementInternal
      ref={formControlRef}
      label="select stuff"
      options={options}
      multiple={true}
      type="dropdown"
      defaultOptionIndex={5}
      sessionStorageKey=""
    />,
  )

  expect(screen.getByText('Selections: None')).toBeInTheDocument()
  expect(screen.queryByText('Option 1', {exact: false})).not.toBeInTheDocument()
})

test('First default value works on multiple selection', () => {
  const formControlRef = createRef<IssueFormElementRef>()
  const options = ['Option 1', 'Option 2']

  render(
    <DropdownElementInternal
      ref={formControlRef}
      label="select stuff"
      options={options}
      multiple={true}
      type="dropdown"
      defaultOptionIndex={0}
      sessionStorageKey=""
    />,
  )

  expect(screen.getByText('Selections: Option 1')).toBeInTheDocument()
  expect(screen.queryByText('Option 2', {exact: false})).not.toBeInTheDocument()
})

test('respects the session storage item and ignores default value', () => {
  const storageKey = 'test-input'
  const storageValue = ['Option 2']
  const safeSessionStorage = safeStorage('sessionStorage')
  safeSessionStorage.setItem(storageKey, JSON.stringify(storageValue))

  const formControlRef = createRef<IssueFormElementRef>()
  const options = ['Option 1', 'Option 2']

  render(
    <DropdownElementInternal
      ref={formControlRef}
      label="select stuff"
      options={options}
      multiple={true}
      type="dropdown"
      defaultOptionIndex={0}
      sessionStorageKey={storageKey}
    />,
  )

  expect(screen.getByText('Selections: Option 2')).toBeInTheDocument()
  expect(screen.queryByText('Option 1', {exact: false})).not.toBeInTheDocument()
})
