import {useRef} from 'react'
import {render} from '../test-utils/Render'
import {ErrorBoundary, type ErrorBoundaryProps} from '../ErrorBoundary'
import {screen} from '@testing-library/react'

function ErrorsOnSecondRender() {
  const renderCountRef = useRef(0)
  renderCountRef.current++

  if (renderCountRef.current >= 2) throw new Error('Test error')

  return <span>No error</span>
}

function TestErrorBoundary(props: Omit<ErrorBoundaryProps, 'children'>) {
  return (
    <ErrorBoundary {...props}>
      <ErrorsOnSecondRender />
    </ErrorBoundary>
  )
}

// eslint-disable-next-line @typescript-eslint/ban-types
function expectConsoleError(fn: Function) {
  const consoleError = jest.fn()
  const spy = jest.spyOn(console, 'error').mockImplementation(consoleError)
  fn()
  expect(consoleError).toHaveBeenCalled()
  spy.mockRestore()
}

describe('ErrorBoundary', () => {
  it('renders `children` when no error', () => {
    render(<TestErrorBoundary />)

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  describe('error fallback', () => {
    it('renders default fallback when `fallback` is `undefined`', () => {
      const {rerender} = render(<TestErrorBoundary />)

      expectConsoleError(() => rerender(<TestErrorBoundary />))

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('renders empty fallback when `fallback` is `null`', () => {
      const {rerender} = render(<TestErrorBoundary fallback={null} />)

      expectConsoleError(() => rerender(<TestErrorBoundary fallback={null} />))

      expect(screen.queryByText('Error')).not.toBeInTheDocument()
    })

    it('renders provided fallback when `fallback` is provided', () => {
      const {rerender} = render(<TestErrorBoundary fallback="Oh no!" />)

      expectConsoleError(() => rerender(<TestErrorBoundary fallback="Oh no!" />))

      expect(screen.getByText('Oh no!')).toBeInTheDocument()
    })
  })

  it('calls `onError` when an error is caught', () => {
    const onError = jest.fn()

    const {rerender} = render(<TestErrorBoundary onError={onError} />)

    expectConsoleError(() => rerender(<TestErrorBoundary onError={onError} />))

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({message: 'Test error'}))
  })
})
