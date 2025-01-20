import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {
  ArchiveIcon,
  CheckIcon,
  CopyIcon,
  IssueOpenedIcon,
  LinkExternalIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@primer/octicons-react'
import {ActionList, Octicon, Text, useConfirm} from '@primer/react'
import {forwardRef, useCallback, useMemo, useRef, useState} from 'react'

import type {HierarchySidePanelItem} from '../../../api/memex-items/hierarchy'
import {ItemType} from '../../../api/memex-items/item-type'
import {type SidePanelItem, SidePanelTypeParam} from '../../../api/memex-items/side-panel-item'
import {DraftConvert, SidePanelNavigateToItem, SidePanelUI} from '../../../api/stats/contracts'
import {getInitialState} from '../../../helpers/initial-state'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {useTimeout} from '../../../hooks/common/timeouts/use-timeout'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useArchiveMemexItemsWithConfirmation} from '../../../hooks/use-archive-memex-items-with-confirmation'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useRemoveMemexItemWithConfirmation} from '../../../hooks/use-remove-memex-items-with-id'
import {useSidePanel} from '../../../hooks/use-side-panel'
import {DraftIssueModel} from '../../../models/memex-item-model'
import {ITEM_ID_PARAM, PANE_PARAM} from '../../../platform/url'
import {useSearchParams} from '../../../router'
import {useIssueContext} from '../../../state-providers/issues/use-issue-context'
import {useCreateMemexItem} from '../../../state-providers/memex-items/use-create-memex-item'
import {useMemexItems} from '../../../state-providers/memex-items/use-memex-items'
import {useTrackedByItemsContext} from '../../../state-providers/tracked-by-items/use-tracked-by-items-context'
import {Resources} from '../../../strings'
import {RepoPicker} from '../../repo-picker'
import useToasts, {ToastType} from '../../toasts/use-toasts'

export const SidePanelSidebarActions: React.FC<{item: SidePanelItem | HierarchySidePanelItem}> = ({item}) => {
  const {tasklist_block} = useEnabledFeatures()
  const {closePane, hasUnsavedChanges} = useSidePanel()
  const {postStats} = usePostStats()
  const {addToast} = useToasts()
  const {items: allItems} = useMemexItems()
  const {removeChildIssues} = useTrackedByItemsContext()
  const {createMemexItem} = useCreateMemexItem()
  const {reloadSidePanelMetadata} = useIssueContext()
  const [_, setSearchParams] = useSearchParams()

  const {hasWritePermissions} = ViewerPrivileges()
  const projectItemLimit = getInitialState().projectLimits.projectItemLimit
  const url = item.getUrl()
  const [loadingAddToProject, setLoadingAddToProject] = useState(false)

  const confirm = useConfirm()

  const confirmUnsavedChanges = async () =>
    !hasUnsavedChanges || (await confirm({...Resources.sidePanelCloseConfirmation, confirmButtonType: 'danger'}))

  // ---- convert

  const [repoPickerOpen, setRepoPickerOpen] = useState(false)
  const convertToIssueRef = useRef<HTMLLIElement>(null)

  const onConvertToIssue = () => {
    if (!confirmUnsavedChanges()) return
    setRepoPickerOpen(true)
  }

  const onPickConvertRepo = () => {
    postStats({
      name: DraftConvert,
      ui: SidePanelUI,
      memexProjectItemId: item.id,
    })
  }

  // ---- add to project

  const itemInProject = useMemo(
    () => allItems.find(i => i.itemId() === item.itemId() && i.contentType === item.contentType),
    [allItems, item],
  )
  const itemExistsInProject = !!itemInProject
  const shouldScroll = useRef(false)

  // Scroll issue into view when added
  useLayoutEffect(() => {
    const memexItemRef =
      document.querySelector(`[data-hovercard-subject-tag="issue:${item.itemId()}"]`) ||
      document.querySelector(`[data-board-card-id="${item.itemId()}"]`)
    if (shouldScroll.current && memexItemRef) {
      shouldScroll.current = false
      if ('scrollIntoViewIfNeeded' in memexItemRef && typeof memexItemRef.scrollIntoViewIfNeeded === 'function') {
        // This is part of webkit only, but not part of the official standard.
        memexItemRef.scrollIntoViewIfNeeded(false)
      } else {
        memexItemRef.scrollIntoView({block: 'nearest', behavior: 'smooth'})
      }
      // Update window URL for Copy link to Project once item is added
      if (itemInProject)
        setSearchParams(nextParams => {
          nextParams.set(PANE_PARAM, SidePanelTypeParam.ISSUE)
          nextParams.set(ITEM_ID_PARAM, itemInProject.id.toString())
          return nextParams
        })
    }
  })

  const onAddToProject = useCallback(async () => {
    if (allItems.length + 1 > projectItemLimit) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        message: `Adding this item will exceed the ${projectItemLimit} project item limit`,
        type: ToastType.error,
      })
      return
    }

    setLoadingAddToProject(true)
    try {
      await createMemexItem({
        contentType: ItemType.DraftIssue,
        content: {title: url},
      })

      // Update # of items not in the project
      removeChildIssues([item.itemId()])
      // Show the project fields in the side panel
      reloadSidePanelMetadata()
      shouldScroll.current = true
    } catch (e) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        message: `An error has occurred when trying to 'Add to project'`,
        type: ToastType.error,
      })
    }
    setLoadingAddToProject(false)
  }, [
    allItems.length,
    projectItemLimit,
    addToast,
    createMemexItem,
    url,
    removeChildIssues,
    item,
    reloadSidePanelMetadata,
  ])

  // ---- archive

  const {openArchiveConfirmationDialog} = useArchiveMemexItemsWithConfirmation(undefined, undefined, undefined, () =>
    closePane({force: true}),
  )

  const onArchive = () => {
    if (!confirmUnsavedChanges()) return
    if (itemExistsInProject) openArchiveConfirmationDialog([itemInProject.id], SidePanelUI)
  }

  // ---- delete

  const {openRemoveConfirmationDialog} = useRemoveMemexItemWithConfirmation(undefined, undefined, undefined, () =>
    closePane({force: true}),
  )

  const onDelete = () => {
    if (itemExistsInProject) openRemoveConfirmationDialog([itemInProject.id], SidePanelUI)
  }

  // ---- render

  const actions: Array<React.ReactNode> = []

  const canConvertToIssue = item instanceof DraftIssueModel && hasWritePermissions
  if (canConvertToIssue) {
    actions.push(<ConvertToIssueAction key="convert" onConvert={onConvertToIssue} ref={convertToIssueRef} />)
  }

  // Only available for hierarchy issues that are not in the project
  if (tasklist_block && hasWritePermissions && url && !itemExistsInProject && item.isHierarchy) {
    actions.push(
      <AddToProjectAction key="addToProject" onAddToProject={onAddToProject} loading={loadingAddToProject} />,
    )
  }

  if (url)
    actions.push(
      <OpenInNewTabAction key="open" itemUrl={url} onClick={() => postStats({name: SidePanelNavigateToItem})} />,
      <CopyUrlAction key="copy" itemUrl={url} />,
    )

  if (itemExistsInProject) {
    actions.push(<CopyInProjectUrlAction key="copyInProjectLink" inProjectUrl={window.location.href} />)

    if (hasWritePermissions) {
      actions.push(
        <ArchiveAction key="archive" onArchive={onArchive} />,
        <DeleteAction key="delete" onDelete={onDelete} />,
      )
    }
  }

  return actions.length > 0 ? (
    <>
      <ActionList aria-label="Actions">
        <ActionList.Divider />
        {actions}
      </ActionList>
      {canConvertToIssue ? (
        <RepoPicker
          key="repoPicker"
          anchorRef={convertToIssueRef}
          isOpen={repoPickerOpen}
          item={item}
          onOpenChange={setRepoPickerOpen}
          onSuccess={onPickConvertRepo}
        />
      ) : null}
    </>
  ) : null
}

const ConvertToIssueAction = forwardRef<HTMLLIElement, {onConvert: () => void}>(({onConvert}, ref) => (
  <ActionList.Item onSelect={onConvert} ref={ref} {...testIdProps('side-pane-convert-to-issue')}>
    <ActionList.LeadingVisual>
      <IssueOpenedIcon />
    </ActionList.LeadingVisual>
    Convert to issue
  </ActionList.Item>
))
ConvertToIssueAction.displayName = 'ConvertToIssueAction'

const AddToProjectAction: React.FC<{onAddToProject: () => void; loading: boolean}> = ({onAddToProject, loading}) => (
  <ActionList.Item onSelect={onAddToProject} disabled={loading} {...testIdProps('side-pane-add-to-project-action')}>
    <ActionList.LeadingVisual>
      <PlusCircleIcon />
    </ActionList.LeadingVisual>
    Add to project
  </ActionList.Item>
)
AddToProjectAction.displayName = 'AddToProjectAction'

const OpenInNewTabAction: React.FC<{itemUrl: string; onClick: () => void}> = ({itemUrl, onClick}) => (
  <ActionList.LinkItem target="_blank" href={itemUrl} onClick={onClick}>
    <ActionList.LeadingVisual>
      <LinkExternalIcon />
    </ActionList.LeadingVisual>
    Open in new tab
  </ActionList.LinkItem>
)

const CopyUrlAction: React.FC<{itemUrl: string}> = ({itemUrl}) => {
  const [success, setSuccess] = useState(false)
  const clearSuccessAfterTimeout = useTimeout(() => setSuccess(false), 2000)

  const onSelect = () => {
    navigator.clipboard.writeText(itemUrl)
    setSuccess(true)
    clearSuccessAfterTimeout()
  }

  return (
    <ActionList.Item onSelect={onSelect} {...testIdProps('copy-link-action')}>
      <ActionList.LeadingVisual>
        {success ? <Octicon icon={CheckIcon} sx={{color: 'success.fg'}} /> : <CopyIcon />}
      </ActionList.LeadingVisual>
      {success ? <Text sx={{fontWeight: 'bold', color: 'success.fg'}}>Copied!</Text> : 'Copy link'}
    </ActionList.Item>
  )
}

const CopyInProjectUrlAction: React.FC<{inProjectUrl: string}> = ({inProjectUrl}) => {
  const [success, setSuccess] = useState(false)
  const clearSuccessAfterTimeout = useTimeout(() => setSuccess(false), 2000)

  const onSelect = () => {
    navigator.clipboard.writeText(inProjectUrl)
    setSuccess(true)
    clearSuccessAfterTimeout()
  }

  return (
    <ActionList.Item onSelect={onSelect} {...testIdProps('copy-in-project-link-action')}>
      <ActionList.LeadingVisual>
        {success ? <Octicon icon={CheckIcon} sx={{color: 'success.fg'}} /> : <CopyIcon />}
      </ActionList.LeadingVisual>
      {success ? <Text sx={{fontWeight: 'bold', color: 'success.fg'}}>Copied!</Text> : 'Copy link in project'}
    </ActionList.Item>
  )
}

const ArchiveAction: React.FC<{onArchive: () => void}> = ({onArchive}) => (
  <ActionList.Item onSelect={onArchive}>
    <ActionList.LeadingVisual>
      <ArchiveIcon />
    </ActionList.LeadingVisual>
    Archive
  </ActionList.Item>
)

const DeleteAction: React.FC<{onDelete: () => void}> = ({onDelete}) => (
  <ActionList.Item onSelect={onDelete} variant="danger" {...testIdProps('side-pane-delete-action')}>
    <ActionList.LeadingVisual>
      <TrashIcon />
    </ActionList.LeadingVisual>
    Delete from project
  </ActionList.Item>
)
