import {testIdProps} from '@github-ui/test-id-props'
import {SearchIcon} from '@primer/octicons-react'
import {Autocomplete, FormControl, Select, TextInput} from '@primer/react'
import {clsx} from 'clsx'
import {forwardRef, useCallback, useMemo, useState} from 'react'

import {DragAndDropMoveOptions} from '../utils/types'
import styles from './MoveModalForm.module.css'

type AutocompleteItem = {text: string; id: string}

interface InputProps {
  /**
   * The list of items to move
   */
  options: Array<{title: string; id: string | number}>
  /**
   * The move action selection
   */
  moveAction: string | undefined
  /**
   * Callback to update the index of the item being moved
   */
  onPositionChange: (index?: number) => void
  /**
   * Callback to update the dropdown selection
   */
  onMoveActionChange: (moveAction: DragAndDropMoveOptions) => void
  /**
   * The initial position of the item being moved
   */
  initialPosition: number
  /**
   * The error message to display
   */
  error?: string
}

const INPUT_LABEL = 'move-modal-input-label'

const isValidBeforeMove = (index: number, initialIndex: number) => {
  return index !== initialIndex + 1 && index !== initialIndex
}

const isValidAfterMove = (index: number, initialIndex: number) => {
  return index !== initialIndex - 1 && index !== initialIndex
}

/**
 * A form that allows the user to move an item to a new position in the list.
 *
 * @param props InputProps
 */
export const MoveModalForm = forwardRef<HTMLInputElement, InputProps>(function NameInput(
  {onPositionChange, onMoveActionChange, moveAction, options, initialPosition, error},
  ref,
) {
  const [filterValue, setFilterValue] = useState('')

  const autocompleteTemplateList = useMemo(() => {
    const initialIndex = initialPosition - 1

    const beforeOptions: AutocompleteItem[] = []
    const afterOptions: AutocompleteItem[] = []

    for (let index = 0; index < options.length; index++) {
      /* Checks if */
      if (isValidBeforeMove(index, initialIndex)) {
        beforeOptions.push({
          text: options[index]?.title || '',
          id: `${index + 1}`,
        })
      }

      if (isValidAfterMove(index, initialIndex)) {
        afterOptions.push({
          text: options[index]?.title || '',
          id: `${index + 1}`,
        })
      }
    }
    return {before: beforeOptions, after: afterOptions}
  }, [initialPosition, options])

  const [selectedAutocomplete, setSelectedAutocomplete] = useState<AutocompleteItem>({
    text: '',
    id: '0',
  })

  const onPositionInputChange = useCallback(
    (value?: string | number) => {
      if (value === undefined || value === '') {
        return onPositionChange(undefined)
      }
      const parsedValue = typeof value === 'string' ? parseInt(value, 10) : value
      onPositionChange(parsedValue - 1)
    },
    [onPositionChange],
  )

  const autocompleteSelection = useCallback(
    (selectedItem: AutocompleteItem) => {
      setSelectedAutocomplete(selectedItem)
      onPositionInputChange(selectedItem.id.toString())
    },
    [onPositionInputChange],
  )

  const fuzzySearchFilter = (item: AutocompleteItem) => {
    return item.text.toLowerCase().includes(filterValue.toLowerCase())
  }

  const onSelectedChange = (selected: AutocompleteItem | AutocompleteItem[]) => {
    if (!Array.isArray(selected)) {
      return
    }

    const newlySelected = selected.find(function (item) {
      if (item?.id) {
        return selectedAutocomplete.id !== item.id
      }
    })

    if (newlySelected) {
      autocompleteSelection(newlySelected)
    }
  }

  const onFilterChange = useMemo(
    () => (value: string) => {
      const item = autocompleteTemplateList[moveAction === DragAndDropMoveOptions.BEFORE ? 'before' : 'after'].find(
        i => i.text === value,
      )
      if (item) {
        autocompleteSelection(item)
      } else {
        onPositionInputChange(value)
      }
    },
    [autocompleteTemplateList, moveAction, autocompleteSelection, onPositionInputChange],
  )

  const errorProps = error
    ? {
        'aria-invalid': true,
        'aria-describedby': 'position-validation',
      }
    : null

  return (
    <div className={clsx(styles.form)}>
      <FormControl required>
        <FormControl.Label>Action</FormControl.Label>
        <Select
          block
          onChange={e => {
            onMoveActionChange(e.currentTarget.value as DragAndDropMoveOptions)
            onPositionChange(initialPosition)
          }}
        >
          {Object.values(DragAndDropMoveOptions).map(item => (
            <Select.Option key={item} value={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </FormControl>
      <FormControl required>
        <FormControl.Label id={INPUT_LABEL}>{moveAction}</FormControl.Label>
        {moveAction === DragAndDropMoveOptions.ROW ? (
          <TextInput
            block
            min={1}
            max={options.length}
            defaultValue={initialPosition}
            type="number"
            onChange={ev => onPositionInputChange(ev.target.value)}
            ref={ref}
            {...errorProps}
            {...testIdProps('drag-and-drop-move-modal-position-input')}
          />
        ) : (
          <Autocomplete>
            <Autocomplete.Input
              placeholder={'Position'}
              value={selectedAutocomplete.text}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                onFilterChange(event.target.value)
                setFilterValue(event.target.value)
              }}
              openOnFocus={false}
              leadingVisual={SearchIcon}
              className="width-full"
              ref={ref}
              {...errorProps}
              {...testIdProps('drag-and-drop-move-modal-position-input')}
            />
            <Autocomplete.Overlay className={clsx(styles.autoComplete)}>
              <Autocomplete.Menu
                items={autocompleteTemplateList[moveAction === DragAndDropMoveOptions.BEFORE ? 'before' : 'after']}
                aria-labelledby={INPUT_LABEL}
                selectedItemIds={[selectedAutocomplete.id.toString()]}
                onSelectedChange={onSelectedChange}
                filterFn={fuzzySearchFilter}
              />
            </Autocomplete.Overlay>
          </Autocomplete>
        )}
        {error && (
          <FormControl.Validation id="position-validation" variant="error">
            {error}
          </FormControl.Validation>
        )}
      </FormControl>
    </div>
  )
})
