import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {useSyncedState} from '@github-ui/use-synced-state'
import {FocusKeys} from '@primer/behaviors'
import {
  ActionList,
  type ActionListItemProps,
  ActionMenu,
  AnchoredOverlay,
  type AnchoredOverlayProps,
  Box,
  Button,
  type ButtonProps,
  FormControl,
  Octicon,
  TextInput,
} from '@primer/react'
import {subYears} from 'date-fns'
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'

import type {CustomColumnKind} from '../../api/columns/contracts/domain'
import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {SettingsFieldOptionHeaderUI, SettingsFieldOptionSave} from '../../api/stats/contracts'
import {assertNever} from '../../helpers/assert-never'
import {replaceShortCodesWithEmojis} from '../../helpers/emojis'
import {createInitialIterations} from '../../helpers/iteration-builder'
import {defaultIterationDuration, durationToDays} from '../../helpers/iterations'
import {filterEmptyOptions} from '../../helpers/new-column'
import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {useEmojiAutocomplete} from '../../hooks/common/use-emoji-autocomplete'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useMemexRootHeight} from '../../hooks/use-memex-root-height'
import {useViews} from '../../hooks/use-views'
import type {ColumnModel} from '../../models/column-model'
import type {AddColumnRequest} from '../../state-providers/columns/columns-state-provider'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import {useReservedColumnNames} from '../../state-providers/columns/use-reserved-column-names'
import {Resources} from '../../strings'
import {validateColumnTitle} from '../../validations/validate-column-title'
import {getColumnIcon, getColumnText} from '../column-detail-helpers'
import {NewIterationOptions} from '../fields/iteration/new-iteration-options'
import {SingleSelectForm} from '../fields/single-select/single-select-form'
import {useAddField} from './hooks/use-add-field'
import {useColumnSettings} from './use-column-settings'

function getDefaultColumnTitle(numUserDefinedColumns: number) {
  return `${Resources.newField}${numUserDefinedColumns > 0 ? ` ${numUserDefinedColumns + 1}` : ''}`
}

type ModalProps = {
  isOpen: boolean
  anchorRef: React.RefObject<HTMLElement>
  setOpen: (open: boolean) => void
  onSave: (newCol: ColumnModel) => void
  limitedTypes?: Array<CustomColumnKind>
}

type ColumnDropdownItem = ActionListItemProps & {
  leadingVisual: React.FunctionComponent<React.PropsWithChildren<unknown>>
  text: string
  type: CustomColumnKind
}

// extact the possible gesture strings for comparison in the close handler
type CloseOverlayGesture = Parameters<NonNullable<AnchoredOverlayProps['onClose']>>[0]

const preventDefaultMouseDown = (e: React.MouseEvent) => e.preventDefault()

export const AddColumnModal = memo(function AddColumnModal({
  setOpen: setShowNewModal,
  isOpen,
  onSave,
  anchorRef,
  limitedTypes,
}: ModalProps) {
  const {allColumns} = useAllColumns()
  const numUserDefinedColumns = allColumns.filter(c => c.userDefined).length
  const defaultColumnTitle = getDefaultColumnTitle(numUserDefinedColumns)
  const {currentView} = useViews()
  const [title, setTitle] = useSyncedState(defaultColumnTitle, {isPropUpdateDisabled: isOpen})
  const initialFocusRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const {reservedColumnNames} = useReservedColumnNames()

  const {clientHeight} = useMemexRootHeight({})

  const maxOverlayHeight = useMemo(() => {
    if (!clientHeight) return 'unset'
    if (!anchorRef.current) return clientHeight
    const topDiff = window.pageYOffset + anchorRef.current.getBoundingClientRect().top
    return clientHeight - topDiff
  }, [anchorRef, clientHeight])

  const {options, addOption, updateOption, removeOption, onDrop, canRemoveOption, revertMutations} = useColumnSettings({
    ui: SettingsFieldOptionHeaderUI,
  })

  const {addField} = useAddField()

  const allFieldTypes: Array<ColumnDropdownItem> = useMemo(() => {
    return [
      {
        leadingVisual: getColumnIcon(MemexColumnDataType.Text),
        text: getColumnText(MemexColumnDataType.Text),
        key: 'Dropdown-text',
        type: MemexColumnDataType.Text,
        onMouseDown: preventDefaultMouseDown,
        ...testIdProps('column-type-text'),
      },
      {
        leadingVisual: getColumnIcon(MemexColumnDataType.Number),
        text: getColumnText(MemexColumnDataType.Number),
        key: 'Dropdown-number',
        type: MemexColumnDataType.Number,
        onMouseDown: preventDefaultMouseDown,
        ...testIdProps('column-type-number'),
      },
      {
        leadingVisual: getColumnIcon(MemexColumnDataType.Date),
        text: getColumnText(MemexColumnDataType.Date),
        key: 'Dropdown-date',
        type: MemexColumnDataType.Date,
        onMouseDown: preventDefaultMouseDown,
        ...testIdProps('column-type-date'),
      },
      {
        leadingVisual: getColumnIcon(MemexColumnDataType.SingleSelect),
        text: getColumnText(MemexColumnDataType.SingleSelect),
        key: 'Dropdown-singleselect',
        type: MemexColumnDataType.SingleSelect,
        onMouseDown: preventDefaultMouseDown,
        ...testIdProps('column-type-single-select'),
      },
      {
        leadingVisual: getColumnIcon(MemexColumnDataType.Iteration),
        text: getColumnText(MemexColumnDataType.Iteration),
        key: 'Dropdown-iteration',
        type: MemexColumnDataType.Iteration,
        onMouseDown: preventDefaultMouseDown,
        ...testIdProps('column-type-iteration'),
      },
    ]
  }, [])

  const items =
    limitedTypes && limitedTypes.length ? allFieldTypes.filter(item => limitedTypes.includes(item.type)) : allFieldTypes
  const [selectedColumn, setSelectedColumn] = useState<CustomColumnKind>(
    () => not_typesafe_nonNullAssertion(items[0]).type,
  )
  const [dropdownSelection, setDropdownSelection] = useState(not_typesafe_nonNullAssertion(items[0])) // default is MemexColumnDataType.Text

  const resetTitle = useCallback(() => {
    setTitle(defaultColumnTitle)
  }, [defaultColumnTitle, setTitle])

  // Ideally we would be able to make the signature here: (item?: ColumnDropdownItem) => void
  // but it doesn't seem like this is supported by the onChange prop of the DropdownMenu currently
  const onDropdownChange: (item?: ActionListItemProps) => void = useCallback(
    item => {
      // item can be undefined if the item that has been activated is the same as the
      // one that is currently selected
      if (item) {
        const dropDownItem = item as ColumnDropdownItem
        if (title === defaultColumnTitle) {
          if (dropDownItem.type === MemexColumnDataType.Iteration) {
            const iterationColumns = allColumns.filter(c => c.userDefined && c.name.startsWith('Iteration')).length
            setTitle(Resources.newIterationField(iterationColumns > 0 ? ` ${iterationColumns + 1}` : ''))
          } else {
            resetTitle()
          }
        }
        setDropdownSelection(dropDownItem)
        setSelectedColumn(dropDownItem.type)
      }
    },
    [allColumns, defaultColumnTitle, resetTitle, setTitle, title],
  )

  // Use a static reference for this to avoid re-rendering and closing the datepicker
  const minIterationStartDate = useMemo(() => subYears(new Date(), 1), [])
  const [iterationStartDate, setIterationStartDate] = useState(new Date()) // default is today
  const [iterationDuration, setIterationDuration] = useState(defaultIterationDuration)
  const [isIterationOptionsValid, setIsIterationOptionsValid] = useState(true)

  const resetFormState = useCallback(() => {
    resetTitle()
    revertMutations()

    setIterationStartDate(new Date())
    setIterationDuration(defaultIterationDuration)
    setIsIterationOptionsValid(true)

    const item = items[0]
    if (item) {
      setDropdownSelection(item)
      setSelectedColumn(item.type)
    }
  }, [items, resetTitle, revertMutations])

  const createApiRequest: (name: string, type: CustomColumnKind) => AddColumnRequest = useCallback(
    (name, type) => {
      switch (type) {
        case MemexColumnDataType.SingleSelect: {
          // Remove the temporary in-memory ID from new items
          const filteredOptions = filterEmptyOptions(options).map(({id, ...o}) => o)
          return {
            name,
            type,
            settings: filteredOptions.length > 0 ? {options: filteredOptions} : {},
          }
        }
        case MemexColumnDataType.Iteration: {
          const selectedStartDate = iterationStartDate
          const duration = durationToDays(iterationDuration)
          const startDay = selectedStartDate.getDay() !== 0 ? selectedStartDate.getDay() : 7 // as sunday has a value of 7 for iterationStartDay
          const {iterations: activeIterations, completedIterations} = createInitialIterations(
            name,
            {duration, selectedStartDate},
            3,
          )
          return {
            name,
            type,
            settings: {
              configuration: {
                startDay,
                duration,
                iterations: activeIterations,
                completedIterations,
              },
            },
          }
        }
        case MemexColumnDataType.Number:
        case MemexColumnDataType.Text:
        case MemexColumnDataType.Date: {
          return {
            name,
            type,
            settings: undefined,
          }
        }
        default: {
          assertNever(type)
        }
      }
    },
    [iterationStartDate, options, iterationDuration],
  )

  useEffect(() => {
    if (isOpen) {
      // ensure the modal is visible
      containerRef.current?.scrollIntoView()
    }
  }, [isOpen])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(replaceShortCodesWithEmojis(e.currentTarget.value))
    },
    [setTitle],
  )

  const defaultButtonProps: Omit<ButtonProps, 'children'> = {
    size: 'small',
    type: 'button',
  }

  const hasAtLeastOneOptionIfSingleSelect = useCallback(() => {
    if (selectedColumn !== MemexColumnDataType.SingleSelect) return true

    return filterEmptyOptions(options).length > 0
  }, [options, selectedColumn])

  const {isValid: isTitleValid, message: validationMessage} = validateColumnTitle(
    {allColumns, reservedColumnNames},
    title,
  )
  const isColumnValid = hasAtLeastOneOptionIfSingleSelect() && isTitleValid

  const closeModal = useCallback(
    (gesture?: CloseOverlayGesture) => {
      if (gesture !== 'click-outside') {
        resetFormState()
      }

      setShowNewModal(false)
    },
    [setShowNewModal, resetFormState],
  )

  const {postStats} = usePostStats()

  const saveNewColumn = useCallback(async () => {
    if (!isColumnValid) {
      return
    }

    closeModal()

    const request = createApiRequest(title, selectedColumn)

    await addField.perform({request, viewNumber: currentView?.number})

    if (addField.status.current.status === 'succeeded') {
      onSave(addField.status.current.data)
    }

    postStats({
      name: SettingsFieldOptionSave,
      ui: SettingsFieldOptionHeaderUI,
      memexProjectColumnId: addField.status.current.data?.id,
    })
  }, [
    isColumnValid,
    closeModal,
    createApiRequest,
    title,
    selectedColumn,
    addField,
    currentView?.number,
    postStats,
    onSave,
  ])

  const handleKeydown = useCallback(
    (e: React.KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === 'Enter') {
        saveNewColumn()
        e.preventDefault()
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      } else if (e.key === 'Escape') {
        closeModal()
        e.preventDefault()
      }
    },
    [closeModal, saveNewColumn],
  )
  const inputCompositionProps = useIgnoreKeyboardActionsWhileComposing(handleKeydown)

  const SelectedIcon = getColumnIcon(selectedColumn)

  const optionsLength = options.length
  const lastOptionsLength = useRef(options.length)

  useEffect(() => {
    lastOptionsLength.current = optionsLength
  })

  const saveText = selectedColumn === 'iteration' ? 'Save and create' : 'Save'

  const autocompleteProps = useEmojiAutocomplete()

  if (!isOpen) return null
  return (
    <AnchoredOverlay
      anchorRef={anchorRef}
      renderAnchor={null}
      open={isOpen}
      onClose={closeModal}
      width="medium"
      overlayProps={{
        ...testIdProps('add-column-menu'),
        initialFocusRef,
        role: 'dialog',
        'aria-label': 'Create a new field configuration',
        sx: maxOverlayHeight
          ? {maxHeight: maxOverlayHeight, overflowY: 'auto', overflowX: 'visible'}
          : {overflow: 'visible'},
      }}
      focusZoneSettings={{bindKeys: FocusKeys.Tab, containerRef: anchorRef}}
    >
      <form onSubmit={e => e.preventDefault()}>
        <FormControl required sx={{p: 3, pb: 0, mb: 2, position: 'relative'}}>
          <FormControl.Label>Field name</FormControl.Label>
          <InlineAutocomplete {...autocompleteProps} fullWidth>
            <TextInput
              {...inputCompositionProps}
              // select all text on focus
              onFocus={e => e.currentTarget.select()}
              value={title}
              className={isTitleValid ? '' : 'error'}
              onChange={handleTitleChange}
              ref={initialFocusRef}
              aria-invalid={!isTitleValid}
              {...testIdProps('add-column-name-input')}
              validationStatus={!isTitleValid ? 'error' : undefined}
            />
          </InlineAutocomplete>
          {!isTitleValid && <FormControl.Validation variant="error">{validationMessage}</FormControl.Validation>}
        </FormControl>
        <FormControl id="add-column-type" sx={{px: 3, mb: 2}}>
          <FormControl.Label>Field type</FormControl.Label>
          <ActionMenu>
            <ActionMenu.Button
              aria-label="Type"
              sx={{
                width: '100%',
                pr: 2,
                gridTemplateColumns: 'min-content 1fr min-content',
                '[data-component=text]': {textAlign: 'left'},
                '[data-component=buttonContent]': {flex: 0},
              }}
              id="add-column-type"
              {...testIdProps('add-column-type')}
            >
              <Box sx={{flexGrow: 1, alignItems: 'center', display: 'flex'}}>
                <div>
                  <Octicon icon={SelectedIcon} sx={{mr: 1, color: 'fg.muted'}} />
                </div>
                <div>{dropdownSelection.text}</div>
              </Box>
            </ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList selectionVariant="single">
                {items.map((item, index) => (
                  <ActionList.Item
                    key={index}
                    selected={dropdownSelection === item}
                    onSelect={() => onDropdownChange(item)}
                    {...item}
                  >
                    <ActionList.LeadingVisual>
                      <item.leadingVisual />
                    </ActionList.LeadingVisual>
                    {item.text}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </FormControl>
        {selectedColumn === MemexColumnDataType.SingleSelect && (
          <Box sx={{border: 0, padding: 0, margin: 0, px: 3, pt: 2, flexWrap: 'wrap'}} as="fieldset">
            <Box sx={{fontWeight: 'bold'}} as="legend">
              Options
            </Box>
            <SingleSelectForm
              options={options}
              canRemoveOption={canRemoveOption}
              onAddOption={addOption}
              onUpdateOption={updateOption}
              onRemoveOption={removeOption}
              onDrop={onDrop}
            />
          </Box>
        )}
        {selectedColumn === MemexColumnDataType.Iteration && (
          <Box sx={{padding: 0, margin: 0, px: 3, pt: 2, flexWrap: 'wrap', border: 0}} as="fieldset">
            <Box sx={{fontWeight: 'bold'}} as="legend">
              Options
            </Box>
            <Box sx={{pl: 2}}>
              <NewIterationOptions
                duration={iterationDuration}
                onDurationChange={setIterationDuration}
                onValidChange={setIsIterationOptionsValid}
                startDate={iterationStartDate}
                onStartDateChange={setIterationStartDate}
                minStartDate={minIterationStartDate}
              />
            </Box>
          </Box>
        )}
        <Box
          sx={{
            justifyContent: 'flex-end',
            px: 3,
            py: 2,
            mt: 4,
            borderTop: '1px solid',
            borderColor: 'border.muted',
            display: 'flex',
            backgroundColor: theme => `${theme.colors.canvas.default}`,
          }}
        >
          <Button {...defaultButtonProps} onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button
            variant="primary"
            {...testIdProps('add-column-modal-save')}
            {...defaultButtonProps}
            onClick={saveNewColumn}
            disabled={!isColumnValid || !isIterationOptionsValid}
            sx={{ml: 1}}
          >
            {saveText}
          </Button>
        </Box>
      </form>
    </AnchoredOverlay>
  )
})
