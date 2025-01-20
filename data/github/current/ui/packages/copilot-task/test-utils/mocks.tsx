/**
 * Monaco doesn't play well in the test environment, so we mock it out.
 *
 * This file should be THE VERY FIRST IMPORT in a test file or else it you're gonna have a bad time.
 */

// eslint-disable-next-line filenames/match-regex
jest.mock('monaco-editor', () => ({}), {virtual: true})
jest.mock('@monaco-editor/react', () => ({
  Editor: () => <div>I&apos;M MONACO!</div>,
  loader: {
    config: jest.fn(),
  },
  useMonaco: jest.fn(() => ({
    monaco: {
      editor: {
        create: jest.fn(),
      },
    },
  })),
}))

// we get weird @swc/plugin-relay errors from highlight.js
jest.mock('highlight.js', () => ({}))
