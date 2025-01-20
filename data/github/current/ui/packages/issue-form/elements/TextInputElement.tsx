import {validateTextField} from '@github-ui/entity-validators'
import {TextInput} from '@primer/react'
import {prefixMarkdownTitle} from '../utils/markdown-conversion'
import type {
  TextInputElement_input$data,
  TextInputElement_input$key,
} from './__generated__/TextInputElement_input.graphql'
import {safeGetDefaultValue} from '../utils/default-value'
import {forwardRef, type ForwardedRef, useMemo, useState, useRef, useImperativeHandle, useEffect} from 'react'
import {useFragment, graphql} from 'react-relay'
import type {IssueFormElementRef, GraphqlFragment, SharedElementProps} from '../types'
import {ElementWrapper} from './ElementWrapper'
import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import {uniqueIdForElementInternal} from '../utils/session-storage'

export type TextInputElementInternalProps = GraphqlFragment<TextInputElement_input$data> & {
  type: 'input'
}

type TextInputElementProps = {
  elementRef: TextInputElement_input$key
} & SharedElementProps

export const TextInputElement = forwardRef(
  ({elementRef, sessionStorageKey, ...props}: TextInputElementProps, ref: ForwardedRef<IssueFormElementRef>) => {
    const data = useFragment(
      graphql`
        fragment TextInputElement_input on IssueFormElementInput {
          __id
          itemId: id
          label
          descriptionHTML
          placeholder
          value
          required
        }
      `,
      elementRef,
    )

    const elementStorageKey = uniqueIdForElementInternal(sessionStorageKey, '', data.label, data.__id)
    return (
      <TextInputElementInternal ref={ref} {...data} {...props} type={'input'} sessionStorageKey={elementStorageKey} />
    )
  },
)

export const TextInputElementInternal = forwardRef(
  (
    {
      sessionStorageKey,
      itemId,
      label,
      descriptionHTML,
      placeholder,
      required,
      value,
      defaultValuesById,
    }: TextInputElementInternalProps & SharedElementProps,
    ref: ForwardedRef<IssueFormElementRef>,
  ) => {
    const defaultValue = useMemo(
      () => safeGetDefaultValue({id: itemId, value, defaultValuesById}),
      [itemId, value, defaultValuesById],
    )

    const [textValue, setValue] = useSessionStorage<string>(sessionStorageKey, defaultValue)
    const inputRef = useRef<HTMLInputElement>(null)
    const [validationResult, setValidationResult] = useState<string | undefined>(undefined)

    useImperativeHandle(
      ref,
      () => ({
        focus: () => inputRef.current?.focus(),
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

    return (
      <ElementWrapper
        label={label}
        description={descriptionHTML}
        required={required}
        validationResult={validationResult}
      >
        {({labelId, descriptionIds}) => (
          <TextInput
            ref={inputRef}
            aria-labelledby={labelId}
            aria-describedby={descriptionIds}
            placeholder={placeholder ?? undefined}
            value={textValue}
            onChange={e => setValue(e.target.value)}
            sx={{
              maxWidth: '44em',
              width: '100%',
            }}
          />
        )}
      </ElementWrapper>
    )
  },
)

TextInputElement.displayName = 'TextInputElement'
TextInputElementInternal.displayName = 'TextInputElementInternal'
