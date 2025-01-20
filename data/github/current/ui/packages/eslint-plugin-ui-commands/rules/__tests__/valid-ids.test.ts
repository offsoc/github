import rule from '../valid-ids'
import {RuleTester} from 'eslint'
import {parser, filename} from './test-utils'

function commandIdJson(commandId: string) {
  return JSON.stringify({
    serviceName: 'Test',
    serviceId: 'test',
    commands: {
      [commandId]: {
        name: 'Test command',
        description: 'Test command',
      },
    },
  })
}

function serviceIdJson(serviceId: string) {
  return JSON.stringify({
    serviceName: 'Test',
    serviceId,
    commands: {
      'test-id': {
        name: 'Test command',
        description: 'Test command',
      },
    },
  })
}

const invalidErrorMessage =
  'Invalid ID: Command and service IDs must consist only of alphanumeric characters and hyphens.'

new RuleTester().run('valid-ids', rule, {
  valid: [
    {name: 'Does not report valid service ID', code: serviceIdJson('test-service'), parser, filename},
    {name: 'Does not report valid command ID', code: commandIdJson('test-command'), parser, filename},
  ],
  invalid: [
    {
      name: 'Reports empty service ID',
      code: serviceIdJson(''),
      errors: ['ID cannot be empty.'],
      output: null,
      parser,
      filename,
    },
    {
      name: 'Reports empty command ID',
      code: commandIdJson(''),
      errors: ['ID cannot be empty.'],
      output: null,
      parser,
      filename,
    },
    {
      name: 'Reports invalid service ID',
      code: serviceIdJson('not alphanumeric!'),
      errors: [invalidErrorMessage],
      output: null,
      parser,
      filename,
    },
    {
      name: 'Reports invalid command ID',
      code: commandIdJson('#notAlphanumeric'),
      errors: [invalidErrorMessage],
      output: null,
      parser,
      filename,
    },
    {
      name: 'Autofixes PascalCase ID',
      code: commandIdJson('TestId'),
      errors: [invalidErrorMessage],
      output: commandIdJson('test-id'),
      parser,
      filename,
    },
    {
      name: 'Autofixes camelCase ID',
      code: commandIdJson('testId'),
      errors: [invalidErrorMessage],
      output: commandIdJson('test-id'),
      parser,
      filename,
    },
    {
      name: 'Autofixes snake_case ID',
      code: commandIdJson('test_id'),
      errors: [invalidErrorMessage],
      output: commandIdJson('test-id'),
      parser,
      filename,
    },
  ],
})
