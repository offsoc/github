import {testIdProps} from '@github-ui/test-id-props'

import {BaseSettingsPage} from '../../../components/base-settings-page'
import {useBindMemexToDocument} from '../../../hooks/use-bind-memex-to-document'
import {SettingsView} from './settings-view'

export function SettingsPage() {
  useBindMemexToDocument()

  return (
    <BaseSettingsPage {...testIdProps('settings-page')}>
      <SettingsView />
    </BaseSettingsPage>
  )
}
