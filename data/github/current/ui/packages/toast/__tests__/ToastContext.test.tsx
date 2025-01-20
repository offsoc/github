import {useEffect, type ReactNode} from 'react'
import {render} from '@github-ui/react-core/test-utils'
import {useSafeTimeout} from '@primer/react'
import {act, screen} from '@testing-library/react'
import {ToastContextProvider, useToastContext} from '../ToastContext'
import {Toasts} from '../Toasts'

jest.useFakeTimers()

function TestComponent({children}: {children: ReactNode}) {
  return (
    <ToastContextProvider>
      {children}
      <Toasts />
    </ToastContextProvider>
  )
}

function CallerComponent() {
  const {addToast} = useToastContext()
  useEffect(() => {
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addToast({
      message: 'Hello, World!',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <>CallerComponent</>
}

function CallerComponentWithPersisted() {
  const {addPersistedToast} = useToastContext()
  useEffect(() => {
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addPersistedToast({
      message: 'my persisted toast',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <>CallerComponent</>
}

function CallerComponentWithPersistedHides() {
  const {addPersistedToast, clearPersistedToast} = useToastContext()
  const {safeSetTimeout} = useSafeTimeout()
  useEffect(() => {
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addPersistedToast({
      message: 'my persisted toast',
    })
    safeSetTimeout(() => clearPersistedToast(), 300)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>CallerComponent</>
}

describe('Toast context tests', () => {
  test('add toast and hides the toast after the ttl has passed', async () => {
    render(
      <TestComponent>
        <CallerComponent />
      </TestComponent>,
    )
    await screen.findByText('Hello, World!')

    // default time is 5000ms
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(screen.queryByText('Hello, World!')).not.toBeInTheDocument()
  })

  test('adding persisted toast does not hide the toast after the ttl has passed', async () => {
    render(
      <TestComponent>
        <CallerComponentWithPersisted />
      </TestComponent>,
    )
    await screen.findByText('my persisted toast')

    // default time is 5000ms
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    await expect(screen.findByText('my persisted toast')).resolves.toBeInTheDocument()
  })

  test('clearing persisted toast hides the toast', async () => {
    render(
      <TestComponent>
        <CallerComponentWithPersistedHides />
      </TestComponent>,
    )
    await screen.findByText('my persisted toast')

    // default time is 5000ms
    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(screen.queryByText('my persisted toast')).not.toBeInTheDocument()
  })
})
