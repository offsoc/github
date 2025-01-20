import {CopyIcon, KebabHorizontalIcon, XIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, IconButton} from '@primer/react'
import {useMemo, useRef} from 'react'
import {graphql, useFragment} from 'react-relay'

import {BUTTON_LABELS} from '../../constants/buttons'
import {LABELS} from '../../constants/labels'
import {TEST_IDS} from '../../constants/test-ids'
import type {HeaderMenu$key} from './__generated__/HeaderMenu.graphql'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {CreateIssueButton} from '@github-ui/issue-create/CreateIssueButton'
import type {OptionConfig} from '../OptionConfig'
import {noop} from '@github-ui/noop'
import {useContainerBreakpoint} from '@github-ui/use-container-breakpoint'

export type HeaderMenuBaseProps = {
  optionConfig: OptionConfig
  metadataPaneTrigger: JSX.Element
  setIsIssueTitleEditActive?: (isActive: boolean) => void
  containerRef?: React.RefObject<HTMLDivElement>
}

type HeaderMenuProps = {
  headerMenuData: HeaderMenu$key
} & HeaderMenuBaseProps

const HeaderMenuFragment = graphql`
  fragment HeaderMenu on Issue {
    id
    viewerCanUpdateNext
    repository {
      id
      name
      owner {
        login
      }
      isArchived
    }
    url
  }
`

export function HeaderMenu({
  headerMenuData,
  setIsIssueTitleEditActive,
  containerRef,
  optionConfig: {
    customEditMenuEntries,
    navigate,
    showIssueCreateButton,
    additionalHeaderActions,
    onClose,
    commentBoxConfig,
    singleKeyShortcutsEnabled,
    useViewportQueries,
  },
}: HeaderMenuProps) {
  const {viewerCanUpdateNext, url, repository} = useFragment(HeaderMenuFragment, headerMenuData)

  const breakpoint = useContainerBreakpoint(containerRef?.current ?? null)

  const anchorRef = useRef<HTMLButtonElement>(null)

  const scopedRepository = {
    id: repository.id,
    name: repository.name,
    owner: repository.owner.login,
  }

  const editIssueTitleButton = useMemo(
    () =>
      viewerCanUpdateNext ? (
        <Button
          data-testid={TEST_IDS.editIssueTitleButton}
          aria-label={LABELS.editTitle}
          onClick={() => setIsIssueTitleEditActive && setIsIssueTitleEditActive(true)}
          size="medium"
        >
          {BUTTON_LABELS.editTitle}
        </Button>
      ) : null,
    [setIsIssueTitleEditActive, viewerCanUpdateNext],
  )

  return (
    <>
      <Box sx={{display: 'flex', gap: 1, flexDirection: 'row', flexGrow: 1, justifyContent: 'end'}}>
        {editIssueTitleButton}
        <Box
          sx={{
            display: 'flex',
            flexGrow: useViewportQueries ? ['1', '1', '0', '0'] : breakpoint(['1', '1', '0', '0']),
            flexBasis: 'auto',
            ml: 1,
          }}
        >
          {showIssueCreateButton && !repository.isArchived && (
            <CreateIssueButton
              label={BUTTON_LABELS.new}
              navigate={navigate}
              optionConfig={{
                scopedRepository,
                showFullScreenButton: true,
                // Only navigate if we're in the Repo#Index (ie, have a scoped repository)
                navigateToFullScreenOnTemplateChoice: navigate !== noop && scopedRepository !== null,
                singleKeyShortcutsEnabled,
                useMonospaceFont: commentBoxConfig?.useMonospaceFont,
                pasteUrlsAsPlainText: commentBoxConfig?.pasteUrlsAsPlainText,
                emojiSkinTonePreference: commentBoxConfig?.emojiSkinTonePreference,
              }}
            />
          )}
        </Box>
        <CopyToClipboardButton
          textToCopy={url}
          ariaLabel={BUTTON_LABELS.copyIssueLink}
          icon={CopyIcon}
          tooltipProps={{direction: 's'}}
        />
        {additionalHeaderActions}
        {customEditMenuEntries && (
          <ActionMenu anchorRef={anchorRef}>
            <ActionMenu.Anchor>
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip={true}
                variant="invisible"
                sx={{flexShrink: 0}}
                icon={KebabHorizontalIcon}
                aria-label={BUTTON_LABELS.issueActions}
                ref={anchorRef}
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay>
              <ActionList>{customEditMenuEntries.map(e => e)}</ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
        {onClose && (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            variant="invisible"
            aria-label={BUTTON_LABELS.closePanel}
            icon={XIcon}
            onClick={onClose}
          />
        )}
      </Box>
    </>
  )
}

export function StickyHeaderMenu({
  headerMenuData,
  optionConfig: {customEditMenuEntries, additionalHeaderActions, onClose},
}: HeaderMenuProps) {
  const {url} = useFragment(HeaderMenuFragment, headerMenuData)

  const anchorRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Box sx={{display: 'flex', gap: 1, flexDirection: 'row', flexGrow: 1, justifyContent: 'end'}}>
        <CopyToClipboardButton
          textToCopy={url}
          ariaLabel={BUTTON_LABELS.copyIssueLink}
          icon={CopyIcon}
          tooltipProps={{direction: 's'}}
        />
        {additionalHeaderActions}
        {customEditMenuEntries && (
          <ActionMenu anchorRef={anchorRef}>
            <ActionMenu.Anchor>
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip={true}
                variant="invisible"
                sx={{flexShrink: 0}}
                icon={KebabHorizontalIcon}
                aria-label={BUTTON_LABELS.issueActions}
                ref={anchorRef}
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay>
              <ActionList>{customEditMenuEntries.map(e => e)}</ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
        {onClose && (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            variant="invisible"
            aria-label={BUTTON_LABELS.closePanel}
            icon={XIcon}
            onClick={onClose}
          />
        )}
      </Box>
    </>
  )
}
