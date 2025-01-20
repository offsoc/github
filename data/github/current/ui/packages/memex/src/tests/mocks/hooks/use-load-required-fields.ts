import {
  useGetFieldIdsFromFilter,
  useLoadRequiredFieldsForViewsAndCurrentView,
} from '../../../client/hooks/use-load-required-fields'
import {asMockHook} from '../../mocks/stub-utilities'

jest.mock('.../../../../client/hooks/use-load-required-fields')

export function mockUseGetFieldIdsFromFilter() {
  asMockHook(useGetFieldIdsFromFilter).mockReturnValue({
    getFieldIdsFromFilter: jest.fn().mockReturnValue(new Set()),
  })
}

export function mockUseLoadRequiredFieldsForViewsAndCurrentView() {
  asMockHook(useLoadRequiredFieldsForViewsAndCurrentView).mockReturnValue([])
}
