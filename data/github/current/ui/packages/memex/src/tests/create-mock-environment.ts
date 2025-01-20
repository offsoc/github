import type {EnabledFeatures} from '../client/api/enabled-features/contracts'
import type {JSONIslandData} from '../client/helpers/json-island'
import type {MockDatabaseAsyncData} from '../mocks/in-memory-database/mock-database'
import {MockServer} from '../mocks/server/mock-server'
import {mswServer} from './msw-server'

/**
 * Helper function designed to set up an "environment" for testing.
 * An environment means the initial data that is seeded into the JSON islands,
 * data that is sent to the MockServer to be used in the response for API requests,
 * and adding the necessary clients and services to the page context.
 *
 * This function returns the page context and mock server to the call in case they need to
 * do anything with those objects in their tests
 */
export const createMockEnvironment = (
  {
    jsonIslandData,
    ...serverData
  }: MockDatabaseAsyncData & {
    jsonIslandData: Partial<JSONIslandData>
  } = {jsonIslandData: {}},
) => {
  const featureData: Array<EnabledFeatures> = [...(jsonIslandData['memex-enabled-features'] || [])]

  const server = new MockServer({
    jsonIslandData: {...jsonIslandData, 'memex-enabled-features': featureData},
    ...serverData,
  })

  server.seedJSONIslandData()
  /**
   * Initialize mock-service-worker handlers
   */
  mswServer.use(...server.handlers)
  return {server}
}
