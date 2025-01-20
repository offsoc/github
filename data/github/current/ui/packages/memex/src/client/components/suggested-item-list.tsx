import {testIdProps} from '@github-ui/test-id-props'
import {ArrowRightIcon, PlusCircleIcon, RepoIcon} from '@primer/octicons-react'
import {Box, Octicon, Spinner, Text, useRefObjectAsForwardedRef, useTheme} from '@primer/react'
import {forwardRef, useRef} from 'react'

import type {Repository} from '../api/common-contracts'
import type {RepositoryItem} from '../api/repository/contracts'
import type {GetItemPropsAdditionalHandlers} from '../hooks/common/use-autocomplete'
import {usePrefixedId} from '../hooks/common/use-prefixed-id'
import {useMemexItems} from '../state-providers/memex-items/use-memex-items'
import {PickerItem, PickerList, useAdjustPickerPosition} from './common/picker-list'
import {Portal} from './common/portal'
import {SuggestedItemOption} from './suggested-item-option'

type AuxillaryMetadata = {
  title?: string
  repository: Repository
}

export type ADD_MULTIPLE_ITEMS_KEY = 'add_multiple_items'
export const ADD_MULTIPLE_ITEMS_KEY: ADD_MULTIPLE_ITEMS_KEY = 'add_multiple_items'
export type ADD_MULTIPLE_ITEMS = {type: ADD_MULTIPLE_ITEMS_KEY} & AuxillaryMetadata

export type CREATE_ISSUE_KEY = 'create_issue'
export const CREATE_ISSUE_KEY: CREATE_ISSUE_KEY = 'create_issue'
export type CREATE_ISSUE = {type: CREATE_ISSUE_KEY} & AuxillaryMetadata

interface SuggestedItemListProps extends React.HTMLAttributes<HTMLUListElement> {
  isOpen: boolean
  loading: boolean
  items: Array<RepositoryItem | CREATE_ISSUE | ADD_MULTIPLE_ITEMS>
  containerRef: React.RefObject<HTMLDivElement>
  getItemProps: (
    item: RepositoryItem | CREATE_ISSUE | ADD_MULTIPLE_ITEMS,
    index: number,
    additionalHandlers?: GetItemPropsAdditionalHandlers,
  ) => React.LiHTMLAttributes<HTMLLIElement>
  itemOnMouseDown: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    item: RepositoryItem | CREATE_ISSUE | ADD_MULTIPLE_ITEMS,
  ) => void
}

export const SuggestedItemList = forwardRef<HTMLUListElement, SuggestedItemListProps>(
  ({loading, items, getItemProps, isOpen, itemOnMouseDown, containerRef, ...listProps}, forwardedRef) => {
    const ref = useRef<HTMLUListElement>(null)
    useRefObjectAsForwardedRef(forwardedRef, ref)
    const {items: memexItems} = useMemexItems()
    // Ensure the picker list position is updated when new items are added to the view
    const {adjustPickerPosition} = useAdjustPickerPosition(containerRef, ref, isOpen, [loading, items, memexItems])
    const {theme} = useTheme()
    const portalId = usePrefixedId('__omnibarPortalRoot__')
    return (
      <Portal id={portalId} onMount={adjustPickerPosition}>
        <PickerList
          {...listProps}
          {...testIdProps('issue-picker-list')}
          ref={ref}
          className={`issue-picker-list omnibar-picker ${
            !isOpen || (!loading && !items.length) ? 'hidden' : 'visible'
          }`}
          hidden={!isOpen || (!loading && !items.length)}
          aria-label="Suggestions"
        >
          {loading ? (
            <Box sx={{justifyContent: 'center', my: 4, display: 'flex'}}>
              <Spinner size="medium" />
            </Box>
          ) : (
            items.map((item, index) => {
              if (item.type === CREATE_ISSUE_KEY) {
                return (
                  <PickerItem
                    key="create"
                    style={{borderTop: '1px solid', borderColor: theme?.colors.border.muted}}
                    {...getItemProps(item, index, {onMouseDown: event => itemOnMouseDown(event, item)})}
                    {...testIdProps('create-new-issue')}
                  >
                    <Box
                      sx={{
                        alignItems: 'center',
                        overflow: 'hidden',
                        flex: '1',
                        display: 'flex',
                      }}
                    >
                      <Box sx={{flexShrink: 0, mr: 2, display: 'flex'}}>
                        <Octicon icon={PlusCircleIcon} sx={{color: 'fg.muted'}} />
                      </Box>
                      <Text sx={{flexGrow: 1}}>
                        Create new issue{' '}
                        {item.title ? (
                          <>
                            &quot;<Text sx={{fontWeight: 600}}>{item.title}</Text>&quot;
                          </>
                        ) : null}
                      </Text>
                    </Box>
                  </PickerItem>
                )
              } else if (item.type === ADD_MULTIPLE_ITEMS_KEY) {
                return (
                  <PickerItem
                    key="multiple"
                    {...getItemProps(item, index, {onMouseDown: event => itemOnMouseDown(event, item)})}
                    {...testIdProps('add-multiple-items')}
                  >
                    <Box
                      sx={{
                        alignItems: 'center',
                        overflow: 'hidden',
                        flex: '1',
                        display: 'flex',
                      }}
                    >
                      <Box sx={{flexShrink: 0, mr: 2, display: 'flex'}}>
                        <Octicon icon={RepoIcon} sx={{color: 'fg.muted'}} />
                      </Box>
                      <Text sx={{flexGrow: 1}}>
                        Add items from <Text sx={{fontWeight: 600}}>{item.repository.nameWithOwner}</Text>
                      </Text>
                      <Box sx={{flexShrink: 0, ml: 2, display: 'flex'}}>
                        <Octicon icon={ArrowRightIcon} sx={{color: 'fg.muted'}} />
                      </Box>
                    </Box>
                  </PickerItem>
                )
              } else {
                return (
                  <SuggestedItemOption
                    key={item.number}
                    item={item}
                    {...getItemProps(item, index, {onMouseDown: event => itemOnMouseDown(event, item)})}
                    {...testIdProps('issue-picker-item')}
                  />
                )
              }
            })
          )}
        </PickerList>
      </Portal>
    )
  },
)

SuggestedItemList.displayName = 'SuggestedItemList'
