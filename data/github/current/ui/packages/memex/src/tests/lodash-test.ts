import add from 'lodash-es/add'

// this test is a placeholder to ensure we can use lodash-es indirectly in
// packages without needing replace everything with the ES module loader
describe('lodash interop', () => {
  it('can load regular module', () => {
    expect(add(2, 3)).toEqual(5)
  })
})
