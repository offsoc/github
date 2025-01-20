import {assert} from '../../asserts'

describe('assert', () => {
  it('should not throw if `condition` is `true`', async () => {
    const errorMessage = 'Oops something happened.'
    expect(() => {
      assert(true, errorMessage)
    }).not.toThrow()
  })

  it('should throw if `condition` is `false`', async () => {
    const errorMessage = 'Oops something happened.'
    expect(() => {
      assert(false, errorMessage)
    }).toThrow(errorMessage)
  })

  it('should throw provided error instance', async () => {
    class TestError extends Error {}

    const errorMessage = 'Oops something hapenned'
    const error = new TestError(errorMessage)

    let thrownError
    try {
      assert(false, error)
    } catch (e) {
      thrownError = e
    }

    expect(thrownError instanceof TestError).toEqual(true)
    const testError = thrownError as TestError
    expect(testError.message).toEqual(errorMessage)
    expect(testError.message).toEqual(error.message)
  })
})
