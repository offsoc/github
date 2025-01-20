import {SearchIcon, SlidersIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton, Spinner, TextInput} from '@primer/react'
import {useState, type ReactNode} from 'react'
import {clsx} from 'clsx'
import styles from './FileFilter.module.css'

export const NO_FILE_EXTENSION = 'No extension'

type FileFilterInputProps = {
  filterText?: string
  onFilterTextChange?: (filterText: string) => void
}

export function FileFilterLoading({filterText, onFilterTextChange}: FileFilterInputProps) {
  return (
    <div className="d-flex flex-nowrap gap-2">
      <TextInput
        block
        aria-label="Filter files…"
        leadingVisual={SearchIcon}
        placeholder="Filter files…"
        value={filterText}
        onChange={event => onFilterTextChange?.(event.target.value)}
      />
      <ActionMenu>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton unsafeDisableTooltip={true} aria-label="Filter" icon={SlidersIcon} className="flex-shrink-0" />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay className={clsx(styles.filterLoadingHeight)}>
          <div
            className={clsx(
              'd-flex',
              'flex-column',
              'flex-justify-center',
              'flex-items-center',
              styles.filterLoadingHeight,
            )}
          >
            <Spinner size="medium" />
          </div>
        </ActionMenu.Overlay>
      </ActionMenu>
    </div>
  )
}

export type FileFilterBaseProps = {
  fileExtensions?: Set<string>
  unselectedFileExtensions?: Set<string>
  onFilterChange?: (type: 'selectFileExtension' | 'unselectFileExtension', payload: {extension: string}) => void
  additionalFilterGroups?: ReactNode
} & FileFilterInputProps

export function FileFilterShared({
  filterText: initialFilterText,
  onFilterTextChange,
  fileExtensions,
  unselectedFileExtensions,
  onFilterChange,
  additionalFilterGroups,
}: FileFilterBaseProps) {
  const [filterText, setFilterText] = useState(initialFilterText)

  const setSelectedFileFilters = (select: boolean, extension: string) => {
    const action = select ? 'selectFileExtension' : 'unselectFileExtension'
    onFilterChange?.(action, {extension})
  }

  const extensions = Array.from(fileExtensions || [])
    .filter(ext => ext !== NO_FILE_EXTENSION)
    .sort()
  const fileExtensionIsSelected = (ext: string) => !unselectedFileExtensions?.has(ext)
  const noExtensionPresent = fileExtensions?.has(NO_FILE_EXTENSION)

  return (
    <div className="d-flex flex-nowrap gap-2">
      <TextInput
        block
        aria-label="Filter files…"
        leadingVisual={SearchIcon}
        placeholder="Filter files…"
        value={filterText}
        onChange={event => {
          setFilterText(event.target.value)
          onFilterTextChange?.(event.target.value)
        }}
      />
      <ActionMenu>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton unsafeDisableTooltip={true} aria-label="Filter" icon={SlidersIcon} className="flex-shrink-0" />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Group selectionVariant="multiple">
              <ActionList.GroupHeading>File extensions</ActionList.GroupHeading>
              {extensions.map((ext: string) => {
                const selected = fileExtensionIsSelected(ext)
                return (
                  <ActionList.Item
                    key={ext}
                    selected={selected}
                    onSelect={() => setSelectedFileFilters(!selected, ext)}
                  >
                    {`${ext}`}
                  </ActionList.Item>
                )
              })}
              {noExtensionPresent && (
                <ActionList.Item
                  key={NO_FILE_EXTENSION}
                  selected={fileExtensionIsSelected(NO_FILE_EXTENSION)}
                  onSelect={() =>
                    setSelectedFileFilters(!fileExtensionIsSelected(NO_FILE_EXTENSION), NO_FILE_EXTENSION)
                  }
                >
                  {NO_FILE_EXTENSION}
                </ActionList.Item>
              )}
            </ActionList.Group>
            {additionalFilterGroups}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </div>
  )
}
