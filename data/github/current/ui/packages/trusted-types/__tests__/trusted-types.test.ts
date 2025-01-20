import {tinyfillForTesting, ghTrustedTypes, registeredPoliciesForTesting} from '../trusted-types'

describe('trusted types', function () {
  afterEach(() => {
    registeredPoliciesForTesting.clear()
  })

  it('fallbacks raise errors in tinyfill', function () {
    const policy = tinyfillForTesting.createPolicy('test', {})

    expect(() => policy.createHTML('foo')).toThrow(TypeError)
    expect(() => policy.createScript('foo')).toThrow(TypeError)
    expect(() => policy.createScriptURL('foo')).toThrow(TypeError)
  })

  it('fallbacks raise errors in ghTrustedTypes', function () {
    const policy = ghTrustedTypes.createPolicy('test', {})

    expect(() => policy.createHTML('foo')).toThrow(TypeError)
    expect(() => policy.createScript('foo')).toThrow(TypeError)
    expect(() => policy.createScriptURL('foo')).toThrow(TypeError)
  })

  it('stores created policies in a registry so they do not get redefined', function () {
    ghTrustedTypes.createPolicy('test', {})
    expect(registeredPoliciesForTesting.has('test')).toEqual(true)
  })

  it('can create and use a policy', () => {
    const policy = tinyfillForTesting.createPolicy('policy1', {
      createHTML: () => 'world',
    })
    expect(policy.createHTML('hello')).toEqual('world')
  })

  it('an exception thrown by a policy will bubble up to the context that called createHTML()', () => {
    const policy = tinyfillForTesting.createPolicy('policy1', {
      createHTML: () => {
        throw new Error('Angry!')
      },
    })
    expect(() => policy.createHTML('this should throw an error')).toThrow('Angry!')
  })

  it('prevents overwriting a policy', () => {
    const policy = ghTrustedTypes.createPolicy('policy1', {
      createHTML: () => 'world',
    })
    expect(policy.createHTML('hello')).toEqual('world')
    expect(Object.isFrozen(policy)).toEqual(true)
    expect(() => (policy.createHTML = () => 'p0wned')).toThrow(
      "Cannot assign to read only property 'createHTML' of object",
    )
  })
})
