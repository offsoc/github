import type {MockServer} from '../../mocks/server/mock-server'

declare global {
  interface Window {
    __memexInMemoryServer: MockServer
  }
}

export {}
