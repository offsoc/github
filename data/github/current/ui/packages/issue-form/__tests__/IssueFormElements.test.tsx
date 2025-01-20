import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {IssueFormElements} from '../IssueFormElements'
import {createRef, type RefObject} from 'react'
import type {IssueFormElement, IssueFormRef} from '../types'
import {VALIDATORS} from '@github-ui/entity-validators'
import type {Subject, SubjectType} from '@github-ui/comment-box/subject'

const subject = {
  type: 'issue' as SubjectType,
  repository: {
    databaseId: 0,
    nwo: 'primer/components',
    slashCommandsEnabled: false,
  },
}

type CommonPropsType = {
  outputRef: RefObject<IssueFormRef>
  sessionStorageKey: string
  subject: Subject
}

const constructCommonProps = (): CommonPropsType => ({
  outputRef: createRef<IssueFormRef>(),
  sessionStorageKey: 'test',
  subject,
})

test('Renders the IssueFormElement with simple markdown', () => {
  const elementsWithMarkdown = [
    {
      type: 'markdown',
      content: '### Hello, world!',
    },
    {
      type: 'input',
      label: 'Unique input',
    },
  ] as IssueFormElement[]

  const sharedProps = constructCommonProps()
  render(<IssueFormElements elements={elementsWithMarkdown} {...sharedProps} />)
  const {outputRef} = sharedProps
  expect(screen.getByText('Unique input')).toBeInTheDocument()
  expect(outputRef.current!.markdown()).toContain('### Unique input')
  expect(outputRef.current!.getInvalidInputs()).toHaveLength(0)
})

test('Renders the IssueFormElement with a dropdown', () => {
  const elementsWithDropdown = [
    {
      type: 'dropdown',
      label: 'Single select dropdown',
      multiple: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  ] as IssueFormElement[]

  const sharedProps = constructCommonProps()
  render(<IssueFormElements elements={elementsWithDropdown} {...sharedProps} />)
  const {outputRef} = sharedProps

  expect(screen.getByText('Single select dropdown')).toBeInTheDocument()
  // Defaults to None because it is not required and it is single select.

  expect(screen.getByText('None')).toBeInTheDocument()
  expect(screen.queryByText('Option 2')).not.toBeInTheDocument()

  expect(outputRef.current!.markdown()).toContain('None')
  expect(outputRef.current!.markdown()).not.toContain('Option 2')
  expect(outputRef.current!.getInvalidInputs()).toHaveLength(0)
})

test('Renders the IssueFormElement with a required dropdown', () => {
  const elementsWithDropdown = [
    {
      type: 'dropdown',
      label: 'Single select dropdown',
      multiple: false,
      required: true,
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  ] as IssueFormElement[]

  const sharedProps = constructCommonProps()
  render(<IssueFormElements elements={elementsWithDropdown} {...sharedProps} />)
  const {outputRef} = sharedProps

  expect(screen.getByText('Single select dropdown')).toBeInTheDocument()
  expect(screen.getByText('Option 1')).toBeInTheDocument()
  expect(screen.queryByText('Option 2')).not.toBeInTheDocument()

  expect(outputRef.current!.markdown()).toContain('Option 1')
  expect(outputRef.current!.markdown()).not.toContain('Option 2')
  expect(outputRef.current!.getInvalidInputs()).toHaveLength(0)
})

test('Renders the singular IssueDropdownFormElement with default value', () => {
  const elementsWithDropdown = [
    {
      type: 'dropdown',
      label: 'Single select dropdown',
      multiple: false,
      required: true,
      options: ['Option 1', 'Option 2', 'Option 3'],
      defaultOptionIndex: 2,
    },
  ] as IssueFormElement[]

  render(<IssueFormElements elements={elementsWithDropdown} {...constructCommonProps()} />)

  expect(screen.getByText('Single select dropdown')).toBeInTheDocument()
  expect(screen.getByText('Option 3')).toBeInTheDocument()
  expect(screen.queryByText('Option 2')).not.toBeInTheDocument()
})

test('Renders the multiple IssueDropdownFormElement with default value', () => {
  const elementsWithDropdown = [
    {
      type: 'dropdown',
      label: 'Single select dropdown',
      multiple: true,
      options: ['Option 1', 'Option 2', 'Option 3'],
      defaultOptionIndex: 1,
    },
  ] as IssueFormElement[]

  render(<IssueFormElements elements={elementsWithDropdown} {...constructCommonProps()} />)
  expect(screen.getByText('Single select dropdown')).toBeInTheDocument()
  expect(screen.getByText('Selections: Option 2')).toBeInTheDocument()
})

test('Correctly asserts not valid with missing text field', () => {
  const requiredInputElementMissingText = [
    {
      type: 'input',
      label: 'Unique input',
      required: true,
    },
  ] as IssueFormElement[]

  const sharedProps = constructCommonProps()
  render(<IssueFormElements elements={requiredInputElementMissingText} {...sharedProps} />)
  const {outputRef} = sharedProps

  expect(screen.getByText('Unique input')).toBeInTheDocument()
  expect(screen.queryByText(VALIDATORS.fieldCanNotBeEmpty)).not.toBeInTheDocument()

  act(() => {
    expect(outputRef.current!.getInvalidInputs()).toHaveLength(1)
  })

  // We now show the validation error message after calling validate inputs
  expect(screen.getByText(VALIDATORS.fieldCanNotBeEmpty)).toBeInTheDocument()
})

test('Correctly asserts not valid with missing checkbox field', () => {
  const requiredCheckboxElementMissing = [
    {
      type: 'checkboxes',
      label: 'Unique checkbox',
      checkboxOptions: [
        {
          label: 'Option 1',
          labelHTML: 'Option 1',
          required: true,
        },
      ],
    },
  ] as IssueFormElement[]

  const sharedProps = constructCommonProps()
  render(<IssueFormElements elements={requiredCheckboxElementMissing} {...sharedProps} />)
  const {outputRef} = sharedProps

  expect(screen.getByText('Unique checkbox')).toBeInTheDocument()
  expect(screen.queryByText(VALIDATORS.checkboxInAGroupMustBeSelected)).not.toBeInTheDocument()

  act(() => {
    expect(outputRef.current!.getInvalidInputs()).toHaveLength(1)
  })

  // Primer also sets the visually hidden text to the error message, so it appears twice. (Maybe this is a bug in primer?)
  expect(screen.getAllByText(VALIDATORS.checkboxInAGroupMustBeSelected)).toHaveLength(2)

  act(() => {
    outputRef.current!.resetInputs()
  })

  expect(screen.queryByText(VALIDATORS.checkboxInAGroupMustBeSelected)).not.toBeInTheDocument()
})

test('Correctly asserts not valid with missing dropdown field', () => {
  const requiredDropdownElementMissing = [
    {
      type: 'dropdown',
      label: 'Unique dropdown',
      multiple: true,
      required: true,
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  ] as IssueFormElement[]

  const sharedProps = constructCommonProps()
  render(<IssueFormElements elements={requiredDropdownElementMissing} {...sharedProps} />)
  const {outputRef} = sharedProps

  expect(screen.queryByText(VALIDATORS.missingDropdownSelection)).not.toBeInTheDocument()

  act(() => {
    expect(outputRef.current!.getInvalidInputs()).toHaveLength(1)
  })

  expect(screen.getByText(VALIDATORS.missingDropdownSelection)).toBeInTheDocument()

  act(() => {
    outputRef.current!.resetInputs()
  })

  expect(screen.queryByText(VALIDATORS.missingDropdownSelection)).not.toBeInTheDocument()
})

test('Correct asserts not valid textarea field', () => {
  const requiredTextareaElementMissing = [
    {
      type: 'textarea',
      label: 'Unique textarea',
      required: true,
    },
  ] as IssueFormElement[]

  const sharedProps = constructCommonProps()
  render(<IssueFormElements elements={requiredTextareaElementMissing} {...sharedProps} />)
  const {outputRef} = sharedProps

  expect(screen.queryByText(VALIDATORS.fieldCanNotBeEmpty)).not.toBeInTheDocument()

  act(() => {
    expect(outputRef.current!.getInvalidInputs()).toHaveLength(1)
  })

  expect(screen.getByText(VALIDATORS.fieldCanNotBeEmpty)).toBeInTheDocument()

  act(() => {
    outputRef.current!.resetInputs()
  })

  expect(screen.queryByText(VALIDATORS.fieldCanNotBeEmpty)).not.toBeInTheDocument()
})

test('Correctly sets the default value for a TextArea if supplied by ID', () => {
  const textareaElement = [
    {
      itemId: 'unique-id',
      type: 'textarea',
      label: 'Unique textarea',
      value: 'default value to be ignored',
    },
  ] as IssueFormElement[]

  const uniqueOverride = 'special value'
  render(
    <IssueFormElements
      elements={textareaElement}
      {...constructCommonProps()}
      defaultValuesById={{
        'unique-id': uniqueOverride,
      }}
    />,
  )

  // Find the textarea element by role and check if the default value is set
  const textarea = screen.getByRole('textbox')
  expect(textarea).toBeInTheDocument()
  expect(textarea).toHaveValue(uniqueOverride)
})

test('Correctly sets the default value for a TextInput if supplied by ID', () => {
  const textInputElement = [
    {
      itemId: 'unique-id',
      type: 'input',
      label: 'Unique input',
      value: 'default value to be ignored',
    },
  ] as IssueFormElement[]

  const uniqueOverride = 'special value'
  render(
    <IssueFormElements
      elements={textInputElement}
      {...constructCommonProps()}
      defaultValuesById={{
        'unique-id': uniqueOverride,
      }}
    />,
  )

  expect(screen.getByText('Unique input')).toBeInTheDocument()
  expect(screen.getByDisplayValue(uniqueOverride)).toBeInTheDocument()
})
