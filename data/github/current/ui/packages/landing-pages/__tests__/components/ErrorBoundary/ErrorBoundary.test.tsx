import {render} from '@testing-library/react'
import {z} from 'zod'
import {ErrorBoundary} from '../../../components/ErrorBoundary/ErrorBoundary'

const ThrowingComponent = (props: {errorOp: () => unknown}) => {
  props.errorOp()

  return null
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    /**
     * We have to disable console.error since it will be used
     * multiple times for uncaught errors, and it is forbidden.
     */
    jest.spyOn(console, 'error').mockImplementation()

    /**
     * This makes the test a little coupled to the implementation,
     * but it's the simplest way we could find to test the redirect.
     */
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        assign: jest.fn(),
      },
    })
  })

  it("redirects to /500 if there's a zod error", async () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent errorOp={() => z.number().parse('not a number')} />
      </ErrorBoundary>,
    )

    expect(window.location.assign).toHaveBeenCalledWith('/500')
  })

  it('does not redirect if it is not a zod error', async () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent errorOp={() => new Error('Not a zod error')} />
      </ErrorBoundary>,
    )

    expect(window.location.assign).not.toHaveBeenCalled()
  })
})
