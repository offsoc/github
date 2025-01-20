import {testIdProps} from '@github-ui/test-id-props'

import {useBindMemexToDocument} from '../../hooks/use-bind-memex-to-document'
import {BaseSettingsPage} from '../base-settings-page'
import {BulkAddItemsProvider} from '../side-panel/bulk-add/bulk-add-items-provider'
import {AutomationView} from './automation-view'

export function AutomationPage() {
  useBindMemexToDocument()

  return (
    <BulkAddItemsProvider>
      <BaseSettingsPage {...testIdProps('automation-page')}>
        <AutomationView />
      </BaseSettingsPage>
    </BulkAddItemsProvider>
  )
}
