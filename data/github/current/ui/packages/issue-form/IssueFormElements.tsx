import {Box} from '@primer/react'
import {MarkdownElement, MarkdownElementInternal} from './elements/MarkdownElement'
import {DropdownElement, DropdownElementInternal} from './elements/DropdownElement'
import {TextAreaElement, TextAreaElementInternal} from './elements/TextAreaElement'
import {CheckboxesElement, CheckboxesElementInternal} from './elements/CheckboxesElement'
import {TextInputElement, TextInputElementInternal} from './elements/TextInputElement'
import type {IssueFormElement, IssueFormElementRef, IssueFormRef, CommentBoxProps, SharedElementProps} from './types'
import {type RefObject, createRef, useImperativeHandle, useMemo} from 'react'
import type {IssueFormElements_templateElements$key} from './__generated__/IssueFormElements_templateElements.graphql'
import {graphql, readInlineData} from 'react-relay'
import {createUniqueIdForElement} from './utils/session-storage'
import {clearSessionStorage} from '@github-ui/use-safe-storage/session-storage'

export const IssueFormElementsTemplateElementsFragment = graphql`
  fragment IssueFormElements_templateElements on IssueForm @inline {
    elements {
      __typename
      ... on IssueFormElementInput {
        ...TextInputElement_input
      }
      ... on IssueFormElementTextarea {
        ...TextAreaElement_input
      }
      ... on IssueFormElementMarkdown {
        ...MarkdownElement_input
      }
      ... on IssueFormElementDropdown {
        ...DropdownElement_input
      }
      ... on IssueFormElementCheckboxes {
        ...CheckboxesElement_input
      }
    }
  }
`

type CommonProps = {
  outputRef: RefObject<IssueFormRef>
  onSave?: () => void
  setIsFileUploading?: (value: boolean) => void
} & CommentBoxProps &
  SharedElementProps

type IssueFormElementsViaQueryProps = {
  issueFormRef: IssueFormElements_templateElements$key
} & CommonProps

export type IssueFormElementsViaPayloadProps = {
  elements: IssueFormElement[]
} & CommonProps

export const IssueFormElements = (props: IssueFormElementsViaQueryProps | IssueFormElementsViaPayloadProps) => {
  if ('elements' in props) {
    return <IssueFormElementsViaPayload {...props} />
  } else {
    return <IssueFormElementsViaQuery {...props} />
  }
}

const IssueFormElementsViaPayload = ({
  elements,
  outputRef,
  sessionStorageKey,
  ...props
}: IssueFormElementsViaPayloadProps) => {
  const inputRefs = useInputElementReferences(elements.length, outputRef)

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}>
      {elements.map((element, index) => {
        const storageKey = createUniqueIdForElement(sessionStorageKey, element, index)
        switch (element.type) {
          case 'markdown':
            return <MarkdownElementInternal key={index} {...element} />
          case 'textarea':
            return (
              <TextAreaElementInternal
                key={index}
                {...element}
                ref={inputRefs[index]}
                sessionStorageKey={storageKey}
                {...props}
              />
            )
          case 'input':
            return (
              <TextInputElementInternal
                key={index}
                {...element}
                ref={inputRefs[index]}
                sessionStorageKey={storageKey}
                {...props}
              />
            )
          case 'dropdown':
            return (
              <DropdownElementInternal key={index} {...element} ref={inputRefs[index]} sessionStorageKey={storageKey} />
            )
          case 'checkboxes':
            return (
              <CheckboxesElementInternal
                key={index}
                {...element}
                ref={inputRefs[index]}
                sessionStorageKey={storageKey}
              />
            )
        }
      })}
    </Box>
  )
}

const IssueFormElementsViaQuery = ({issueFormRef, outputRef, ...props}: IssueFormElementsViaQueryProps) => {
  // eslint-disable-next-line no-restricted-syntax
  const data = readInlineData<IssueFormElements_templateElements$key>(
    IssueFormElementsTemplateElementsFragment,
    issueFormRef,
  )

  const inputRefs = useInputElementReferences(data.elements.length, outputRef)

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}>
      {data.elements.map((element, index) => {
        switch (element.__typename) {
          case 'IssueFormElementMarkdown':
            return (
              <Box sx={{mb: 3}}>
                <MarkdownElement key={index} elementRef={element} />
              </Box>
            )
          case 'IssueFormElementInput':
            return <TextInputElement key={index} elementRef={element} ref={inputRefs[index]} {...props} />
          case 'IssueFormElementDropdown':
            return <DropdownElement key={index} elementRef={element} ref={inputRefs[index]} {...props} />
          case 'IssueFormElementTextarea':
            return <TextAreaElement key={index} elementRef={element} ref={inputRefs[index]} {...props} />
          case 'IssueFormElementCheckboxes':
            return <CheckboxesElement key={index} elementRef={element} ref={inputRefs[index]} {...props} />
          default:
            return null
        }
      })}
    </Box>
  )
}

const useInputElementReferences = (elementCount: number, outputRef: RefObject<IssueFormRef>) => {
  const inputRefs = useMemo<Array<RefObject<IssueFormElementRef>>>(
    () => Array.from({length: elementCount}, () => createRef()),
    [elementCount],
  )

  useImperativeHandle(
    outputRef,
    () => ({
      markdown: () =>
        inputRefs
          .map(ref => ref.current?.markdown() ?? '')
          .filter(markdown => markdown.length > 0)
          .join('\n\n'),
      getInvalidInputs: () =>
        inputRefs.map(ref => ref.current).filter((ref): ref is IssueFormElementRef => ref !== null && !ref.validate()),
      validateInputs: () => !inputRefs.map(ref => ref.current?.validate() ?? true).some(isValid => !isValid),
      resetInputs: () => {
        for (const ref of inputRefs) {
          ref.current?.reset()
        }

        // Also clear the local storage
        outputRef.current?.clearSessionStorage()
      },
      hasChanges: () => inputRefs.some(ref => ref.current?.hasChanges() ?? false),
      clearSessionStorage: () => {
        const storageKeys = inputRefs
          .map(ref => ref.current?.getSessionStorageKey())
          .filter((k): k is string => k !== null)

        clearSessionStorage(storageKeys)
      },
    }),
    [inputRefs, outputRef],
  )

  return inputRefs
}
