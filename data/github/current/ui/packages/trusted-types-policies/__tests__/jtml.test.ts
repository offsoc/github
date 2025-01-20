import {temporaryPermissiveJtmlPolicy} from '../jtml'

describe('temporaryPermissiveJtmlPolicy', () => {
  it('acts as a noop', async () => {
    const trustedHTML = temporaryPermissiveJtmlPolicy.createHTML('<div>Hello world</div>')
    expect(trustedHTML).toEqual('<div>Hello world</div>')
  })
})
