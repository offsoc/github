import {DragAndDrop, type OnDropArgs, useDragAndDrop, useSortable} from '@github-ui/drag-and-drop'
import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {GrabberIcon, KebabHorizontalIcon, PencilIcon, XIcon} from '@primer/octicons-react'
import type {SxProp} from '@primer/react'
import {ActionList, ActionMenu, Box, Button, Flash, FormControl, IconButton, TextInput} from '@primer/react'
import {useRef, useState} from 'react'

import type {NewSingleOption, PersistedOption} from '../../../api/columns/contracts/single-select'
import {replaceShortCodesWithEmojis} from '../../../helpers/emojis'
import {getInitialState} from '../../../helpers/initial-state'
import {emptySingleSelectOption, type SettingsOption} from '../../../helpers/new-column'
import {useEmojiAutocomplete} from '../../../hooks/common/use-emoji-autocomplete'
import {useReturnFocus} from '../../../hooks/common/use-return-focus'
import {Resources} from '../../../strings'
import {SanitizedHtml} from '../../dom/sanitized-html'
import styles from './single-select-form.module.css'
import {SingleSelectOptionModal} from './single-select-option-modal'
import {SingleSelectToken} from './single-select-token'

interface SingleSelectFormProps extends SxProp {
  options: Array<SettingsOption>
  canRemoveOption: boolean
  onAddOption: (option: NewSingleOption) => void
  onUpdateOption: (updatedOption: SettingsOption) => void
  onRemoveOption: (id: string) => void
  onDrop: ({dragMetadata, dropMetadata, isBefore}: OnDropArgs<string>) => void
}

export const SingleSelectForm = ({
  options,
  onAddOption: external_onAddOption,
  onUpdateOption,
  onRemoveOption,
  canRemoveOption,
  onDrop,
  sx,
}: SingleSelectFormProps) => {
  const {
    projectLimits: {singleSelectColumnOptionsLimit},
  } = getInitialState()

  const dropRef = useRef<HTMLOListElement>(null)
  const optionsLimitReached = options.length >= singleSelectColumnOptionsLimit

  const selectInputByIndex = (index: number) =>
    dropRef.current?.querySelector<HTMLInputElement>(`input[data-option-index='${index}']`)

  const onAddOption = (option: NewSingleOption = emptySingleSelectOption) => {
    external_onAddOption(option)
    setTimeout(() => selectInputByIndex(options.length)?.focus())
  }

  const columnOptions = options.slice(0, singleSelectColumnOptionsLimit)

  return (
    <div className={styles.container}>
      <Box sx={sx} className={styles.listContainer}>
        <DragAndDrop
          items={columnOptions.map(option => {
            return {id: option.id, title: option.name, option}
          })}
          onDrop={onDrop}
          style={{listStyle: 'none'}}
          aria-label={'Single select options'}
          renderOverlay={({option}, index) => (
            <DragAndDrop.Item
              id={option.id}
              index={index}
              title={option.name}
              key={option.id}
              hideSortableItemTrigger
              isDragOverlay
            >
              <SingleSelectItem
                key={option.id}
                option={option}
                index={index}
                enableOptionRemoval={canRemoveOption}
                onRemove={() => onRemoveOption(option.id)}
                onChange={onUpdateOption}
              />
            </DragAndDrop.Item>
          )}
        >
          {options.slice(0, singleSelectColumnOptionsLimit).map((option, index) => (
            <DragAndDrop.Item id={option.id} index={index} title={option.name} key={option.id} hideSortableItemTrigger>
              <SingleSelectItem
                key={option.id}
                option={option}
                index={index}
                enableOptionRemoval={canRemoveOption}
                onRemove={() => onRemoveOption(option.id)}
                onChange={onUpdateOption}
              />
            </DragAndDrop.Item>
          ))}
        </DragAndDrop>

        <div className={styles.addOptionContainer}>
          {optionsLimitReached ? (
            <Flash variant="warning" sx={{p: 2}}>
              {Resources.singleSelectOptionLimitWarning(singleSelectColumnOptionsLimit)}
            </Flash>
          ) : (
            <NewItemCreator onCreate={onAddOption} />
          )}
        </div>
      </Box>
    </div>
  )
}

interface NewItemCreatorProps {
  onCreate: (option?: NewSingleOption) => void
}

const NewItemCreator = ({onCreate}: NewItemCreatorProps) => {
  const [name, setName] = useState('')

  const isValid = name.trim() !== ''

  const onSubmit = () => {
    if (isValid) {
      onCreate({...emptySingleSelectOption, name: replaceShortCodesWithEmojis(name)})
      setName('')
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (event.key === 'Enter') {
      event.preventDefault()
      onSubmit()
    }
  }
  const inputProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)
  const autocompleteProps = useEmojiAutocomplete()

  return (
    <Box as="fieldset" sx={{display: 'flex', gap: 2, border: 0, padding: 0, margin: 0}} onSubmit={onSubmit}>
      <legend className="sr-only">Add option</legend>
      <FormControl sx={{flex: 1}}>
        <FormControl.Label visuallyHidden>Label text</FormControl.Label>
        <InlineAutocomplete {...autocompleteProps} fullWidth>
          <TextInput
            block
            value={name}
            onChange={ev => setName(ev.target.value)}
            placeholder="Add option…"
            autoComplete="false"
            {...inputProps}
          />
        </InlineAutocomplete>
      </FormControl>
      <Button onClick={onSubmit} disabled={!isValid}>
        Add
      </Button>
    </Box>
  )
}

interface SingleSelectItemProps {
  option: PersistedOption | SettingsOption
  index: number
  enableOptionRemoval: boolean
  onRemove: (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void
  onChange: (updatedOption: SettingsOption) => void
}

function SingleSelectItem({index, option, enableOptionRemoval, onRemove, onChange}: SingleSelectItemProps) {
  const {setNodeRef} = useSortable({
    id: option.id,
    data: {metadata: {id: option.id}},
  })

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const {openMoveModal, moveModalItem} = useDragAndDrop()
  useReturnFocus(editModalVisible, editButtonRef)
  useReturnFocus(!!moveModalItem, editButtonRef)

  return (
    <div key={option.id} ref={setNodeRef} className={styles.singleSelectItem} {...testIdProps('singleSelectItem')}>
      <DragAndDrop.DragTrigger />
      <SingleSelectToken option={option} />
      <SanitizedHtml
        sx={{
          flex: 1,
          px: 2,
          color: 'fg.subtle',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          m: 0,
        }}
        as="p"
      >
        {'descriptionHtml' in option ? option.descriptionHtml : option.description}
      </SanitizedHtml>

      <ActionMenu onOpenChange={setMenuOpen} open={menuOpen} anchorRef={editButtonRef}>
        <ActionMenu.Anchor>
          <IconButton
            icon={KebabHorizontalIcon}
            variant="invisible"
            aria-label={`Open field actions for ${option.name}`}
            size="small"
            sx={{color: 'fg.muted'}}
            {...testIdProps('single-select-item-menu-button')}
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Item
              onSelect={() => setEditModalVisible(true)}
              aria-label={`Open edit dialog for ${option.name}`}
              {...testIdProps('single-select-item-edit-button')}
            >
              <ActionList.LeadingVisual>
                <PencilIcon />
              </ActionList.LeadingVisual>
              Edit option
            </ActionList.Item>
            <ActionList.Item
              aria-label={`Other actions for ${option.name}`}
              onSelect={() => openMoveModal(option.name, index)}
              {...testIdProps('single-select-item-move-button')}
            >
              <ActionList.LeadingVisual>
                <GrabberIcon />
              </ActionList.LeadingVisual>
              Move
            </ActionList.Item>
            {enableOptionRemoval && (
              <>
                <ActionList.Divider />
                <ActionList.Item
                  variant="danger"
                  onSelect={onRemove}
                  aria-label={`Remove ${option.name}`}
                  {...testIdProps('single-select-item-delete-button')}
                >
                  <ActionList.LeadingVisual>
                    <XIcon />
                  </ActionList.LeadingVisual>
                  Remove option
                </ActionList.Item>
              </>
            )}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>

      {editModalVisible && (
        <SingleSelectOptionModal
          initialOption={option}
          onCancel={() => setEditModalVisible(false)}
          onSave={updatedOption => {
            setEditModalVisible(false)
            onChange({...option, ...updatedOption})
          }}
        />
      )}
    </div>
  )
}
