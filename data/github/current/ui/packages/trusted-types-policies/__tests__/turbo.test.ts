import {turboPolicy} from '../turbo'

describe('turboPolicy', () => {
  it('checks that the nonce is correct', async () => {
    const trustedHTML = turboPolicy.createHTML('<div>Hello world</div>', {} as Response)
    expect(trustedHTML).toEqual('<div>Hello world</div>')
  })

  it('converts script URLs to trustedScriptURL', () => {
    const trustedScriptURL = turboPolicy.createScriptURL('https://github.com/dashboard')
    expect(trustedScriptURL).toEqual('https://github.com/dashboard')
  })

  it('converts scripts to trustedScripts', () => {
    const trustedScript = turboPolicy.createScript('console.log("Hello world")')
    expect(trustedScript).toEqual('console.log("Hello world")')
  })
})
