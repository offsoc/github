import {ListItem} from '../ListItem'
import type {ChecksMetadata, RunMetadata} from '../../../../types/rules-types'

export function StatusChecksList({metadata}: {metadata: RunMetadata}) {
  return (
    <ul>
      {(metadata as ChecksMetadata).checks.map(
        ({integrationName, integrationAvatarUrl, checkRunName, state, id, sha, description, warning}) => (
          <ListItem
            key={id}
            state={state}
            avatarUrl={integrationAvatarUrl}
            avatarLabel={integrationName}
            title={`${integrationName} / ${checkRunName}`}
            description={`${description} ${sha ? `• ${sha.toString().slice(0, 6)}` : ''}`}
            warning={warning}
          />
        ),
      )}
    </ul>
  )
}
