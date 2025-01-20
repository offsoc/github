/**
 * Without mocking this call, we won't get a consistent environment for our Meta keys
 */
jest.mock('@github-ui/get-os', () => ({
  ...jest.requireActual('@github-ui/get-os'),
  isMacOS: () => true,
}))

export {}
