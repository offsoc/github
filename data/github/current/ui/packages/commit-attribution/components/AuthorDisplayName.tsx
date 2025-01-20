import {Text, Truncate} from '@primer/react'
import type {AuthorSettings} from '../contexts/AuthorSettingsContext'

const MAX_WIDTH = ['150px', '150px', '200px']

/**
 * Renders the display name of an author. This happens when the author does not have a login.
 */
export function AuthorDisplayName({
  displayName,
  authorSettings,
}: {
  displayName: string
  authorSettings: AuthorSettings
}) {
  return (
    <Truncate title={displayName} maxWidth={MAX_WIDTH} inline>
      <Text sx={{fontWeight: authorSettings.fontWeight, whiteSpace: 'nowrap', color: authorSettings.fontColor}}>
        {displayName}
      </Text>
    </Truncate>
  )
}
