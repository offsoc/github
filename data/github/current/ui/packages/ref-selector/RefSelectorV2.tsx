import {checkTagNameExistsPath, repositoryPath} from '@github-ui/paths'
import {EyeIcon, PlusCircleIcon, XIcon} from '@primer/octicons-react'
import {ActionList, Autocomplete, Box, Button, IconButton} from '@primer/react'
import {useCallback, useRef, useState} from 'react'

import {CheckTagNameDialog} from './CheckTagNameDialog'
import {checkTagExists} from './check-tag-exists'
import {createBranch} from './create-branch'
import {RefAutocompleteList} from './RefAutocompleteList'
import {
  defaultTypes,
  type RefSelectorFooterProps,
  type RefSelectorProps,
  type RefType,
  RefTypeTabs,
} from './RefSelector'
import {RefSelectorAnchoredOverlay} from './RefSelectorAnchoredOverlay'
import {RefSelectorFooter} from './RefSelectorFooter'
import {useRefs} from './use-refs'

export function RefSelectorV2(props: RefSelectorProps) {
  const {
    cacheKey,
    owner,
    repo,
    canCreate,
    hotKey,
    onOpenChange,
    size,
    getHref,
    onBeforeCreate,
    currentCommitish,
    onCreateError,
    onRefTypeChanged,
    onSelectItem,
    customFooterItemProps,
    selectedRefType,
    hideShowAll,
    defaultBranch,
    types = defaultTypes,
    allowResizing,
    useFocusZone,
  } = props

  const inputRef = useRef(null)
  const createButtonRef = useRef<HTMLLIElement>(null)

  const normalizedSelectedRefType = selectedRefType === 'tree' ? 'branch' : selectedRefType
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [selectedRef, setSelectedRef] = useState(currentCommitish)
  const [refType, setRefType] = useState<RefType>(normalizedSelectedRefType ?? types[0]!)
  const [branchFilterText, setBranchFilterText] = useState('')
  const [tagFilterText, setTagFilterText] = useState('')

  const displayCommitish = selectedRefType === 'tree' ? currentCommitish.slice(0, 7) : currentCommitish

  const filterText = isBranchRef(refType) ? branchFilterText : tagFilterText
  const setFilterText = isBranchRef(refType) ? setBranchFilterText : setTagFilterText

  const refsState = useRefs(cacheKey, owner, repo, refType, filterText, canCreate)
  const [showTagWarningDialog, setShowTagWarningDialog] = useState(false)
  const [focusTrapEnabled, setFocusTrapEnabled] = useState(true)

  const path = repositoryPath({owner, repo, action: 'branches'})

  const createAndGoToBranch = useCallback(
    async (newRefName: string) => {
      onBeforeCreate?.(newRefName)
      const result = await createBranch(path, newRefName, currentCommitish)

      if (!result.success) {
        onCreateError?.(result.error)
      } else if (getHref) {
        // The branch creation endpoint will redirect automatically, but not for
        // XHR requests. So we have to manually switch to the new branch, which
        // is fine.
        window.location.assign(getHref(result.name))
      }
    },
    [onBeforeCreate, path, currentCommitish, getHref, onCreateError],
  )

  const checkTagPath = checkTagNameExistsPath({owner, repo})
  const checkTagAndCreate = useCallback(
    async (newRefName: string) => {
      if (await checkTagExists(checkTagPath, newRefName)) {
        setShowTagWarningDialog(true)
        // disable focus trap to switch focus to the dialog.
        setFocusTrapEnabled(false)
        return
      }

      setShowTagWarningDialog(false)
      setFocusTrapEnabled(false)
      createAndGoToBranch(newRefName)
    },
    [checkTagPath, createAndGoToBranch, setShowTagWarningDialog],
  )

  function onRefSelectionConfirm() {
    // In the new flow we have Apply button, while before every item was a link.
    // Here seems to be the most logical place to call this function, though we might need to update naming.
    onSelectItem?.(selectedRef, refType)
    if (getHref) {
      window.location.assign(getHref?.(selectedRef))
    }
    setOverlayOpen(false)
  }

  const changeRefType = useCallback(
    (newRefType: RefType) => {
      setRefType(newRefType)
      setSelectedRef(currentCommitish)
      onRefTypeChanged?.(newRefType)
    },
    [onRefTypeChanged, currentCommitish],
  )

  const internalCustomFooterProps: RefSelectorFooterProps | undefined = customFooterItemProps
    ? {
        ...customFooterItemProps,
        onClick: () => {
          customFooterItemProps?.onClick?.()
          setOverlayOpen(false)
        },
      }
    : undefined

  return (
    <>
      <RefSelectorAnchoredOverlay
        refType={refType}
        displayCommitish={displayCommitish}
        focusTrapEnabled={focusTrapEnabled}
        preventClosing={showTagWarningDialog}
        size={size}
        onOpenChange={onOpenChange}
        overlayOpen={overlayOpen}
        onOverlayChange={open => setOverlayOpen(open)}
        hotKey={hotKey}
        inputRef={inputRef}
        allowResizing={allowResizing}
        useFocusZone={useFocusZone}
      >
        <Box sx={{p: 2, pl: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h5>{headerText(types)}</h5>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            aria-label="Cancel"
            variant="invisible"
            icon={XIcon}
            sx={{color: 'fg.muted'}}
            onClick={() => setOverlayOpen(false)}
          />
        </Box>
        <div>{types.length > 1 && <RefTypeTabs refType={refType} onRefTypeChanged={changeRefType} />}</div>
        <Box
          sx={{px: 2, pt: 3}}
          role="tabpanel"
          id={isBranchRef(refType) ? 'branches' : 'tags'}
          aria-labelledby={`${refType}-button`}
        >
          <Autocomplete>
            <RefAutocompleteList
              refs={refsState.refs}
              inputRef={inputRef}
              status={refsState.status}
              value={filterText}
              defaultBranch={defaultBranch}
              selectedRef={selectedRef}
              refType={refType}
              onChange={setFilterText}
              onSelect={setSelectedRef}
            />
          </Autocomplete>
        </Box>
        <ActionList.Divider sx={{m: 0}} />
        <div>
          <ActionList>
            {!hideShowAll && (
              <ActionList.LinkItem
                role="link"
                href={repositoryPath({owner, repo, action: isBranchRef(refType) ? 'branches' : 'tags'})}
              >
                <ActionList.LeadingVisual>
                  <EyeIcon />
                </ActionList.LeadingVisual>
                View all {isBranchRef(refType) ? 'branches' : 'tags'}
              </ActionList.LinkItem>
            )}
            {isBranchRef(refType) && refsState.showCreateAction && (
              <ActionList.Item
                role="button"
                ref={createButtonRef}
                onSelect={() => checkTagAndCreate(filterText)}
                data-testid="create-branch-action"
              >
                <ActionList.LeadingVisual>
                  <PlusCircleIcon />
                </ActionList.LeadingVisual>
                Create new branch &lsquo;{branchFilterText}&rsquo; from &lsquo;{displayCommitish}&rsquo;
              </ActionList.Item>
            )}

            {internalCustomFooterProps && <RefSelectorFooter {...internalCustomFooterProps} />}
          </ActionList>
        </div>
        <ActionList.Divider sx={{m: 0}} />
        <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2, p: 3}}>
          <Button onClick={() => setOverlayOpen(false)} data-testid="cancel-button">
            Cancel
          </Button>
          <Button
            disabled={selectedRef === currentCommitish || !selectedRef}
            onClick={onRefSelectionConfirm}
            variant="primary"
            data-testid="apply-button"
          >
            Apply
          </Button>
        </Box>
      </RefSelectorAnchoredOverlay>
      <CheckTagNameDialog
        isOpen={showTagWarningDialog}
        onDismiss={() => {
          setShowTagWarningDialog(false)
          // Although, Dialog has `returnFocusRef` property, it does not work in our case. Therefore, We need to manually return focus to the overlay.
          createButtonRef.current?.focus()
        }}
        onConfirm={() => createAndGoToBranch(branchFilterText)}
      />
    </>
  )
}

function isBranchRef(refType: RefType): refType is 'branch' {
  return refType === 'branch'
}

function headerText(types: RefType[]) {
  if (types.includes('branch') && types.includes('tag')) {
    return 'Select branch or tag'
  } else if (types.includes('branch')) {
    return 'Select branch'
  } else if (types.includes('tag')) {
    return 'Select tag'
  }
}
