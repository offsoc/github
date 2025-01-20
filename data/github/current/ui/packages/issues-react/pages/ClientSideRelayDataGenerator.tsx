import {type Environment, graphql} from 'react-relay'
import {RecordSource} from 'relay-runtime'

import {
  EMPTY_VIEW,
  KNOWN_VIEWS,
  NEW_VIEW,
  PULLS_ASSIGNED_TO_ME_VIEW,
  RELAY_STORE_IDS,
} from '../constants/view-constants'
import {clientSideRelayFetchQueryRetained} from '@github-ui/relay-environment'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordMap = Record<string, any>

const ClientSideRelayDataGeneratorQuery = graphql`
  query ClientSideRelayDataGeneratorQuery($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Shortcutable {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...ListCurrentViewFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...IssueDetailCurrentViewFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...EditViewButtonCurrentViewFragment
      }
    }
  }
`
export const currentViewQuery = graphql`
  query ClientSideRelayDataGeneratorViewQuery($id: ID = "assigned") {
    node(id: $id) {
      ... on Shortcutable {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...ListCurrentViewFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...IssueDetailCurrentViewFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...EditViewButtonCurrentViewFragment
      }
    }
  }
`

export const setRecordMap = (environment: Environment) => {
  const recordMap: RecordMap = {}

  // Creating entries in the store for the static views, which do not have a corresponding record in the DB
  // Thanks to the missingFieldHandler, a node request for one of these views will retrieve them from Relay cache
  for (const view of [EMPTY_VIEW, NEW_VIEW, PULLS_ASSIGNED_TO_ME_VIEW, ...KNOWN_VIEWS]) {
    recordMap[view.id] = {
      __typename: 'KnownShortcut',
      __id: view.id, // important to have this for relay to work
      ...view,
    }
  }

  // This is pre-adding the known types in the store, which is needed for the node identification
  // This is only added once a component is rendered with data of a specific type
  // Tracked issue in https://github.com/facebook/relay/issues/4028
  const knownTypes = [`client:__type:KnownShortcut`, `client:__type:TeamSearchShortcut`, `client:__type:SearchShortcut`]
  for (const knownTypeId of knownTypes) {
    recordMap[knownTypeId] = {
      __typename: '__TypeSchema',
      __id: knownTypeId,
      __isShortcutable: true,
    }
  }

  environment.getStore().publish(new RecordSource(recordMap))
}

export function clientSideRelayDataGenerator({environment}: {environment: Environment}) {
  const variables = {ids: RELAY_STORE_IDS}
  clientSideRelayFetchQueryRetained({environment, query: ClientSideRelayDataGeneratorQuery, variables}).subscribe({})
}
