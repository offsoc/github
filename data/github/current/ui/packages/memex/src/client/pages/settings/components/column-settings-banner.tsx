import {testIdProps} from '@github-ui/test-id-props'
import {AlertIcon} from '@primer/octicons-react'
import {Box, Button, Flash, Heading, Link, Octicon} from '@primer/react'
import {useRef, useState} from 'react'

import {MemexIssueTypeRenameDialog} from '../../../components/user-notices/memex-issue-type-rename-dialog'
import type {ColumnWarningKind} from '../../../helpers/get-column-warning'
import type {ColumnModel} from '../../../models/column-model'
import {ColumnBannerResources} from '../../../strings'

type ColumnSettingsBannerProps = {
  column: ColumnModel
  warning: ColumnWarningKind
}

export function ColumnSettingsBanner({column, warning}: ColumnSettingsBannerProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  // Only rename banner is implemented
  if (warning !== 'rename-custom-type-column') return null

  return (
    <>
      <Flash {...testIdProps('column-settings-banner')} sx={{mb: 6}} variant="warning" aria-live="polite">
        <Box sx={{display: 'flex', width: '100%'}}>
          <div>
            <Octicon icon={AlertIcon} sx={{mr: 2}} />
          </div>
          <Box sx={{flexGrow: 1}}>
            <Heading as="h3" sx={{mb: 0, fontSize: 1}}>
              {ColumnBannerResources.IssueTypeRename.copy1}
            </Heading>
            {ColumnBannerResources.IssueTypeRename.copy2(column.name)}&nbsp;
            <Link target="_blank" rel="noopener noreferrer" href={ColumnBannerResources.IssueTypeRename.learnMoreLink}>
              {ColumnBannerResources.IssueTypeRename.learnMoreText}
            </Link>
          </Box>
          <Box sx={{pl: 4}}>
            <Button ref={buttonRef} onClick={() => setIsRenameDialogOpen(true)}>
              {ColumnBannerResources.IssueTypeRename.actionPrimary}
            </Button>
          </Box>
        </Box>
      </Flash>
      {isRenameDialogOpen && (
        <MemexIssueTypeRenameDialog
          column={column}
          onCancel={() => {
            setIsRenameDialogOpen(false)
            setTimeout(() => buttonRef.current?.focus(), 100)
          }}
          onConfirm={() => {
            setIsRenameDialogOpen(false)
          }}
        />
      )}
    </>
  )
}
