import type {SafeHTMLString} from '@github-ui/safe-html'
import type {IssueFormElement} from '../../types'
import {createUniqueIdForElement, uniqueIdForElementInternal} from '../session-storage'

test('correctly creates basic session storage unique ID', () => {
  const textInputMock: IssueFormElement = {
    type: 'input',
    label: 'test',
  }

  const textInputId = createUniqueIdForElement('test', textInputMock, 2)
  expect(textInputId).toBe('test-input-test-2')

  const textAreaMock: IssueFormElement = {
    type: 'textarea',
    label: 'test',
  }

  const textAreaId = createUniqueIdForElement('another', textAreaMock, 1)
  expect(textAreaId).toBe('another-textarea-test-1')

  const checkboxMock: IssueFormElement = {
    type: 'checkboxes',
    label: 'required boxes',
    checkboxOptions: [
      {
        label: 'one',
        labelHTML: 'one',
        required: true,
      },
    ],
  }

  const checkboxId = createUniqueIdForElement('different-prefix', checkboxMock, 3)
  expect(checkboxId).toBe('different-prefix-checkboxes-required boxes-3')

  const dropdownMock: IssueFormElement = {
    type: 'dropdown',
    label: 'dropdown',
    options: ['one'],
  }

  const dropdownId = createUniqueIdForElement('test', dropdownMock, 4)
  expect(dropdownId).toBe('test-dropdown-dropdown-4')

  const mockMarkdown: IssueFormElement = {
    type: 'markdown',
    verifiedHTML: 'a lot of markdown' as SafeHTMLString,
  }

  const markdownId = createUniqueIdForElement('test', mockMarkdown, 5)
  expect(markdownId).toBe('')
})

test('relay based IDs construct correctly without a type value', () => {
  const relayId = uniqueIdForElementInternal('test', '', 'label', 'specialid')
  expect(relayId).toBe('test-label-specialid')
})
