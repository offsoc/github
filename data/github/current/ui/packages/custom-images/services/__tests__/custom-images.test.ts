import {mockFetch} from '@github-ui/mock-fetch'

import {deleteImageDefinition, deleteImageVersion} from '../custom-images'
import {ERRORS} from '../../helpers/constants'
import {imageDefinitionDeletePath, imageVersionDeletePath} from '../../helpers/paths'

describe('services/custom-images', () => {
  const testOrgLogin = 'test-org'
  const testImageDefinitionId = 'img-def-123'

  describe('deleteImageDefinition', () => {
    test('success', async () => {
      const mock = mockFetch.mockRouteOnce(
        imageDefinitionDeletePath({
          isEnterprise: false,
          entityLogin: testOrgLogin,
          imageDefinitionId: testImageDefinitionId,
        }),
        {},
        {
          ok: true,
          status: 200,
          json: async () => {
            return {success: true, errors: []}
          },
        },
      )

      const result = await deleteImageDefinition(testImageDefinitionId, testOrgLogin)
      expect(mock).toHaveBeenCalledTimes(1)
      expect(result).toEqual({success: true})
    })

    test('unclassified error', async () => {
      mockFetch.mockRouteOnce(
        imageDefinitionDeletePath({
          isEnterprise: false,
          entityLogin: testOrgLogin,
          imageDefinitionId: testImageDefinitionId,
        }),
        {},
        {
          ok: false,
          status: 500,
          json: async () => {
            return {success: false}
          },
        },
      )

      const result = await deleteImageDefinition(testImageDefinitionId, testOrgLogin)
      expect(result.success).toEqual(false)
      expect(result.errorMessage).toEqual(ERRORS.IMAGE_DEFINITION_DELETE_FAILED_REASON_UNKNOWN)
    })

    test('custom error message', async () => {
      const customError = 'Custom error message'
      mockFetch.mockRouteOnce(
        imageDefinitionDeletePath({
          isEnterprise: false,
          entityLogin: testOrgLogin,
          imageDefinitionId: testImageDefinitionId,
        }),
        {},
        {
          ok: false,
          status: 500,
          json: async () => {
            return {success: false, errors: [customError]}
          },
        },
      )

      const result = await deleteImageDefinition(testImageDefinitionId, testOrgLogin)
      expect(result.success).toEqual(false)
      expect(result.errorMessage).toEqual(customError)
    })
  })

  describe('deleteImageVersion', () => {
    const testImageVersion = '1.0.0'

    test('success', async () => {
      const mock = mockFetch.mockRouteOnce(
        imageVersionDeletePath({
          isEnterprise: false,
          entityLogin: testOrgLogin,
          imageDefinitionId: testImageDefinitionId,
          version: testImageVersion,
        }),
        {},
        {
          ok: true,
          status: 200,
          json: async () => {
            return {success: true, errors: []}
          },
        },
      )

      const result = await deleteImageVersion(testImageDefinitionId, testImageVersion, testOrgLogin)
      expect(mock).toHaveBeenCalledTimes(1)
      expect(result).toEqual({success: true})
    })

    test('unclassified error', async () => {
      mockFetch.mockRouteOnce(
        imageVersionDeletePath({
          isEnterprise: false,
          entityLogin: testOrgLogin,
          imageDefinitionId: testImageDefinitionId,
          version: testImageVersion,
        }),
        {},
        {
          ok: false,
          status: 500,
          json: async () => {
            return {success: false}
          },
        },
      )

      const result = await deleteImageVersion(testImageDefinitionId, testImageVersion, testOrgLogin)
      expect(result.success).toEqual(false)
      expect(result.errorMessage).toEqual(ERRORS.IMAGE_VERSION_DELETE_FAILED_REASON_UNKNOWN)
    })

    test('custom error message', async () => {
      const customError = 'Custom error message'
      mockFetch.mockRouteOnce(
        imageVersionDeletePath({
          isEnterprise: false,
          entityLogin: testOrgLogin,
          imageDefinitionId: testImageDefinitionId,
          version: testImageVersion,
        }),
        {},
        {
          ok: false,
          status: 500,
          json: async () => {
            return {success: false, errors: [customError]}
          },
        },
      )

      const result = await deleteImageVersion(testImageDefinitionId, testImageVersion, testOrgLogin)
      expect(result.success).toEqual(false)
      expect(result.errorMessage).toEqual(customError)
    })
  })
})
