import type {Draft, JsonError} from 'json-schema-library'
import {Draft07} from 'json-schema-library'

import invalidJSON from '../__fixtures__/commands.invalid.json'
import validJSON from '../__fixtures__/commands.valid.json'
import uiCommandsJsonSchema from '../commands.schema.json'

describe('UI Commands', () => {
  it('should mark valid JSON as valid', () => {
    const jsonSchema: Draft = new Draft07(uiCommandsJsonSchema)
    const errors: JsonError[] = jsonSchema.validate(validJSON)
    expect(errors).toHaveLength(0)
  })

  it('should mark invalid JSON as invalid', () => {
    const jsonSchema: Draft = new Draft07(uiCommandsJsonSchema)
    const errors: JsonError[] = jsonSchema.validate(invalidJSON)
    expect(errors).toHaveLength(3)
    expect(errors).toEqual([
      expect.objectContaining({
        message: 'Additional property `foo` in `#` is not allowed',
        name: 'NoAdditionalPropertiesError',
      }),
      expect.objectContaining({
        message: 'The required property `name` is missing at `#/commands/arrow`',
        name: 'RequiredPropertyError',
      }),
      expect.objectContaining({
        message: 'The required property `description` is missing at `#/commands/arrow`',
        name: 'RequiredPropertyError',
      }),
    ])
  })
})
