import {checkTagNameExistsPath, repositoryPath} from '@github-ui/paths'
import {GitBranchIcon, SearchIcon, XIcon} from '@primer/octicons-react'
import {ActionList, Box, Heading, IconButton, Spinner, Octicon, Text, TextInput} from '@primer/react'
import {forwardRef, useCallback, useRef, useState} from 'react'

import {CheckTagNameDialog} from './CheckTagNameDialog'
import {checkTagExists} from './check-tag-exists'
import {createBranch} from './create-branch'
import {defaultTypes, LoadingFailed, type RefSelectorProps, type RefType, RefTypeTabs} from './RefSelector'
import {RefSelectorAnchoredOverlay} from './RefSelectorAnchoredOverlay'
import {RefSelectorFooter} from './RefSelectorFooter'
import {RefsList} from './RefsList'
import {type RefsState, useRefs} from './use-refs'

export function RefSelectorV1(props: RefSelectorProps) {
  const {
    cacheKey,
    owner,
    repo,
    canCreate,
    types,
    hotKey,
    onOpenChange,
    size,
    getHref,
    onBeforeCreate,
    onRefTypeChanged,
    currentCommitish,
    onCreateError,
    onSelectItem,
    closeOnSelect,
    selectedRefType,
    customFooterItemProps,
    buttonClassName,
    allowResizing,
    idEnding,
    useFocusZone,
  } = props
  const [filterText, setFilterText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const createButtonRef = useRef<HTMLLIElement>(null)

  const normalizedSelectedRefType = selectedRefType === 'tree' ? 'branch' : selectedRefType
  const displayCommitish = selectedRefType === 'tree' ? currentCommitish.slice(0, 7) : currentCommitish

  const [overlayOpen, setOverlayOpen] = useState(false)
  const [focusTrapEnabled, setFocusTrapEnabled] = useState(true)
  const [showTagWarningDialog, setShowTagWarningDialog] = useState(false)
  const [refType, setRefType] = useState<RefType>(normalizedSelectedRefType ?? (types ?? defaultTypes)[0]!)

  const refsState = useRefs(cacheKey, owner, repo, refType, filterText, canCreate)

  const newRefName = filterText

  const path = repositoryPath({owner, repo, action: 'branches'})
  const checkTagPath = checkTagNameExistsPath({owner, repo})

  const createAndGoToBranch = useCallback(async () => {
    onBeforeCreate?.(newRefName)

    const result = await createBranch(path, newRefName, currentCommitish)

    if (!result.success) {
      onCreateError?.(result.error)
    } else if (getHref) {
      // The branch creation endpoint will redirect automatically, but not for
      // XHR requests. So we have to manually switch to the new branch, which
      // is fine.

      // Clear the cache since the new branch isn't always picked up otherwise.
      refsState.searchIndex?.clearLocalStorage()
      window.location.href = getHref(result.name)
    }
  }, [onBeforeCreate, newRefName, path, currentCommitish, getHref, onCreateError, refsState.searchIndex])

  const checkTagAndCreate = useCallback(async () => {
    if (await checkTagExists(checkTagPath, newRefName)) {
      setShowTagWarningDialog(true)
      // disable focus trap to switch focus to the dialog.
      setFocusTrapEnabled(false)
      return
    }

    setShowTagWarningDialog(false)
    setFocusTrapEnabled(false)
    createAndGoToBranch()
  }, [checkTagPath, newRefName, createAndGoToBranch, setShowTagWarningDialog])

  const changeRefType = useCallback(
    (newRefType: RefType) => {
      setRefType(newRefType)
      onRefTypeChanged?.(newRefType)
    },
    [setRefType, onRefTypeChanged],
  )

  function closeRefSelector() {
    setOverlayOpen(false)
  }

  const onSelect = useCallback(
    (selectedItemRef: string, selectedItemRefType: RefType) => {
      onSelectItem?.(selectedItemRef, selectedItemRefType)
      closeRefSelector()
    },
    [onSelectItem],
  )

  return (
    <>
      <RefSelectorAnchoredOverlay
        refType={refType}
        displayCommitish={displayCommitish}
        focusTrapEnabled={focusTrapEnabled}
        preventClosing={showTagWarningDialog}
        size={size}
        onOpenChange={onOpenChange}
        hotKey={hotKey}
        inputRef={inputRef}
        overlayOpen={overlayOpen}
        onOverlayChange={setOverlayOpen}
        buttonClassName={buttonClassName}
        allowResizing={allowResizing}
        idEnding={idEnding}
        useFocusZone={useFocusZone}
      >
        <RefSelectorActionList
          filterText={filterText}
          displayCommitish={displayCommitish}
          onFilterChange={setFilterText}
          refType={refType}
          onRefTypeChange={changeRefType}
          refsState={refsState}
          onCreateError={props.onCreateError}
          showTagWarningDialog={showTagWarningDialog}
          setShowTagWarningDialog={setShowTagWarningDialog}
          onCreateBranch={checkTagAndCreate}
          inputRef={inputRef}
          createButtonRef={createButtonRef}
          onSelectItem={onSelect}
          closeOnSelect={closeOnSelect}
          closeRefSelector={closeRefSelector}
          customFooterItemProps={customFooterItemProps}
          {...props}
          selectedRefType={refType}
        />
      </RefSelectorAnchoredOverlay>
      {showTagWarningDialog && (
        <CheckTagNameDialog
          isOpen={showTagWarningDialog}
          onDismiss={() => {
            setShowTagWarningDialog(false)
            createButtonRef.current?.focus()
          }}
          onConfirm={createAndGoToBranch}
        />
      )}
    </>
  )
}

interface RefSelectorActionListProps extends Omit<RefSelectorProps, 'cacheKey'> {
  filterText: string
  onFilterChange: (filterText: string) => void
  onRefTypeChange: (refType: RefType) => void
  refType: RefType
  refsState: RefsState
  selectedRefType: RefType
  showTagWarningDialog: boolean
  setShowTagWarningDialog: (showWarningDialog: boolean) => void
  onCreateBranch: () => void
  closeRefSelector: () => void
  inputRef?: React.RefObject<HTMLInputElement>
  createButtonRef?: React.RefObject<HTMLLIElement>
  displayCommitish: string
}

function RefSelectorActionList({
  canCreate,
  currentCommitish,
  displayCommitish,
  defaultBranch,
  filterText,
  getHref,
  hideShowAll,
  onSelectItem,
  closeOnSelect,
  closeRefSelector,
  onFilterChange,
  onRefTypeChange,
  owner,
  selectedRefType,
  refsState,
  refType,
  repo,
  types,
  onCreateBranch,
  inputRef,
  createButtonRef,
  customFooterItemProps,
  viewAllJustify,
}: RefSelectorActionListProps) {
  const {refs, showCreateAction, status} = refsState

  function onFooterItemClick() {
    customFooterItemProps?.onClick?.()
    closeRefSelector()
  }

  return (
    <ActionList showDividers>
      <Box sx={{borderBottom: '1px solid', borderColor: 'border.subtle', pb: 2}}>
        <Box sx={{display: 'flex', pb: 2, px: 2, justifyContent: 'space-between', alignItems: 'center'}}>
          <Heading as="h5" sx={{pl: 2, fontSize: 'inherit'}}>
            {switchRefText(types ?? defaultTypes)}
          </Heading>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            aria-label="Cancel"
            variant="invisible"
            icon={XIcon}
            sx={{color: 'fg.muted'}}
            onClick={closeRefSelector}
          />
        </Box>

        <RefTextFilter
          defaultText={filterText}
          refType={refType}
          canCreate={canCreate}
          onFilterChange={onFilterChange}
          ref={inputRef}
        />
      </Box>

      <Box sx={{pt: 2, pb: showCreateAction && refs.length === 0 ? 0 : 2}}>
        {(types ?? defaultTypes).length > 1 && (
          <Box sx={{px: 2, pb: 2}}>
            <RefTypeTabs
              refType={refType}
              onRefTypeChanged={onRefTypeChange}
              sx={{
                mx: -2,
                borderBottom: '1px solid',
                borderColor: 'border.muted',
                '> nav': {borderBottom: 'none'},
              }}
            />
          </Box>
        )}

        {status === 'loading' || status === 'uninitialized' ? (
          <Loading refType={refType} />
        ) : status === 'failed' ? (
          <LoadingFailed refType={refType} />
        ) : refs.length === 0 && !showCreateAction ? (
          <RefsZeroState />
        ) : (
          <RefsList
            filterText={filterText}
            refs={refs}
            defaultBranch={refType === 'branch' ? defaultBranch : ''}
            currentCommitish={refType === selectedRefType ? currentCommitish : ''}
            getHref={getHref}
            onSelectItem={ref => {
              onSelectItem?.(ref, refType)
              if (closeOnSelect) closeRefSelector()
            }}
          />
        )}
      </Box>

      {showCreateAction && (
        <>
          {refs.length > 0 && <ActionList.Divider sx={{marginTop: 0, backgroundColor: 'border.subtle'}} />}
          <CreateRefAction
            displayCommitish={displayCommitish}
            newRefName={filterText}
            onCreateBranch={onCreateBranch}
            createButtonRef={createButtonRef}
          />
        </>
      )}

      {(!hideShowAll || customFooterItemProps) && (
        <ActionList.Divider sx={{marginTop: showCreateAction ? 2 : 0, backgroundColor: 'border.subtle'}} />
      )}

      {!hideShowAll && (
        <ViewAllRefsAction
          justify={viewAllJustify}
          refType={refType}
          owner={owner}
          repo={repo}
          onClick={closeRefSelector}
        />
      )}

      {customFooterItemProps && <RefSelectorFooter {...customFooterItemProps} onClick={onFooterItemClick} />}
    </ActionList>
  )
}

interface RefTextFilterProps {
  refType: RefType
  canCreate: boolean
  onFilterChange: (filterText: string) => void
  defaultText: string
}

const RefTextFilter = forwardRef(RefTextFilterWithRef)

function RefTextFilterWithRef(
  {refType, canCreate, onFilterChange, defaultText}: RefTextFilterProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const placeholder =
    refType === 'tag' ? 'Find a tag...' : canCreate ? 'Find or create a branch...' : 'Find a branch...'
  return (
    <Box sx={{px: 2}}>
      <TextInput
        leadingVisual={SearchIcon}
        value={defaultText}
        sx={{width: '100%'}}
        placeholder={placeholder}
        ref={ref}
        onInput={e => {
          const target = e.target
          if (!(target instanceof HTMLInputElement)) return // Make ts happy
          onFilterChange(target.value)
        }}
      />
    </Box>
  )
}

function switchRefText(types: RefType[]) {
  if (types.includes('branch') && types.includes('tag')) {
    return 'Switch branches/tags'
  } else if (types.includes('branch')) {
    return 'Switch branches'
  } else if (types.includes('tag')) {
    return 'Switch tags'
  }
}

function Loading({refType}: {refType: RefType}) {
  return (
    <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
      <Spinner size="medium" aria-label={`Loading ${refType === 'branch' ? 'branches' : 'tags'}...`} />
    </Box>
  )
}

function RefsZeroState() {
  return <Box sx={{p: 3, display: 'flex', justifyContent: 'center'}}>Nothing to show</Box>
}

interface ViewAllRefsActionProps {
  refType: string
  owner: string
  repo: string
  onClick?: () => void
  justify?: RefSelectorProps['viewAllJustify']
}

function ViewAllRefsAction({refType, owner, repo, onClick, justify = 'start'}: ViewAllRefsActionProps) {
  const type = refType === 'branch' ? 'branches' : 'tags'
  return (
    <ActionList.LinkItem
      role="link"
      href={repositoryPath({owner, repo, action: type})}
      onClick={onClick}
      sx={{display: 'flex', justifyContent: 'center'}}
    >
      <Box sx={{display: 'flex', justifyContent: justify}}>View all {type}</Box>
    </ActionList.LinkItem>
  )
}

interface CreateRefActionProps {
  displayCommitish: string
  newRefName: string
  onCreateBranch: () => void
  createButtonRef?: React.RefObject<HTMLLIElement>
}

function CreateRefAction({displayCommitish, newRefName, onCreateBranch, createButtonRef}: CreateRefActionProps) {
  return (
    <ActionList.Item role="button" onSelect={onCreateBranch} ref={createButtonRef}>
      <Octicon icon={GitBranchIcon} sx={{mr: 2, color: 'fg.muted'}} />
      <span>Create branch&nbsp;</span>
      <Text sx={{fontWeight: 600, fontFamily: 'monospace'}}>{newRefName}</Text>
      <span>&nbsp;from&nbsp;</span>
      <Text sx={{fontWeight: 600, fontFamily: 'monospace'}}>{displayCommitish}</Text>
    </ActionList.Item>
  )
}
