import {createRunnerPath, runnerDetailsPath, updateRunnerPath} from '../paths'

describe('Path helpers', () => {
  describe('createRunnerPath', () => {
    test('should return expected path for organization', () => {
      expect(createRunnerPath({isEnterprise: false, entityLogin: 'test-org'})).toEqual(
        '/organizations/test-org/settings/actions/github-hosted-runners/',
      )
    })

    test('should return expected path for enterprise', () => {
      expect(createRunnerPath({isEnterprise: true, entityLogin: 'test-biz'})).toEqual(
        '/enterprises/test-biz/settings/actions/github-hosted-runners/',
      )
    })
  })

  describe('runnerDetailsPath', () => {
    test('should return expected path for organization', () => {
      expect(runnerDetailsPath({isEnterprise: false, entityLogin: 'test-org', runnerId: 99})).toEqual(
        '/organizations/test-org/settings/actions/github-hosted-runners/99',
      )
    })

    test('should return expected path for enterprise', () => {
      expect(runnerDetailsPath({isEnterprise: true, entityLogin: 'test-biz', runnerId: 88})).toEqual(
        '/enterprises/test-biz/settings/actions/github-hosted-runners/88',
      )
    })
  })

  describe('updateRunnerPath', () => {
    test('should return expected path for organization', () => {
      expect(updateRunnerPath({isEnterprise: false, entityLogin: 'test-org', runnerId: 999})).toEqual(
        '/organizations/test-org/settings/actions/github-hosted-runners/999',
      )
    })

    test('should return expected path for enterprise', () => {
      expect(updateRunnerPath({isEnterprise: true, entityLogin: 'test-biz', runnerId: 888})).toEqual(
        '/enterprises/test-biz/settings/actions/github-hosted-runners/888',
      )
    })
  })
})
