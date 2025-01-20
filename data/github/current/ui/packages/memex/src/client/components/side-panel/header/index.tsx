import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {PinIcon, PinSlashIcon, XIcon} from '@primer/octicons-react'
import {Box, Button, IconButton, Link, RelativeTime, Text, TextInput} from '@primer/react'
import {UnderlineNav} from '@primer/react/deprecated'
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {ItemType} from '../../../api/memex-items/item-type'
import type {SidePanelItem} from '../../../api/memex-items/side-panel-item'
import {ItemKeyType, type SidePanelMetadata} from '../../../api/side-panel/contracts'
import {ItemRenameName, SidePanelNavigateToItem, SidePanelUI} from '../../../api/stats/contracts'
import {replaceShortCodesWithEmojis} from '../../../helpers/emojis'
import {SHORTCUTS} from '../../../helpers/keyboard-shortcuts'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {useEmojiAutocomplete} from '../../../hooks/common/use-emoji-autocomplete'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useApiRequest} from '../../../hooks/use-api-request'
import {useSidePanel} from '../../../hooks/use-side-panel'
import {useSidePanelDirtyState} from '../../../hooks/use-side-panel-dirty-state'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useIssueContext} from '../../../state-providers/issues/use-issue-context'
import {Resources} from '../../../strings'
import {SanitizedHtml} from '../../dom/sanitized-html'
import {RepositoryIcon} from '../../fields/repository/repository-icon'
import useToasts, {ToastType} from '../../toasts/use-toasts'
import {SidePanelBreadcrumbsWrapper} from '../breadcrumbs-wrapper'
import {ItemStateLabel} from '../label'
import {TrackingFields} from './fields/tracking-fields'

export type SidePanelTabName = 'details' | 'tracks'

export const SidePanelHeader: React.FC<{
  item: SidePanelItem
  isLoading: boolean
  selectedTab: SidePanelTabName
  onTabChange: (tab: SidePanelTabName) => void
  showBreadcrumbs: boolean
  showTabs: boolean
}> = memo(function SidePanelHeader({item, isLoading, selectedTab, onTabChange, showBreadcrumbs, showTabs}) {
  const {sidePanelMetadata} = useIssueContext()
  const {title, createdAt, user, state, itemKey} = sidePanelMetadata
  const showRepositoryHeader = !showBreadcrumbs && item.contentType === ItemType.Issue

  return (
    <Box as="header" sx={{backgroundColor: 'canvas.default', zIndex: 1}}>
      <Box sx={{px: [3, '', 4], pt: 3}}>
        <Box sx={{display: 'flex'}}>
          <Box sx={{display: 'flex', flexDirection: 'column', flex: 'auto'}}>
            <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'row-reverse'}}>
              <SidePanelToolbar showCloseButton />

              {showBreadcrumbs && (
                <Box {...testIdProps('side-panel-breadcrumbs')} sx={{flexGrow: 1}}>
                  <SidePanelBreadcrumbsWrapper />
                </Box>
              )}

              {showRepositoryHeader && (
                <Box sx={{flex: 1}}>
                  <RepositoryHeader item={item} />
                </Box>
              )}
            </Box>

            <SidePanelTitle item={item} title={title} isLoading={isLoading} />

            {!isLoading && createdAt && user.login ? (
              <Box sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 1}}>
                <ItemStateLabel itemType={itemKey.kind} state={state} />
                <TrackingFields />
                <Text sx={{fontSize: 1, fontStyle: 'normal'}} as="address">
                  <Text sx={{fontWeight: 'bold'}}>{user.login}</Text>
                  <Text sx={{color: 'fg.muted'}}>
                    {' opened '}
                    <RelativeTime datetime={createdAt} />
                  </Text>
                </Text>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
      {showTabs ? (
        <SidePanelItemTabs selectedTab={selectedTab} onTabChange={onTabChange} />
      ) : (
        // tabs have a built-in border; if we don't render them then we need to add a visual separator
        <Box
          sx={{
            borderBottom: '1px solid',
            borderColor: 'border.muted',
            pb: 4,
          }}
        />
      )}
    </Box>
  )
})

SidePanelHeader.displayName = 'SidePanelHeader'

interface SidePanelTitleProps {
  item: SidePanelItem
  title: SidePanelMetadata['title']
  isLoading: boolean
}

// This is a static header for use until tasklist_block is fully enabled for the breadcrumb header
const RepositoryHeader: React.FC<{
  item: SidePanelItem
}> = ({item}) => {
  const repository = item.getExtendedRepository()
  const repoName = repository?.name || item.getRepositoryName() || ''
  const repoIcon = repository?.url ? <RepositoryIcon repository={repository} /> : undefined

  return (
    <Box sx={{display: 'flex', alignItems: 'center'}}>
      {repoIcon && <Text sx={{mr: 1}}>{repoIcon}</Text>}
      <span>{`${repoName} #${item.getItemNumber()}`}</span>
    </Box>
  )
}

interface ToolbarProps {
  children?: React.ReactNode
  showCloseButton: boolean
}

export const SidePanelToolbar = ({children, showCloseButton}: ToolbarProps) => {
  const {pinButtonRef, closePane, pinned, setPinned} = useSidePanel()

  return (
    <Box role="group" aria-label={Resources.sidePanelToolbarLabel} sx={{display: 'flex', flexDirection: 'row-reverse'}}>
      {showCloseButton && (
        <IconButton
          variant="invisible"
          aria-label="Close panel"
          icon={XIcon}
          onClick={() => closePane()}
          {...testIdProps('side-panel-button-close')}
        />
      )}
      <IconButton
        variant="invisible"
        aria-label={pinned ? Resources.sidePanelUnpinLabel : Resources.sidePanelPinLabel}
        icon={pinned ? PinSlashIcon : PinIcon}
        onClick={() => setPinned(!pinned)}
        ref={pinButtonRef}
        tooltipDirection="sw"
      />
      {children}
    </Box>
  )
}

const SidePanelTitle = memo(function SidePanelTitle({item, title, isLoading}: SidePanelTitleProps) {
  const [isEditing, setIsEditing] = useSidePanelDirtyState()
  const [editingTitle, setEditingTitle] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const {hasWritePermissions} = ViewerPrivileges()
  const {postStats} = usePostStats()
  const {addToast} = useToasts()
  const {
    editIssueTitle,
    sidePanelMetadata: {capabilities, itemKey, issueNumber, url},
  } = useIssueContext()

  const canEditTitle = useMemo(() => capabilities?.includes('editTitle'), [capabilities])

  const setEditingTitleFromItem = useCallback(() => {
    if (isEditing) return

    setEditingTitle(title.raw)
  }, [title, isEditing])

  // Update the title if we receive a _new_ item only
  useEffect(() => setEditingTitleFromItem(), [setEditingTitleFromItem])

  const titleChangeRequest = useCallback(
    async (newValue: string) => {
      const newTitle = replaceShortCodesWithEmojis(newValue)

      const memexItem = item as MemexItemModel
      if (!memexItem) {
        return
      }

      await editIssueTitle(newTitle)
      postStats({
        name: ItemRenameName,
        ui: SidePanelUI,
        memexProjectItemId: item.id,
      })
    },
    [editIssueTitle, item, postStats],
  )

  const handleTitleChangeRequest = useApiRequest({
    request: titleChangeRequest,
    rollback: setEditingTitleFromItem,
  })

  const stopEditingAndSave = useCallback(async () => {
    if (inputRef.current && inputRef.current instanceof HTMLInputElement) {
      const newValue = inputRef.current.value.trim()
      if (newValue === '') {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({message: Resources.titleCannotBeBlank, type: ToastType.warning})
        return
      }
      await handleTitleChangeRequest.perform(newValue)
    }
    setIsEditing(false)
  }, [handleTitleChangeRequest, addToast, setIsEditing])

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditingTitle(e.target.value)
    },
    [setEditingTitle],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      switch (e.key) {
        case SHORTCUTS.ENTER:
          stopEditingAndSave()
          e.preventDefault()
          break

        case SHORTCUTS.ESCAPE:
          setEditingTitleFromItem()
          setIsEditing(false)
          e.preventDefault()
          break
      }
    },
    [stopEditingAndSave, setEditingTitleFromItem, setIsEditing],
  )

  const inputCompositionProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)

  const onClick = useCallback((): void => {
    if (hasWritePermissions) {
      setEditingTitleFromItem()
      setIsEditing(true)
    }
  }, [hasWritePermissions, setEditingTitleFromItem, setIsEditing])

  useEffect(() => {
    if (isEditing) {
      // If we just started editing, focus the newly rendered input
      inputRef.current?.focus()
    } else {
      // If we just stopped editing, and we didn't focus
      // on something else, then focus on the title input
      setTimeout(() => {
        if (document.activeElement === document.body) {
          inputRef.current?.focus()
        }
      })
    }
  }, [isEditing])

  const autocompleteProps = useEmojiAutocomplete()

  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        pt: isEditing ? 1 : 0,
        mb: isEditing ? 1 : 0,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
        }}
        {...testIdProps('side-panel-title')}
      >
        {isEditing ? (
          <InlineAutocomplete {...autocompleteProps} fullWidth>
            <TextInput
              aria-label="Item title"
              sx={{lineHeight: '18px'}}
              ref={inputRef}
              value={editingTitle}
              onChange={onChange}
              {...inputCompositionProps}
              size="small"
              {...testIdProps('side-panel-title-input')}
            />
          </InlineAutocomplete>
        ) : (
          <>
            <Text
              sx={{
                fontSize: 4,
                fontWeight: 'bold',
                maxWidth: '100%',
                display: 'inline',
                wordBreak: 'break-word',
              }}
              as="h2"
              {...testIdProps('side-panel-title-content')}
            >
              {isLoading ? (
                <Text sx={{fontWeight: 'normal', fontSize: 3}}>Loading...</Text>
              ) : itemKey.kind === ItemKeyType.ISSUE && !!issueNumber && !!url ? (
                <Link
                  href={url}
                  target="_blank"
                  sx={{color: 'fg.default'}}
                  onClick={() => postStats({name: SidePanelNavigateToItem})}
                >
                  <SanitizedHtml as="bdi">{title.html}</SanitizedHtml>
                  <Text sx={{ml: 2, color: 'fg.muted', fontWeight: 'normal'}}>#{issueNumber}</Text>
                </Link>
              ) : (
                <SanitizedHtml as="bdi">{title.html}</SanitizedHtml>
              )}
            </Text>
          </>
        )}
      </Box>
      <Box sx={{mt: isEditing ? 0 : 1}}>
        {!isEditing && !isLoading && canEditTitle && (
          <Button
            size="small"
            onClick={onClick}
            variant="invisible"
            {...testIdProps('side-panel-title-edit-button')}
            sx={{color: 'fg.default'}}
          >
            {Resources.editTitle}
          </Button>
        )}
        {isEditing && (
          <Box sx={{display: 'flex', gap: 2}}>
            <Button
              size="small"
              variant="primary"
              onClick={stopEditingAndSave}
              {...testIdProps('side-panel-title-save-button')}
            >
              Save
            </Button>
            <Button
              size="small"
              onClick={() => {
                setEditingTitleFromItem()
                setIsEditing(false)
              }}
              {...testIdProps('side-panel-title-revert-button')}
            >
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
})

const SidePanelItemTabs: React.FC<{
  selectedTab: SidePanelTabName
  onTabChange: (tab: SidePanelTabName) => void
}> = ({selectedTab, onTabChange}) => (
  <UnderlineNav sx={{pl: 3, flexShrink: 0, cursor: 'pointer', borderBottom: 0}}>
    <UnderlineNav.Link
      onClick={() => onTabChange('details')}
      selected={selectedTab === 'details'}
      sx={{'&:hover': {outline: 'none'}}}
    >
      Details
    </UnderlineNav.Link>
    <UnderlineNav.Link
      onClick={() => onTabChange('tracks')}
      selected={selectedTab === 'tracks'}
      sx={{'&:hover': {outline: 'none'}}}
    >
      Tracks
    </UnderlineNav.Link>
  </UnderlineNav>
)
