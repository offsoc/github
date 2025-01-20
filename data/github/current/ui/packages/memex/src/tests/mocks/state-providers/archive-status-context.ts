import {debounceAsync} from '../../../client/helpers/debounce-async'
import {
  type ArchiveStatusContextType,
  DEBOUNCE_DELAY,
} from '../../../client/state-providers/workflows/archive-status-state-provider'

export function createArchiveStatusContext(mocks?: Partial<ArchiveStatusContextType>): ArchiveStatusContextType {
  return {
    isArchiveFull: false,
    shouldDisableArchiveForActiveWorkflow: false,
    setShouldDisableArchiveForActiveWorkflow: jest.fn(),
    setArchiveStatus: debounceAsync(jest.fn(), DEBOUNCE_DELAY),
    ...mocks,
  }
}
