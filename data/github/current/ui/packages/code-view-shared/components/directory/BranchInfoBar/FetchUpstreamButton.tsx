import type {RefComparison} from '@github-ui/code-view-types'
import {SyncIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionMenu, Button} from '@primer/react'

import {FetchPopoverContainer} from './FetchPopoverContainer'
import {PopoverContainer} from './InfobarPopover'
import {useReposAnalytics} from '../../../hooks/use-repos-analytics'

interface Props {
  comparison: RefComparison
}

export function FetchUpstreamButton({comparison}: Props) {
  const {sendRepoClickEvent} = useReposAnalytics()

  return (
    <ActionMenu
      onOpenChange={open =>
        open &&
        sendRepoClickEvent('SYNC_FORK_BUTTON', {
          category: 'Branch Infobar',
          action: 'Open Fetch upstream dropdown',
          label: 'ref_loc:fetch_upstream_dropdown',
          ahead: comparison.ahead,
          behind: comparison.behind,
        })
      }
    >
      <ActionMenu.Anchor>
        <Button leadingVisual={SyncIcon} trailingAction={TriangleDownIcon}>
          Sync fork
        </Button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay align="end" className="mt-2">
        <PopoverContainer>
          <FetchPopoverContainer comparison={comparison} />
        </PopoverContainer>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
