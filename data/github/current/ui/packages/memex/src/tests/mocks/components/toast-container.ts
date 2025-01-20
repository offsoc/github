import type {ToastContextInterface} from '../../../client/components/toasts/toast-container'

export function createMockToastContainer(): ToastContextInterface {
  return {
    addToast: jest.fn(),
    removeToast: jest.fn(),
  }
}
