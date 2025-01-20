import {SafeHTMLBox, SafeHTMLText, type SafeHTMLString} from '@github-ui/safe-html'
import {Checkbox, CheckboxGroup, FormControl} from '@primer/react'
import type {GraphqlFragment, IssueFormElementRef, SessionStorageProps} from '../types'
import {graphql, useFragment} from 'react-relay'
import {type ForwardedRef, forwardRef, useImperativeHandle, useMemo, useRef, useState} from 'react'
import {prefixMarkdownCheckbox, prefixMarkdownTitle} from '../utils/markdown-conversion'
import type {
  CheckboxesElement_input$data,
  CheckboxesElement_input$key,
} from './__generated__/CheckboxesElement_input.graphql'
import {VALIDATORS} from '@github-ui/entity-validators'
import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import {uniqueIdForElementInternal} from '../utils/session-storage'

export type CheckboxesElementInternalProps = GraphqlFragment<CheckboxesElement_input$data> & {
  type: 'checkboxes'
}

export const CheckboxesElement = forwardRef(
  (
    {elementRef, sessionStorageKey}: {elementRef: CheckboxesElement_input$key} & SessionStorageProps,
    ref: ForwardedRef<IssueFormElementRef>,
  ) => {
    const data = useFragment(
      graphql`
        fragment CheckboxesElement_input on IssueFormElementCheckboxes {
          __id
          label
          descriptionHTML
          checkboxOptions: options {
            label
            labelHTML
            required
          }
        }
      `,
      elementRef,
    )

    if (!data.checkboxOptions) return null
    const elementStorageKey = uniqueIdForElementInternal(sessionStorageKey, '', data.label, data.__id)
    return <CheckboxesElementInternal {...data} type={'checkboxes'} ref={ref} sessionStorageKey={elementStorageKey} />
  },
)

export const CheckboxesElementInternal = forwardRef(
  (
    {sessionStorageKey, label, descriptionHTML, checkboxOptions}: CheckboxesElementInternalProps & SessionStorageProps,
    ref: ForwardedRef<IssueFormElementRef>,
  ) => {
    const firstCheckboxRef = useRef<HTMLInputElement>(null)
    const defaultCheckedValues = useMemo(() => Array(checkboxOptions.length).fill(false), [checkboxOptions.length])

    const [selectedItems, setSelectedItems] = useSessionStorage<boolean[]>(sessionStorageKey, defaultCheckedValues)
    const [validationResult, setValidationResult] = useState<string | undefined>(undefined)

    useImperativeHandle(
      ref,
      () => ({
        focus: () => firstCheckboxRef.current?.focus(),
        markdown: () => {
          const bodyContent = checkboxOptions
            .map((option, checkboxIndex) => prefixMarkdownCheckbox(option.label, selectedItems[checkboxIndex]!))
            .join('\n')

          return prefixMarkdownTitle(label, bodyContent)
        },
        validate: () => {
          for (const [checkboxIndex, checkbox] of checkboxOptions.entries()) {
            if (checkbox.required && !selectedItems[checkboxIndex]) {
              setValidationResult(VALIDATORS.checkboxInAGroupMustBeSelected)
              return false
            }
          }

          return true
        },
        reset: () => {
          setSelectedItems(defaultCheckedValues)
          setValidationResult(undefined)
        },
        hasChanges: () => !defaultCheckedValues.every((value, index) => value === selectedItems[index]),
        getSessionStorageKey: () => sessionStorageKey,
      }),
      [checkboxOptions, defaultCheckedValues, label, selectedItems, sessionStorageKey, setSelectedItems],
    )

    return (
      <CheckboxGroup
        sx={{
          color: 'var(--fgColor-default, var(--color-fg-default))',
          my: '15px',
        }}
      >
        <CheckboxGroup.Label
          sx={{color: 'var(--fgColor-default, var(--color-fg-default))', fontSize: ['14px'], fontWeight: 600}}
        >
          {label}
        </CheckboxGroup.Label>
        {descriptionHTML && (
          <CheckboxGroup.Caption sx={{color: 'var(--fgColor-muted, var(--color-fg-subtle))', fontSize: '12px'}}>
            <SafeHTMLBox html={descriptionHTML as SafeHTMLString} className="markdown-body note text-small mb-2" />
          </CheckboxGroup.Caption>
        )}
        {checkboxOptions.map((option, checkboxIndex) => (
          <FormControl key={checkboxIndex} required={option.required ?? false}>
            <Checkbox
              ref={checkboxIndex === 0 ? firstCheckboxRef : undefined}
              checked={selectedItems[checkboxIndex]}
              onChange={() => {
                if (option.required && !selectedItems[checkboxIndex]) {
                  // Optimistically assume they selected the only missing required checkbox
                  setValidationResult(undefined)
                }
                setSelectedItems(selectedItems.map((item, index) => (index === checkboxIndex ? !item : item)))
              }}
            />
            <FormControl.Label
              sx={{
                fontWeight: 400,
                // Color the required asterisk
                '> span > span:last-of-type': {color: 'var(--fgColor-danger, var(--color-danger-fg))'},
              }}
            >
              <SafeHTMLText html={option.labelHTML as SafeHTMLString} />
            </FormControl.Label>
          </FormControl>
        ))}
        {validationResult && <CheckboxGroup.Validation variant="error">{validationResult}</CheckboxGroup.Validation>}
      </CheckboxGroup>
    )
  },
)

CheckboxesElement.displayName = 'CheckboxesElement'
CheckboxesElementInternal.displayName = 'CheckboxesElementInternal'
