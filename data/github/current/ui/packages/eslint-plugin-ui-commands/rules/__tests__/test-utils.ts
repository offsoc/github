import type {RuleTester} from 'eslint'

function commandJson(defaultBinding: string, {name, description}: {name?: string; description?: string} = {}) {
  return JSON.stringify({
    serviceName: 'Test',
    serviceId: 'test',
    commands: {
      'test-command': {
        name: name || 'Test command',
        description: description || 'Test command description',
        defaultBinding,
      },
    },
  })
}

export const filename = 'ui/packages/test/commands.json'

// Important to use the TypeScript parser as the builtin ESTree parser cannot parse JSON
// Yeah it's weird that this is `require` since we're in a module, but it only works this way so let's just accept it (:
export const parser = require.resolve('@typescript-eslint/parser')

interface ValidTestCaseOptions {
  /** Hotkey string to test. */
  keybinding: string
  /** Configured name of hotkey string */
  commandName?: string
  /** Configured description of hotkey string */
  commandDescription?: string
  filenameOverride?: string
}
export function validTestCase(
  name: string,
  {keybinding, commandName, commandDescription}: ValidTestCaseOptions,
): RuleTester.ValidTestCase {
  return {
    name,
    code: commandJson(keybinding, {name: commandName, description: commandDescription}),
    filename,
    parser,
  }
}

interface InvalidTestCaseOptions extends ValidTestCaseOptions {
  errors: Array<string | RegExp>
  /** Expected autofix result. `null` if no autofixes available. */
  fixOutput: string | null
}

export function invalidTestCase(
  name: string,
  {keybinding, commandName, commandDescription, errors, fixOutput, filenameOverride}: InvalidTestCaseOptions,
): RuleTester.InvalidTestCase {
  return {
    name,
    code: commandJson(keybinding, {name: commandName, description: commandDescription}),
    filename: filenameOverride || filename,
    parser,
    errors: errors.map(message => ({message})),
    output: fixOutput ? commandJson(fixOutput) : null,
  }
}
