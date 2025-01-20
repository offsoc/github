import reactDisplayName from '../react-display-name'

describe('React Display Name Webpack Plugin', () => {
  it('should set the display name for a React component', () => {
    const source = `
      const SOME_CONSTANT = 'foo'
      const SomeComponent = () => null
      function OtherComponent() {
        return null
      }
      function someLowerCaseFunction() {}
    `

    const result = reactDisplayName(source)

    expect(result).toEqual(`${source}
try{ SomeComponent.displayName ||= 'SomeComponent' } catch {}
try{ OtherComponent.displayName ||= 'OtherComponent' } catch {}`)
  })

  it('should set not re-set the display name for a React component that already has one', () => {
    const source = `
      function ComponentWithAName() {
        return null
      }

      ComponentWithAName.displayName = 'SomeSpecificName'
    `

    const result = reactDisplayName(source)

    expect(result).toEqual(source)
  })
})
