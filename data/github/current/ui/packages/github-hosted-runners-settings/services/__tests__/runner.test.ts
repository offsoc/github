import {mockFetch} from '@github-ui/mock-fetch'

import {createRunner, updateRunner} from '../runner'
import {getRunnerCreateForm, getRunnerEditForm} from '../../test-utils/mock-data'
import {ERRORS} from '../../helpers/constants'
import {createRunnerPath, updateRunnerPath} from '../../helpers/paths'

describe('services/runner', () => {
  const testOrgLogin = 'test-org'

  describe('createRunner', () => {
    test('success', async () => {
      const mock = mockFetch.mockRouteOnce(
        createRunnerPath({isEnterprise: false, entityLogin: testOrgLogin}),
        {},
        {
          ok: true,
          status: 200,
          json: async () => {
            return {success: true, errors: [], data: {runnerId: 1}}
          },
        },
      )

      const runnerId = await createRunner(getRunnerCreateForm(), testOrgLogin)
      expect(mock).toHaveBeenCalledTimes(1)
      expect(runnerId).toEqual(1)
    })

    test('unclassified error', async () => {
      mockFetch.mockRouteOnce(
        createRunnerPath({isEnterprise: false, entityLogin: testOrgLogin}),
        {},
        {
          ok: false,
          status: 500,
          json: async () => {
            return {success: false, errors: ['Unable to create runner'], data: {}}
          },
        },
      )

      await expect(async () => await createRunner(getRunnerCreateForm(), testOrgLogin)).rejects.toThrow(
        new Error(ERRORS.CREATION_FAILED_REASON_UNKNOWN),
      )
    })

    test('name conflict error', async () => {
      const runner = getRunnerCreateForm()
      mockFetch.mockRouteOnce(
        createRunnerPath({isEnterprise: false, entityLogin: testOrgLogin}),
        {},
        {
          ok: false,
          status: 409,
          json: async () => {
            return {success: false, errors: ['Name conflict'], data: {}}
          },
        },
      )

      await expect(async () => await createRunner(runner, testOrgLogin)).rejects.toThrow(
        new Error(ERRORS.RUNNER_NAME_ALREADY_EXISTS(runner.name)),
      )
    })

    test('known validation error', async () => {
      const runner = getRunnerCreateForm()
      mockFetch.mockRouteOnce(
        createRunnerPath({isEnterprise: false, entityLogin: testOrgLogin}),
        {},
        {
          ok: false,
          status: 422,
          json: async () => {
            return {success: false, error: 'Maximum runners setting is invalid.', error_category: 'known', data: {}}
          },
        },
      )

      await expect(async () => await createRunner(runner, testOrgLogin)).rejects.toThrow(
        new Error('Maximum runners setting is invalid.'),
      )
    })

    test('unknown validation error', async () => {
      const runner = getRunnerCreateForm()
      mockFetch.mockRouteOnce(
        createRunnerPath({isEnterprise: false, entityLogin: testOrgLogin}),
        {},
        {
          ok: false,
          status: 422,
          json: async () => {
            return {success: false, error: 'Unknown validation error.', data: {}}
          },
        },
      )

      await expect(async () => await createRunner(runner, testOrgLogin)).rejects.toThrow(
        new Error(ERRORS.CREATION_FAILED_REASON_UNKNOWN),
      )
    })
  })

  describe('updateRunner', () => {
    const runnerId = 1

    test('success', async () => {
      const mock = mockFetch.mockRouteOnce(
        updateRunnerPath({isEnterprise: false, entityLogin: testOrgLogin, runnerId}),
        {},
        {
          ok: true,
          status: 200,
          json: async () => {
            return {success: true, errors: []}
          },
        },
      )

      const success = await updateRunner(getRunnerEditForm(), runnerId, testOrgLogin)
      expect(mock).toHaveBeenCalledTimes(1)
      expect(success).toEqual(true)
    })

    test('unclassified error', async () => {
      mockFetch.mockRouteOnce(
        updateRunnerPath({isEnterprise: false, entityLogin: testOrgLogin, runnerId}),
        {},
        {
          ok: false,
          status: 500,
          json: async () => {
            return {success: false, errors: ['Unable to create runner']}
          },
        },
      )

      await expect(async () => await updateRunner(getRunnerEditForm(), runnerId, testOrgLogin)).rejects.toThrow(
        new Error(ERRORS.UPDATE_FAILED_REASON_UNKNOWN),
      )
    })

    test('name conflict error', async () => {
      const runner = getRunnerCreateForm()
      mockFetch.mockRouteOnce(
        updateRunnerPath({isEnterprise: false, entityLogin: testOrgLogin, runnerId}),
        {},
        {
          ok: false,
          status: 409,
          json: async () => {
            return {success: false, errors: ['Name conflict']}
          },
        },
      )

      await expect(async () => await updateRunner(getRunnerEditForm(), runnerId, testOrgLogin)).rejects.toThrow(
        new Error(ERRORS.RUNNER_NAME_ALREADY_EXISTS(runner.name)),
      )
    })

    test('known validation error', async () => {
      mockFetch.mockRouteOnce(
        updateRunnerPath({isEnterprise: false, entityLogin: testOrgLogin, runnerId}),
        {},
        {
          ok: false,
          status: 422,
          json: async () => {
            return {success: false, error: 'Maximum runners setting is invalid.', error_category: 'known', data: {}}
          },
        },
      )

      await expect(async () => await updateRunner(getRunnerEditForm(), runnerId, testOrgLogin)).rejects.toThrow(
        new Error('Maximum runners setting is invalid.'),
      )
    })

    test('unknown validation error', async () => {
      mockFetch.mockRouteOnce(
        updateRunnerPath({isEnterprise: false, entityLogin: testOrgLogin, runnerId}),
        {},
        {
          ok: false,
          status: 422,
          json: async () => {
            return {success: false, error: 'Unknown validation error.', data: {}}
          },
        },
      )

      await expect(async () => await updateRunner(getRunnerEditForm(), runnerId, testOrgLogin)).rejects.toThrow(
        new Error(ERRORS.UPDATE_FAILED_REASON_UNKNOWN),
      )
    })
  })
})
