import {Dialog} from '@primer/react/drafts'

import nestedListViewStyles from '../NestedListView.module.css'
import {SuppressSecondaryActionsProvider} from './hooks/use-suppress-actions'
import {NestedListItemMetadataContainer} from './MetadataContainer'
import nestedListItemStyles from './NestedListItem.module.css'
import type {NestedListItemContentProps} from './types'

export interface ControlsDialog extends NestedListItemContentProps {
  onClose: () => void
}

export const ControlsDialog = ({onClose, title, metadata, secondaryActions, children}: ControlsDialog) => (
  <Dialog
    title="Manage item"
    onClose={onClose}
    footerButtons={[
      {
        content: 'Ok',
        onClick: onClose,
      },
    ]}
    sx={{
      // Dialog doesn't accept className yet, so can't migrate this to CSS Modules
      width: '80rem',
    }}
  >
    <SuppressSecondaryActionsProvider value={false}>
      {/* Nested divs because the responsive logic is via container query so the container setup needs to be on a
      parent, and Dialog doesn't support classes yet */}
      <div className={nestedListViewStyles.responsiveContainer}>
        <div className={nestedListItemStyles.itemGrid}>
          {title}
          {children}
          <NestedListItemMetadataContainer>{metadata}</NestedListItemMetadataContainer>
          {secondaryActions}
        </div>
      </div>
    </SuppressSecondaryActionsProvider>
  </Dialog>
)
