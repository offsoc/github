import {imageDefinitionDeletePath, imageVersionDeletePath, imageVersionsListPath} from '../paths'

describe('Path helpers', () => {
  describe('imageDefinitionDeletePath', () => {
    test('should return expected path for organization', () => {
      expect(
        imageDefinitionDeletePath({
          imageDefinitionId: '123',
          isEnterprise: false,
          entityLogin: 'test-org',
        }),
      ).toEqual('/organizations/test-org/settings/actions/custom-images/123')
    })

    test('should return expected path for enterprise', () => {
      expect(
        imageDefinitionDeletePath({
          imageDefinitionId: '123',
          isEnterprise: true,
          entityLogin: 'test-biz',
        }),
      ).toEqual('/enterprises/test-biz/settings/actions/custom-images/123')
    })
  })

  describe('imageVersionDeletePath', () => {
    test('should return expected path for organization', () => {
      expect(
        imageVersionDeletePath({
          imageDefinitionId: '123',
          version: '1.0.0',
          isEnterprise: false,
          entityLogin: 'test-org',
        }),
      ).toEqual('/organizations/test-org/settings/actions/custom-images/123/versions/1.0.0')
    })

    test('should return expected path for enterprise', () => {
      expect(
        imageVersionDeletePath({
          imageDefinitionId: '123',
          version: '1.0.0',
          isEnterprise: true,
          entityLogin: 'test-biz',
        }),
      ).toEqual('/enterprises/test-biz/settings/actions/custom-images/123/versions/1.0.0')
    })
  })

  describe('imageVersionsListPath', () => {
    test('should return expected path for organization', () => {
      expect(
        imageVersionsListPath({
          imageDefinitionId: '123',
          isEnterprise: false,
          entityLogin: 'test-org',
        }),
      ).toEqual('/organizations/test-org/settings/actions/custom-images/123/versions')
    })

    test('should return expected path for enterprise', () => {
      expect(
        imageVersionsListPath({
          imageDefinitionId: '123',
          isEnterprise: true,
          entityLogin: 'test-biz',
        }),
      ).toEqual('/enterprises/test-biz/settings/actions/custom-images/123/versions')
    })
  })
})
