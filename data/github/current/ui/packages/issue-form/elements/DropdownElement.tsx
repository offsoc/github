import {ActionMenu, ActionList} from '@primer/react'
import type {GraphqlFragment, IssueFormElementRef, SessionStorageProps} from '../types'
import {ElementWrapper} from './ElementWrapper'
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {prefixMarkdownTitle} from '../utils/markdown-conversion'
import {graphql, useFragment} from 'react-relay'
import type {DropdownElement_input$data, DropdownElement_input$key} from './__generated__/DropdownElement_input.graphql'
import {VALIDATORS} from '@github-ui/entity-validators'
import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import {uniqueIdForElementInternal} from '../utils/session-storage'

const DEFAULT_CHOICE = 'None'

export type DropdownElementInternalProps = GraphqlFragment<DropdownElement_input$data> & {
  type: 'dropdown'
}

export const DropdownElement = forwardRef(
  (
    {elementRef, sessionStorageKey}: {elementRef: DropdownElement_input$key} & SessionStorageProps,
    ref: ForwardedRef<IssueFormElementRef>,
  ) => {
    const data = useFragment(
      graphql`
        fragment DropdownElement_input on IssueFormElementDropdown {
          __id
          label
          descriptionHTML
          options
          required
          multiple
          defaultOptionIndex: default
        }
      `,
      elementRef,
    )

    if (!data.options) return null
    const elementStorageKey = uniqueIdForElementInternal(sessionStorageKey, '', data.label, data.__id)
    return <DropdownElementInternal {...data} ref={ref} type={'dropdown'} sessionStorageKey={elementStorageKey} />
  },
)

export const DropdownElementInternal = forwardRef(
  (
    {
      sessionStorageKey,
      label,
      options,
      descriptionHTML,
      required,
      multiple,
      defaultOptionIndex,
    }: DropdownElementInternalProps & SessionStorageProps,
    ref: ForwardedRef<IssueFormElementRef>,
  ) => {
    const anchorRef = useRef<HTMLButtonElement>(null)
    const hasDefaultValue = defaultOptionIndex !== undefined && defaultOptionIndex !== null
    // We want to prefix the default `None` option if it's singular, not required, and doesn't have a default option.
    const optionChoices = useMemo(
      () => (multiple || required || hasDefaultValue ? options : [DEFAULT_CHOICE, ...options]),
      [hasDefaultValue, multiple, options, required],
    )

    // If we have a single select, by default choose the first option.
    const defaultSelectionValue = useMemo(() => {
      if (hasDefaultValue && defaultOptionIndex >= 0 && defaultOptionIndex < optionChoices.length) {
        return [optionChoices[defaultOptionIndex]!]
      }

      return multiple || optionChoices.length === 0 ? [] : [optionChoices[0]!]
    }, [defaultOptionIndex, hasDefaultValue, multiple, optionChoices])

    const [selectedItems, setSelectedItems] = useSessionStorage<string[]>(sessionStorageKey, defaultSelectionValue)
    const [validationResult, setValidationResult] = useState<string | undefined>(undefined)

    const toggleSelection = useCallback(
      (option: string) => () => {
        if (selectedItems.includes(option)) {
          // We only allow deselection of the active item if we have multiple select.
          if (multiple) {
            setSelectedItems(selectedItems.filter(item => item !== option))
          }
        } else {
          if (multiple) {
            setSelectedItems([...selectedItems, option])
          } else {
            setSelectedItems([option])
          }
        }
      },
      [multiple, selectedItems, setSelectedItems],
    )

    useImperativeHandle(
      ref,
      () => ({
        focus: () => anchorRef.current?.focus(),
        markdown: () => prefixMarkdownTitle(label, selectedItems.join(', ')),
        validate: () => {
          if (required && selectedItems.length === 0) {
            setValidationResult(VALIDATORS.missingDropdownSelection)
            return false
          }
          return true
        },
        reset: () => {
          setSelectedItems(defaultSelectionValue)
          setValidationResult(undefined)
        },
        hasChanges: () => {
          if (selectedItems.length !== defaultSelectionValue.length) {
            return true
          }

          for (const item of selectedItems) {
            if (!defaultSelectionValue.includes(item)) {
              return true
            }
          }

          return false
        },
        getSessionStorageKey: () => sessionStorageKey,
      }),
      [defaultSelectionValue, label, required, selectedItems, sessionStorageKey, setSelectedItems],
    )

    useEffect(() => {
      if (selectedItems.length > 0) {
        setValidationResult(undefined)
      }
    }, [selectedItems])

    const buttonText =
      (multiple ? 'Selections: ' : '') + (selectedItems.length === 0 ? 'None' : selectedItems.join(', '))

    return (
      <ElementWrapper
        label={label}
        description={descriptionHTML}
        required={required}
        validationResult={validationResult}
        sx={{alignItems: 'start'}}
      >
        {({labelId, descriptionIds}) => (
          <ActionMenu anchorRef={anchorRef}>
            <ActionMenu.Button aria-labelledby={labelId} aria-describedby={descriptionIds}>
              {buttonText}
            </ActionMenu.Button>
            <ActionMenu.Overlay width="medium">
              <ActionList selectionVariant={multiple ? 'multiple' : 'single'}>
                {optionChoices.map((option, index) => (
                  <ActionList.Item
                    key={index}
                    selected={selectedItems.includes(option)}
                    // onSelect closes the menu on selection, onClick does not.
                    // Therefore, this allows to make multiple choices on multiple select without closing.
                    {...(multiple ? {onClick: toggleSelection(option)} : {onSelect: toggleSelection(option)})}
                  >
                    {option}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
      </ElementWrapper>
    )
  },
)

DropdownElement.displayName = 'DropdownElement'
DropdownElementInternal.displayName = 'DropdownElementInternal'
