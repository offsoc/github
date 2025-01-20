import {DragAndDrop, KeyboardCode, type KeyboardCodes, type OnDropArgs} from '@github-ui/drag-and-drop'
import {testIdProps} from '@github-ui/test-id-props'
import {Heading, TreeView} from '@primer/react'
import {clsx} from 'clsx'
import {Children, type MutableRefObject, type PropsWithChildren, type ReactElement, useMemo} from 'react'

import {ItemsProvider} from './context/ItemsContext'
import {PropertiesProvider, useNestedListViewProperties} from './context/PropertiesContext'
import {type SelectionContextProps, SelectionProvider} from './context/SelectionContext'
import {TitleProvider, type TitleProviderProps, useNestedListViewTitle} from './context/TitleContext'
import {NestedListViewErrorBoundary} from './ErrorBoundary'
import styles from './NestedListView.module.css'
import type {NestedListViewHeader} from './NestedListViewHeader/NestedListViewHeader'

export type NestedListViewProps = PropsWithChildren<{
  /**
   * An optional element to contain bulk actions, a 'Select all' checkbox, etc.
   */
  header?: ReactElement<typeof NestedListViewHeader>
  /**
   * Controls item's selection mode; bulk actions are allowed if true. Defaults to not selectable.
   */
  isSelectable?: boolean
  /**
   * What a single list item should be called. Used to customize assistive text about how many list items are
   * selected. Defaults to 'list item'.
   */
  singularUnits?: string
  /**
   * What many list items are called. Used to customize assistive text about how many list items are selected.
   * Defaults to 'list items'.
   */
  pluralUnits?: string
  /**
   * Optional ID of an element that labels the Nested List View. When provided, this takes the place of the default sr-only title.
   */
  ariaLabelledBy?: string
  /*
   * listRef: Optional reference to the `ul` element of the Nested List View
   */
  listRef?: MutableRefObject<HTMLUListElement | undefined>
  /**
   * Optional parameter to determine whether the Nested List View is collapsible from the header component
   */
  isCollapsible?: boolean
  /*
   * An option to disable dragging and selection on the Nested List View
   */
  isReadOnly?: boolean
  className?: string
  /**
   * Optional callback for drag and drop
   */
  dragAndDropProps?: {
    /**
     * Callback for onDrop
     */
    onDrop: (args: OnDropArgs<string>) => void
    /**
     * React element to render as the overlay when dragging
     */
    renderOverlay: (dragMetadata: {id: string; title: string}, index: number) => ReactElement
    /**
     * Optional parameter (required later) to to be used with drag and drop to map the items
     */
    items: Array<{id: string; title: string}>
  }
}> &
  Omit<TitleProviderProps, 'children'> &
  Pick<SelectionContextProps, 'totalCount'> &
  Partial<Pick<SelectionContextProps, 'selectedCount'>>

const defaultDragAndDropProps = {
  onDrop: () => {},
  renderOverlay: () => <></>,
  items: [],
}

const keyboardCodes: KeyboardCodes = {
  start: [KeyboardCode.Space],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space],
}

export const NestedListView = ({
  title,
  titleHeaderTag,
  children,
  totalCount,
  selectedCount = 0,
  singularUnits,
  pluralUnits,
  isSelectable,
  isCollapsible = false,
  isReadOnly = false,
  ...rest
}: PropsWithChildren<NestedListViewProps>): JSX.Element => {
  const countOnPage = useMemo(() => Children.toArray(children).length, [children])

  return (
    <PropertiesProvider isCollapsible={isCollapsible} isReadOnly={isReadOnly}>
      <TitleProvider title={title} titleHeaderTag={titleHeaderTag}>
        <SelectionProvider
          countOnPage={countOnPage}
          selectedCount={selectedCount}
          totalCount={totalCount}
          singularUnits={singularUnits}
          pluralUnits={pluralUnits}
          isSelectable={isSelectable && !isReadOnly}
        >
          <ItemsProvider>
            <NestedListViewInternal {...rest}>{children}</NestedListViewInternal>
          </ItemsProvider>
        </SelectionProvider>
      </TitleProvider>
    </PropertiesProvider>
  )
}

const NestedListViewInternal = ({
  header,
  children,
  ariaLabelledBy: externalAriaLabelledBy,
  className,
  dragAndDropProps = defaultDragAndDropProps,
  ...rest
}: Omit<NestedListViewProps, 'title' | 'titleHeaderTag'>): JSX.Element => {
  const {idPrefix, isExpanded, isCollapsible, isReadOnly} = useNestedListViewProperties()
  const {title, titleHeaderTag} = useNestedListViewTitle()
  const nestedListViewContainerTitleId = externalAriaLabelledBy ?? `${idPrefix}-nested-list-view-container-title`

  return (
    <div
      {...testIdProps(`${idPrefix}-nested-list-view-container`)}
      className={clsx(
        styles.container,
        styles.responsiveContainer,
        isCollapsible && isReadOnly && styles.collapsible,
        className,
      )}
    >
      {!externalAriaLabelledBy && (
        <Heading
          className="sr-only"
          as={titleHeaderTag}
          id={nestedListViewContainerTitleId}
          {...testIdProps('list-view-title')}
        >
          {title}
        </Heading>
      )}
      {header}
      {isExpanded && (
        <NestedListViewErrorBoundary>
          <DragAndDrop as="div" keyboardCodes={keyboardCodes} {...dragAndDropProps}>
            <TreeView aria-labelledby={nestedListViewContainerTitleId} {...testIdProps('list-view-items')} {...rest}>
              {children}
            </TreeView>
          </DragAndDrop>
        </NestedListViewErrorBoundary>
      )}
    </div>
  )
}
