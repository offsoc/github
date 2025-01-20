import {getApiMetadata, setApiMetadataForTests} from '../../client/helpers/api-metadata'

describe('getApiMetadata', () => {
  beforeEach(() => {
    setApiMetadataForTests({})
  })
  it('reads value from JSON island if not in cache', () => {
    const dataId = 'memex-update-api-data'

    const apiEndpoint = {
      token: 'mock-memex-update-api-data-token',
      url: '/mock-memex-update-api-data-url',
    }

    setApiMetadataForTests({[dataId]: apiEndpoint})

    expect(getApiMetadata(dataId)).toEqual(apiEndpoint)
  })

  it('throws error if value not found in JSON island', () => {
    const dataId = 'memex-refresh-api-data'

    expect(() => getApiMetadata(dataId)).toThrow(`Missing API metadata for ${dataId}`)
  })
})
