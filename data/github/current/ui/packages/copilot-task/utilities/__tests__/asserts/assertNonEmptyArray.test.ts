import {assertNonEmptyArray} from '../../asserts'

describe('assertNonEmptyArray', () => {
  it('should not throw if `array` is non-empty #1', async () => {
    const array = [1]
    expect(() => {
      assertNonEmptyArray(array, 'Array must not be empty.')
    }).not.toThrow()
  })

  it('should not throw if `array` is non-empty #2', async () => {
    const array = [1, 2, 3]
    expect(() => {
      assertNonEmptyArray(array, 'Array must not be empty.')
    }).not.toThrow()
  })

  it('should throw if `array` is empty', async () => {
    const array: number[] = []
    expect(() => {
      assertNonEmptyArray(array, 'Array must not be empty.')
    }).toThrow('Array must not be empty.')
  })

  it('should throw provided error instance', async () => {
    class TestError extends Error {}

    const errorMessage = 'Oops something hapenned'
    const error = new TestError(errorMessage)

    let thrownError
    try {
      assertNonEmptyArray([], error)
    } catch (e) {
      thrownError = e
    }

    expect(thrownError instanceof TestError).toEqual(true)
    const testError = thrownError as TestError
    expect(testError.message).toEqual(errorMessage)
    expect(testError.message).toEqual(error.message)
  })
})
