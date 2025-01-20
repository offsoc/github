import {FilterIcon, SearchIcon} from '@primer/octicons-react'
import {Box, ActionMenu, IconButton, ActionList, TextInput} from '@primer/react'
import {SeatType} from '../../types'

type Props = {
  filter: (filter: SeatType) => void
  search: (query: string) => void
  filterDetails: string
}

export function FilterableSearch(props: Props) {
  const {filter, search, filterDetails} = props
  return (
    <div className="d-flex flex-justify-between flex-items-center mb-3">
      <div className="flex-auto member-list-item">
        <Box sx={{display: 'flex'}}>
          <ActionMenu>
            <ActionMenu.Anchor>
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip={true}
                icon={FilterIcon}
                variant="default"
                aria-label="Open filter options"
                sx={{borderRight: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0}}
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay width="medium">
              <ActionList data-testid="copilot-user-search-filter" selectionVariant="single" showDividers>
                <ActionList.Item
                  onSelect={() => filter(SeatType.All)}
                  selected={filterDetails === SeatType.All}
                  /**
                   * We need to do this because of a bug in the ActionList.
                   * When the first item is selected, the divider does not appear
                   **/
                  sx={{
                    '&:before': {
                      content: ' ',
                      display: 'block',
                      position: 'absolute',
                      width: '100%',
                      top: '-7px',
                      borderWidth: '1px 0px 0px',
                      borderStyle: 'solid',
                      borderImage: 'initial',
                      borderColor: 'var(--divider-color,transparent)',
                    },
                  }}
                >
                  All
                </ActionList.Item>
                <ActionList.Item onSelect={() => filter(SeatType.User)} selected={filterDetails === SeatType.User}>
                  Members
                </ActionList.Item>
                <ActionList.Item onSelect={() => filter(SeatType.Team)} selected={filterDetails === SeatType.Team}>
                  Teams
                </ActionList.Item>
                <ActionList.Item
                  onSelect={() => filter(SeatType.OrganizationInvitation)}
                  selected={filterDetails === SeatType.OrganizationInvitation}
                >
                  Pending invitations
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
          <TextInput
            leadingVisual={SearchIcon}
            aria-label={'Filter by name or handle'}
            name="search-seats"
            placeholder={'Filter by name or handle'}
            data-testid="cfb-search-seats"
            sx={{width: '100%', borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
            onChange={event => search(event.target.value)}
          />
        </Box>
      </div>
    </div>
  )
}
