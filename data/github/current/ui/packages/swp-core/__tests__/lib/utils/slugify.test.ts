import {slugify} from '../../../lib/utils/slugify'

describe('slugify', () => {
  it('creates a slug from the heading', () => {
    expect(slugify('Hello World!')).toEqual('hello-world')
  })
})
