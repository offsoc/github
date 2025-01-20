import {SymbolKind} from '../code-symbol'

describe('SymbolIndicator', () => {
  it('SymbolKind', () => {
    const tests = new Map()
    tests.set(['SYMBOL_KIND_FUNCTION_DEF', /*1,*/ 'function'], ['function', 'func'])
    tests.set(['SYMBOL_KIND_METHOD_DEF', /*2,*/ 'method'], ['method', 'func'])
    tests.set(['SYMBOL_KIND_MODULE_DEF', /*4,*/ 'module'], ['module', 'mod'])
    tests.set(['SYMBOL_KIND_CLASS_DEF', /*3,*/ 'class'], ['class', 'class'])
    tests.set(['SYMBOL_KIND_FIELD_DEF', /*9,*/ 'field'], ['field', 'field'])
    tests.set(['SYMBOL_KIND_ENUM_DEF', /*17,*/ 'enum'], ['enum', 'enum'])
    tests.set(['SYMBOL_KIND_INTERFACE_DEF', /*7,*/ 'interface'], ['interface', 'intf'])
    tests.set(['SYMBOL_KIND_CONSTANT_DEF', /*10,*/ 'constant'], ['constant', 'const'])
    tests.set(['SYMBOL_KIND_ENUM_MEMBER_DEF', /*26,*/ 'enum_member'], ['enum_member', 'e'])
    tests.set(['SYMBOL_KIND_STRUCT_DEF', /*27,*/ 'struct'], ['struct', 'struct'])
    tests.set(['SYMBOL_KIND_TYPE_DEF', /*6,*/ 'type'], ['type', 'type'])
    tests.set(['SYMBOL_KIND_IMPLEMENTATION_DEF', /*8,*/ 'implementation'], ['implementation', 'impl'])
    tests.set(['SYMBOL_KIND_MACRO_DEF', /*11,*/ 'macro'], ['macro', 'macro'])
    tests.set(['SYMBOL_KIND_TRAIT_DEF', /*31,*/ 'trait'], ['trait', 'trait'])
    tests.set(['SYMBOL_KIND_CALL_REF', /*100,*/ 'call'], ['call', 'call'])
    tests.set(['SYMBOL_KIND_UNKNOWN', 'unknown', '', undefined], ['unknown', 'u'])

    for (const [keys, v] of tests) {
      for (const k of keys) {
        const kind = new SymbolKind({kind: k})
        expect(kind.fullName).toEqual(v[0])
        expect(kind.shortName).toEqual(v[1])
        expect(kind.enumStringVal).toEqual(keys[0])
      }
    }
  })
})
