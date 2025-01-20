import type {ApiMetadataJSONIsland} from '../services/types'
import {fetchJSONIslandData} from './json-island'

let apiData: Partial<ApiMetadataJSONIsland> = {}

/**
 * Retrieves data for a certain api endpoint. If data for that endpoint does not exist,
 * it will attempt to retrieve that data from the JSON island, and then cache it for future use.
 * @param dataId key representing endpoint data returned from backend
 */
export function getApiMetadata<K extends keyof ApiMetadataJSONIsland>(dataId: K): ApiMetadataJSONIsland[K] {
  let endpointData = apiData[dataId]
  if (!endpointData) {
    endpointData = fetchJSONIslandData(dataId)
    if (!endpointData) {
      throw new Error(`Missing API metadata for ${dataId}`)
    } else {
      apiData[dataId] = endpointData
    }
  }
  return endpointData
}

/**
 * Test helper to supply API metadata for tests,
 * allowing us to bypass the JSON island.
 *
 * Should only be called within tests
 *
 * @param newApiData subset of API data to populate cache
 */
export function setApiMetadataForTests(newApiData: Partial<ApiMetadataJSONIsland>) {
  apiData = newApiData
}
