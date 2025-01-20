import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import chunk from 'lodash-es/chunk'
import {memo, useMemo} from 'react'
import type {Row} from 'react-table'

import {getDraftItemUpdateColumnAction} from '../../../features/grouping/helpers'
import type {GroupingMetadataWithSource} from '../../../features/grouping/types'
import {getGroupTestId} from '../../../helpers/table-group-utilities'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {Omnibar} from '../../omnibar/omnibar'
import {CELL_HEIGHT} from '../constants'
import {useTableOmnibarFocus} from '../hooks/use-table-omnibar-focus'
import type {TableDataType} from '../table-data-type'
import {TablePagination} from '../table-pagination'
import type {TableRowProps} from '../table-row'
import {TableRowChunk, VIRTUALIZATION_CHUNK_SIZE} from '../table-row-chunk'
import {isTrackedByGroup, TrackedByMissingIssuesRow} from './tracked-by-missing-issues-row'

export const TABLE_GROUP_FOOTER_HEIGHT = CELL_HEIGHT
export const TABLE_GROUP_FOOTER_MARGIN_TOP = 1

type FooterProps = {
  groupId: string
  scrollRef: React.RefObject<HTMLElement>
  metadata: GroupingMetadataWithSource
  shouldDisableFooter: boolean
  footerPlaceholder: string
}

const TableGroupFooter: React.FC<FooterProps> = memo(function TableGroupFooter({
  groupId,
  scrollRef,
  metadata,
  shouldDisableFooter,
  footerPlaceholder,
}) {
  const {omnibarRef, onFocus, onKeyDown} = useTableOmnibarFocus(groupId)

  const newItemAttributes = useMemo(() => {
    const updateAction = getDraftItemUpdateColumnAction(metadata.sourceObject)
    if (updateAction) {
      return {
        updateColumnActions: [updateAction],
        groupId: metadata.value,
      }
    }
  }, [metadata.sourceObject, metadata.value])

  const title = getGroupTestId(metadata.sourceObject)

  const missingIssuesRow = isTrackedByGroup(metadata.sourceObject) ? (
    <TrackedByMissingIssuesRow trackedBy={metadata.sourceObject.value} />
  ) : null

  return (
    <>
      {missingIssuesRow}
      <Box
        sx={useMemo(
          () => ({
            alignItems: 'center',
            height: `${TABLE_GROUP_FOOTER_HEIGHT}px`,
            width: '100%',
            pl: '12px',
            bg: shouldDisableFooter ? 'canvas.subtle' : 'canvas.default',
            color: shouldDisableFooter ? 'fg.muted' : 'inherit',
            backdropFilter: 'unset',
            pointerEvents: 'none',
            borderBottom: 'unset',
            borderBottomColor: 'unset',
            boxShadow: 'unset',
            left: 0,
            // this is to make room for row selection boundary at end of a group:
            marginTop: `${TABLE_GROUP_FOOTER_MARGIN_TOP}px`,
            position: 'sticky',
            display: 'flex',

            '>:first-child': {
              pointerEvents: 'all',
            },
          }),
          [shouldDisableFooter],
        )}
        {...testIdProps(`table-group-footer-${title}`)}
      >
        <Omnibar
          ref={omnibarRef}
          role="row"
          isFixed={false}
          newItemAttributes={newItemAttributes}
          defaultPlaceholder={footerPlaceholder}
          groupingMetadata={metadata}
          onKeyDown={onKeyDown}
          onInputFocus={onFocus}
          disabled={shouldDisableFooter}
          scrollRef={scrollRef}
        />
      </Box>
    </>
  )
})

type Props = {
  groupId: string

  /** Starting number to use for the rank displayed on each row */
  firstRowIndex: number
  /**
   * Indicate whether the group is marked as "expanded" (showing items) or
   * "collapsed" (items hidden).
   *
   * If `isCollapsed` is true, nothing is rendered for the content of a group.
   */
  isCollapsed: boolean
  itemData: TableRowProps['data']
  /**
   * Metadata related to the provided group.
   */
  metadata: GroupingMetadataWithSource
  /**
   * Rows representing items in this group
   */
  rows: Array<Row<TableDataType>>

  scrollRef: React.RefObject<HTMLElement>

  /**
   * Whether or adding items via the group footer is disabled
   */
  shouldDisableFooter: boolean

  /**
   * Placeholder text for text input for adding items
   */
  footerPlaceholder: string

  /*
   * Whether or not items can be added to this group
   */
  isEditable: boolean
}

/**
 * Content component for a group when viewing the project in table mode.
 */
export function TableGroupContents({
  groupId,
  firstRowIndex,
  isCollapsed,
  itemData,
  isEditable,
  metadata,
  rows,
  scrollRef,
  shouldDisableFooter,
  footerPlaceholder,
}: Props) {
  const {memex_table_without_limits} = useEnabledFeatures()

  if (isCollapsed) {
    return null
  }

  return (
    <>
      {chunk(rows, VIRTUALIZATION_CHUNK_SIZE).map((rowChunk, index) => (
        <TableRowChunk
          key={index}
          rows={rowChunk}
          rowOffset={firstRowIndex + VIRTUALIZATION_CHUNK_SIZE * index}
          chunkIndex={index}
          chunkSize={VIRTUALIZATION_CHUNK_SIZE}
          itemData={itemData}
        />
      ))}
      {memex_table_without_limits && <TablePagination pageType={{groupId: metadata.value}} />}
      {isEditable && (
        <TableGroupFooter
          groupId={groupId}
          scrollRef={scrollRef}
          metadata={metadata}
          shouldDisableFooter={shouldDisableFooter}
          footerPlaceholder={footerPlaceholder}
        />
      )}
    </>
  )
}
