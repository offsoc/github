import {ListItem} from '../ListItem'
import type {DeploymentsMetadata, RunMetadata} from '../../../../types/rules-types'

export function DeploymentsList({metadata}: {metadata: RunMetadata}) {
  return (
    <ul>
      {(metadata as DeploymentsMetadata).deploymentResults.map(({status, name, sha, id}) => (
        <ListItem
          key={id}
          state={status === 'active' ? 'success' : status}
          title={name}
          description={sha ? `${sha.toString().slice(0, 6)}` : ''}
        />
      ))}
    </ul>
  )
}
