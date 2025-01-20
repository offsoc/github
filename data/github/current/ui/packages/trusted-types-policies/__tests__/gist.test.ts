import {temporaryPermissiveGistPolicy} from '../gist'

describe('temporaryPermissiveGistPolicy', () => {
  it('acts as a noop', async () => {
    const trustedHTML = temporaryPermissiveGistPolicy.createHTML('<div>Hello world</div>')
    expect(trustedHTML).toEqual('<div>Hello world</div>')
  })
})
