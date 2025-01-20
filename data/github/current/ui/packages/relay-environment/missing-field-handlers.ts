import {ROOT_TYPE} from 'relay-runtime'
import type {MissingFieldHandler} from 'relay-runtime/lib/store/RelayStoreTypes'

// By using these missing field handlers, we can avoid making unnecesssary network requests for the following queries:
//
// - node(id: $id)
// - nodes(ids: $ids)
//
// By default these queries will hit the network, regardless of whether you have the data in the store already.
// By using these missing field handlers relay will query the relay store for the node when this field is queried.
// If the node(s) do not exist (or they are missing data) in the store relay will fall back to making the request
// to the network (That is unless you are using `store-only`). One can override this behavior by passing in a
// fetchPolicy of 'network-only', which will result in bypassing the local store.
//
// TLDR: All these handlers do is tell relay: when you see a query with the node/nodes field name,
// look in the store via this ID. All other behavior stays the same.
//
// Documentation: https://relay.dev/docs/guided-tour/reusing-cached-data/filling-in-missing-data/
export const missingFieldHandlers: MissingFieldHandler[] = [
  {
    kind: 'linked',
    handle(field, record, argValues) {
      if (record != null && record.getType() === ROOT_TYPE && field.name === 'node' && argValues.hasOwnProperty('id')) {
        // If field is node(id: $id), look up the record by the value of $id
        return argValues.id
      }
      return undefined
    },
  },
  {
    kind: 'pluralLinked',
    handle(field, record, argValues) {
      if (
        record != null &&
        record.getType() === ROOT_TYPE &&
        field.name === 'nodes' &&
        argValues.hasOwnProperty('ids')
      ) {
        // If field is nodes(ids: $id), look up the records by the value of $ids
        return argValues.ids
      }
    },
  },
]
