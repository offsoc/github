import {GitHubAvatar} from '@github-ui/github-avatar'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {ActionList, ActionMenu, FormControl, TextInput} from '@primer/react'
import {forwardRef, useState} from 'react'

import {OwnerDropdownItems} from './OwnerDropdownItems'

export interface OwnerItem {
  id?: number
  name: string
  avatarUrl: string
  disabled: boolean
  isOrganization: boolean
  customDisabledMessage?: string | null
  businessName?: string | null
}

export interface OwnerDropdownProps {
  initialOwnerItems?: OwnerItem[]
  ownerItemsPath: string
  excludedOrg?: string
  selectedOwner?: OwnerItem
  onOwnerChange: (newOwner: OwnerItem) => void
  showLabel?: boolean
  hideSelectOwnerCheck?: boolean
  'aria-describedby'?: string
}

const defaultValidationMessageId = 'repo-owner-dropdown-error'

export const OwnerDropdown = forwardRef(
  (
    {
      initialOwnerItems,
      ownerItemsPath,
      excludedOrg,
      selectedOwner,
      onOwnerChange,
      showLabel = true,
      hideSelectOwnerCheck = false,
      'aria-describedby': ariaDescribedBy,
    }: OwnerDropdownProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => {
    const [ownerItems, setOwnerItems] = useState(initialOwnerItems)
    const [hasLoadedOwnerSelections, setHasLoadedOwnerSelections] = useState(false)
    const [displayOrgLoadErrorMsg, setDisplayOrgLoadErrorMsg] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const loadOwners = async (open: boolean) => {
      if (open && !hasLoadedOwnerSelections && !ownerItems) {
        setHasLoadedOwnerSelections(true)
        setDisplayOrgLoadErrorMsg(false)
        try {
          const result = await verifiedFetchJSON(ownerItemsPath)
          const data = await result.json()

          const owners = data?.owners
          if (!result.ok || !owners) {
            handleErrorLoadingOrgs()
            return
          }

          setDisplayOrgLoadErrorMsg(false)
          setOwnerItems(owners)
        } catch (error) {
          handleErrorLoadingOrgs()
        }
      }
    }

    const handleErrorLoadingOrgs = () => {
      setHasLoadedOwnerSelections(false)
      setOwnerItems(undefined)
      setDisplayOrgLoadErrorMsg(true)
    }

    const headerButton = () => {
      const displayName = selectedOwner?.name || 'Choose an owner'
      const buttonAvatar =
        selectedOwner && (() => <GitHubAvatar src={selectedOwner.avatarUrl} key={selectedOwner.avatarUrl} />)

      return (
        <ActionMenu.Button
          aria-describedby={ariaDescribedBy || defaultValidationMessageId}
          aria-label={displayName}
          leadingVisual={buttonAvatar}
        >
          {displayName}
        </ActionMenu.Button>
      )
    }

    const itemsToDisplay = ownerItems?.filter(item => {
      if (excludedOrg && item.name === excludedOrg) {
        return false
      }

      return item.name.toLowerCase().includes(searchTerm.toLowerCase())
    })

    return (
      <FormControl required>
        <FormControl.Label visuallyHidden={!showLabel}>Owner</FormControl.Label>
        <ActionMenu anchorRef={ref as React.RefObject<HTMLButtonElement>} onOpenChange={loadOwners}>
          {headerButton()}
          <ActionMenu.Overlay width="small" maxHeight="large" sx={{overflow: 'auto'}}>
            <ActionList showDividers>
              <ActionList.Group>
                <TextInput
                  sx={{mx: 2, display: 'flex'}}
                  aria-label="Search owner"
                  placeholder="Filter…"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                />
              </ActionList.Group>
              <ActionList.Group sx={{maxHeight: 350, overflow: 'auto'}}>
                {itemsToDisplay && (
                  <OwnerDropdownItems
                    ownerItems={itemsToDisplay}
                    selectedOwner={selectedOwner}
                    onSelect={onOwnerChange}
                  />
                )}
                {!itemsToDisplay && !displayOrgLoadErrorMsg && (
                  <ActionList.Item key="fetching-owners" disabled={true}>
                    Fetching owners…
                  </ActionList.Item>
                )}
                {displayOrgLoadErrorMsg && (
                  <ActionList.Item key="error-fetching-owners" disabled={true} sx={{color: 'danger.fg'}}>
                    An error occurred while loading organizations. Please reopen the dropdown to try again.
                  </ActionList.Item>
                )}
              </ActionList.Group>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
        {!hideSelectOwnerCheck && !selectedOwner && (
          <FormControl.Validation id={defaultValidationMessageId} variant="error">
            Please select an owner
          </FormControl.Validation>
        )}
      </FormControl>
    )
  },
)

OwnerDropdown.displayName = 'OwnerDropdown'
