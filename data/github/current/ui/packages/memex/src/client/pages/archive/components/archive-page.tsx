import {testIdProps} from '@github-ui/test-id-props'

import {BaseSettingsPage} from '../../../components/base-settings-page'
import {useBindMemexToDocument} from '../../../hooks/use-bind-memex-to-document'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {ArchivedItemsProvider} from '../archive-page-provider'
import {ArchiveView} from './archive-view'
import {PaginatedArchiveView} from './paginated-archive-view'

export function ArchivePage() {
  useBindMemexToDocument()

  const {memex_paginated_archive, memex_table_without_limits} = useEnabledFeatures()
  if (memex_paginated_archive || memex_table_without_limits) {
    return (
      <BaseSettingsPage {...testIdProps('paginated-archive-page')} sx={{scrollbarGutter: 'stable both-edges', mb: 0}}>
        <PaginatedArchiveView />
      </BaseSettingsPage>
    )
  }
  return (
    <BaseSettingsPage {...testIdProps('archive-page')} sx={{scrollbarGutter: 'stable both-edges', mb: 0}}>
      <ArchivedItemsProvider>
        <ArchiveView />
      </ArchivedItemsProvider>
    </BaseSettingsPage>
  )
}
