import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import type {SavedViewRow$data, SavedViewRow$key} from './__generated__/SavedViewRow.graphql'
import {SavedViewItem} from './SavedViewItem'

type Props = {
  savedView: SavedViewRow$key
  position: number
}
const SavedViewRowFragment = graphql`
  fragment SavedViewRow on SearchShortcut {
    id
    icon
    name
    color
    description
    query
    scopingRepository {
      name
      owner {
        login
      }
    }
  }
`

export function SavedViewRow({savedView, position}: Props) {
  const shortcut = useFragment(SavedViewRowFragment, savedView)

  const createQuery = (curShortcut: SavedViewRow$data) => {
    const query = curShortcut.query
    const repo = curShortcut.scopingRepository
    return repo ? `repo:${repo.owner.login}/${repo.name} ${query}` : query
  }

  return (
    shortcut && (
      <SavedViewItem
        isTree
        key={shortcut.id}
        id={shortcut.id}
        position={position}
        icon={shortcut.icon}
        color={shortcut.color}
        title={shortcut.name}
        description={shortcut.description}
        query={createQuery(shortcut)}
      />
    )
  )
}
