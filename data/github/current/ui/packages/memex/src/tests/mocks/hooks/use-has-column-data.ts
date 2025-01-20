// Avoid waiting for required field effects where there is no discernable UI change
import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {asMockHook} from '../../mocks/stub-utilities'

jest.mock('../../../client/state-providers/columns/use-has-column-data')

export function mockUseHasColumnData() {
  asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
}
