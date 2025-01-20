import {temporaryPermissiveDefaultPolicy} from '../default'

describe('temporaryPermissiveDefaultPolicy', () => {
  it('acts as a noop of CreateHTML', async () => {
    const trustedHTML = temporaryPermissiveDefaultPolicy.createHTML('<img src=x onerror=alert(1)//>')
    expect(trustedHTML).toEqual('<img src=x onerror=alert(1)//>')
  })

  it('acts as a noop of CreateScript', async () => {
    const trustedScript = temporaryPermissiveDefaultPolicy.createScript("eval('2 + 2')")
    expect(trustedScript).toEqual("eval('2 + 2')")
  })

  it('acts as a noop of CreateScriptURL', async () => {
    const trustedScript = temporaryPermissiveDefaultPolicy.createScript('https://example.com/my-script.js')
    expect(trustedScript).toEqual('https://example.com/my-script.js')
  })
})
