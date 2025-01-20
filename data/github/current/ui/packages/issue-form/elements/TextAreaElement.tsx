import {validateTextField} from '@github-ui/entity-validators'

import {prefixMarkdownTitle} from '../utils/markdown-conversion'
import {graphql, useFragment} from 'react-relay'
import type {TextAreaElement_input$data, TextAreaElement_input$key} from './__generated__/TextAreaElement_input.graphql'
import {CommentBox} from '@github-ui/comment-box/CommentBox'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {Textarea} from '@primer/react'
import type {CommentBoxHandle} from '@github-ui/comment-box/CommentBox'
import {forwardRef, type ForwardedRef, useMemo, useState, useRef, useImperativeHandle, useEffect} from 'react'
import type {IssueFormElementRef, GraphqlFragment, CommentBoxProps, SharedElementProps} from '../types'
import {safeGetDefaultValue} from '../utils/default-value'
import {ElementWrapper} from './ElementWrapper'
import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import {uniqueIdForElementInternal} from '../utils/session-storage'
export type TextAreaElementInternalProps = GraphqlFragment<TextAreaElement_input$data> & {
  type: 'textarea'
}

type SharedTextAreaProps = CommentBoxProps &
  SharedElementProps & {onSave?: () => void; setIsFileUploading?: (value: boolean) => void}

type TextAreaElementProps = {
  elementRef: TextAreaElement_input$key
} & SharedTextAreaProps

export const TextAreaElement = forwardRef(
  ({elementRef, sessionStorageKey, ...props}: TextAreaElementProps, ref: ForwardedRef<IssueFormElementRef>) => {
    const data = useFragment(
      graphql`
        fragment TextAreaElement_input on IssueFormElementTextarea {
          __id
          itemId: id
          label
          descriptionHTML
          placeholder
          value
          required
          render
        }
      `,
      elementRef,
    )
    const elementStorageKey = uniqueIdForElementInternal(sessionStorageKey, '', data.label, data.__id)
    return (
      <TextAreaElementInternal {...data} {...props} ref={ref} type={'textarea'} sessionStorageKey={elementStorageKey} />
    )
  },
)

export const TextAreaElementInternal = forwardRef(
  (
    {
      itemId,
      sessionStorageKey,
      label,
      descriptionHTML,
      placeholder,
      required,
      value,
      render,
      subject,
      defaultValuesById,
      commentBoxConfig,
      onSave,
      setIsFileUploading,
    }: TextAreaElementInternalProps & SharedTextAreaProps,
    ref: ForwardedRef<IssueFormElementRef>,
  ) => {
    const defaultValue = useMemo(
      () => safeGetDefaultValue({id: itemId, value, defaultValuesById}),
      [itemId, value, defaultValuesById],
    )

    const [textValue, setValue] = useSessionStorage<string>(sessionStorageKey, defaultValue)
    const textAreaCommentBoxRef = useRef<HTMLTextAreaElement & CommentBoxHandle>(null)
    const [validationResult, setValidationResult] = useState<string | undefined>(undefined)

    useImperativeHandle(
      ref,
      () => ({
        focus: () => textAreaCommentBoxRef.current?.focus(),
        markdown: () => prefixMarkdownTitle(label, textValue),
        validate: () => {
          const validity = validateTextField(textValue, required ?? false)
          setValidationResult(validity.errorMessage)
          return validity.isValid
        },
        reset: () => {
          setValue(defaultValue)
          setValidationResult(undefined)
        },
        hasChanges: () => textValue !== defaultValue,
        getSessionStorageKey: () => sessionStorageKey,
      }),
      [defaultValue, label, required, sessionStorageKey, setValue, textValue],
    )

    useEffect(() => {
      // If we had a validation error and the user has fixed it, clear the error
      if (validationResult && validateTextField(textValue, required ?? false).isValid) {
        setValidationResult(undefined)
      }
    }, [required, textValue, validationResult])

    // Once https://github.com/github/collaboration-workflows-flex/issues/178 is fixed
    // we can go back to using the `ElementWrapper` which encapsulates the label, description and validation.
    // See `TextInputElement` for an example.
    return (
      <ElementWrapper
        label={label}
        required={required}
        description={descriptionHTML}
        validationResult={validationResult}
        sx={{alignItems: 'stretch'}}
      >
        {({labelId, descriptionIds}) =>
          // If we have a render tag - we don't want to render the markdown editor.
          // See: https://docs.github.com/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema#textarea
          // Render tag is used to represent a code view - and therefore we should also style it as such.
          render ? (
            <Textarea
              aria-labelledby={labelId}
              aria-describedby={descriptionIds}
              ref={textAreaCommentBoxRef}
              placeholder={placeholder ?? undefined}
              value={textValue}
              onChange={e => setValue(e.target.value)}
              sx={{
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
                width: '100%',
              }}
            />
          ) : (
            <CommentBox
              aria-labelledby={labelId}
              aria-describedby={descriptionIds}
              ref={textAreaCommentBoxRef}
              placeholder={placeholder ?? undefined}
              value={textValue as SafeHTMLString}
              onChange={setValue}
              onSave={onSave}
              saveButtonTrailingIcon={false}
              userSettings={commentBoxConfig}
              subject={subject}
              setIsFileUploading={setIsFileUploading}
            />
          )
        }
      </ElementWrapper>
    )
  },
)

TextAreaElement.displayName = 'TextAreaElement'
TextAreaElementInternal.displayName = 'TextAreaElementInternal'
