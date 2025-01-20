import {useRepositories} from '../../../client/state-providers/repositories/use-repositories'
import {asMockHook} from '../../mocks/stub-utilities'

jest.mock('../../../client/state-providers/repositories/use-repositories')

// Useful to avoid asynchronous effects of repo fetching when rendering project views
export function mockUseRepositories() {
  asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
}
