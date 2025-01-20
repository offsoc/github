import {shallowEqual} from '../../client/helpers/util'
import {formEncodeObject} from '../../client/platform/utils'
import {formDecodeToObject} from '../../mocks/server/form-decode-to-object'

describe('Rack Query Param Tests', () => {
  /**
   * https://github.com/rack/rack/blob/master/test/spec_utils.rb
   *
   * test cases from rack/test/spec_utils.rb to ensure we don't deviate from the param encoding in the server
   */
  it.each`
    object                                                                                                               | query
    ${{foo: undefined, bar: ''}}                                                                                         | ${'bar='}
    ${{foo: 'bar', baz: ''}}                                                                                             | ${'foo=bar&baz='}
    ${{foo: ['1', '2']}}                                                                                                 | ${'foo[]=1&foo[]=2'}
    ${{foo: 'bar', baz: ['1', '2', '3']}}                                                                                | ${'foo=bar&baz[]=1&baz[]=2&baz[]=3'}
    ${{foo: ['bar'], baz: ['1', '2', '3']}}                                                                              | ${'foo[]=bar&baz[]=1&baz[]=2&baz[]=3'}
    ${{x: {y: {z: '1'}}}}                                                                                                | ${'x[y][z]=1'}
    ${{x: {y: {z: ['1']}}}}                                                                                              | ${'x[y][z][]=1'}
    ${{x: {y: {z: ['1', '2']}}}}                                                                                         | ${'x[y][z][]=1&x[y][z][]=2'}
    ${{x: {y: [{z: '1'}]}}}                                                                                              | ${'x[y][][z]=1'}
    ${{x: {y: [{z: ['1']}]}}}                                                                                            | ${'x[y][][z][]=1'}
    ${{x: {y: [{z: '1', w: '2'}]}}}                                                                                      | ${'x[y][][z]=1&x[y][][w]=2'}
    ${{x: {y: [{v: {w: '1'}}]}}}                                                                                         | ${'x[y][][v][w]=1'}
    ${{x: {y: [{z: '1', v: {w: '2'}}]}}}                                                                                 | ${'x[y][][z]=1&x[y][][v][w]=2'}
    ${{x: {y: [{z: '1'}, {z: '2'}]}}}                                                                                    | ${'x[y][][z]=1&x[y][][z]=2'}
    ${{x: {y: [{z: '1', w: 'a'}, {z: '2', w: '3'}]}}}                                                                    | ${'x[y][][z]=1&x[y][][w]=a&x[y][][z]=2&x[y][][w]=3'}
    ${{x: [{id: '1', y: {a: '5', b: '7'}, z: {id: '3', w: '0'}}, {id: '2', y: {a: '6', b: '8'}, z: {id: '4', w: '0'}}]}} | ${'x[][id]=1&x[][y][a]=5&x[][y][b]=7&x[][z][id]=3&x[][z][w]=0&x[][id]=2&x[][y][a]=6&x[][y][b]=8&x[][z][id]=4&x[][z][w]=0'}
  `("should encode and decode the sample $query from Rack's tests", ({object, query}) => {
    const encoded = formEncodeObject(object)
    expect(encoded).toBe(query)

    expect(formDecodeToObject(encoded)).toEqual(object)
  })
})

/**
 * These tests exhibit behaviors of the query parser and encoder in our app
 *
 * the instances of 'parsedObject' are required to handle the fact that rack encodes
 * this object in a way that it can't be decoded to the original object (and in rack wouldn't be)
 */
describe('formEncodeObject', () => {
  it.each`
    object                                   | query                               | parsedObject
    ${{}}                                    | ${''}                               | ${undefined}
    ${{a: 'b'}}                              | ${'a=b'}                            | ${undefined}
    ${{a: 'b c'}}                            | ${'a=b%20c'}                        | ${undefined}
    ${{a: 'b', c: 'd'}}                      | ${'a=b&c=d'}                        | ${undefined}
    ${{a: 'b', c: undefined}}                | ${'a=b'}                            | ${undefined}
    ${{a: {b: 'c'}}}                         | ${'a[b]=c'}                         | ${undefined}
    ${{a: ['b', 'c']}}                       | ${'a[]=b&a[]=c'}                    | ${undefined}
    ${{a: []}}                               | ${'a[]'}                            | ${undefined}
    ${{a: [{b: 'c'}, {d: 'e'}]}}             | ${'a[][b]=c&a[][d]=e'}              | ${{a: [{b: 'c', d: 'e'}]}}
    ${{a: [[{b: 'c'}, {d: 'e'}]]}}           | ${'a[][][b]=c&a[][][d]=e'}          | ${{a: [[{b: 'c', d: 'e'}]]}}
    ${{memexProject: {title: 'MemexTitle'}}} | ${'memexProject[title]=MemexTitle'} | ${undefined}
    ${{
  memexProject: {
    memexProjectItems: [{contentType: 'DraftIssue', content: {title: 'MyTitle'}}],
  },
}} | ${'memexProject[memexProjectItems][][contentType]=DraftIssue&memexProject[memexProjectItems][][content][title]=MyTitle'} | ${undefined}
    ${{value: 'true'}}                       | ${'value=true'}                     | ${undefined}
    ${{value: '1'}}                          | ${'value=1'}                        | ${undefined}
    ${{value: 1}}                            | ${'value=1'}                        | ${{value: '1'}}
  `('should encode and decode the query $query properly', ({object, query, parsedObject}) => {
    const encoded = formEncodeObject(object)
    expect(encoded).toBe(query)
    expect(formDecodeToObject(encoded)).toEqual(parsedObject ?? object)
  })
})

describe('shallowEqual', () => {
  it('key length', () => {
    const a = {a: 1, b: 2}
    const b = {a: 1, b: 2, c: 3}
    expect(shallowEqual(a, b)).toBe(false)
  })

  it('value comparison', () => {
    const a = {a: 1, b: 2}
    const b = {a: 1, b: 2}
    expect(shallowEqual(a, b)).toBe(true)
    b.b = 4
    expect(shallowEqual(a, b)).toBe(false)
  })
})
