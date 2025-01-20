import {jsonRoute} from '@github-ui/react-core/json-route'
import {render} from '@github-ui/react-core/test-utils'
import {useNavigate} from '@github-ui/use-navigate'
import {screen} from '@testing-library/react'
import {Route, Routes} from 'react-router-dom'

import {BANNER_HIDE_DELAY_MS, FlashProvider, useActiveFlash, useSetFlash} from '../FlashContext'

beforeEach(() => jest.useRealTimers())
describe('FlashProvider', () => {
  it('can set and clear flash', async () => {
    const {user} = render(
      <FlashProvider>
        <TestDisplayFlashComponent />
        <TestSetFlashComponent />
      </FlashProvider>,
    )

    expect(screen.getByText('No flash set')).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Set'}))
    expect(screen.getByText('definition.created.success')).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Clear'}))
    expect(screen.getByText('No flash set')).toBeInTheDocument()
  })

  it('flash is removed on navigation after a delay period has elapsed', async () => {
    jest.useFakeTimers()
    window.performance.clearResourceTimings = jest.fn()
    window.performance.mark = jest.fn()

    const SetPage = () => (
      <>
        Set page
        <TestSetFlashComponent />
        <TestGoToComponent to="/another" />
      </>
    )

    const AnotherPage = () => <>Another page</>

    const {user} = render(
      <FlashProvider>
        <TestDisplayFlashComponent />
        <Routes>
          <Route path="/set" Component={SetPage} />
          <Route path="/another" Component={AnotherPage} />
        </Routes>
      </FlashProvider>,
      {
        routes: [jsonRoute({path: '/set', Component: SetPage}), jsonRoute({path: '/another', Component: AnotherPage})],
        pathname: '/set',
      },
    )

    expect(screen.getByText('Set page')).toBeInTheDocument()
    await user.click(screen.getByRole('button', {name: 'Set'}))
    expect(screen.getByText('definition.created.success')).toBeInTheDocument()

    jest.advanceTimersByTime(BANNER_HIDE_DELAY_MS + 1)
    await user.click(screen.getByRole('button', {name: 'Go to'}))

    expect(screen.getByText('Another page')).toBeInTheDocument()
    expect(screen.queryByText('definition.created.success')).not.toBeInTheDocument()
  })

  it('flash is not removed on nav unless delay has elapsed', async () => {
    jest.useFakeTimers()
    window.performance.clearResourceTimings = jest.fn()
    window.performance.mark = jest.fn()

    const SetPage = () => (
      <>
        Set page
        <TestSetFlashComponent />
        <TestGoToComponent to="/another" />
      </>
    )

    const AnotherPage = () => <>Another page</>

    const {user} = render(
      <FlashProvider>
        <TestDisplayFlashComponent />
        <Routes>
          <Route path="/set" Component={SetPage} />
          <Route path="/another" Component={AnotherPage} />
        </Routes>
      </FlashProvider>,
      {
        routes: [jsonRoute({path: '/set', Component: SetPage}), jsonRoute({path: '/another', Component: AnotherPage})],
        pathname: '/set',
      },
    )

    expect(screen.getByText('Set page')).toBeInTheDocument()
    await user.click(screen.getByRole('button', {name: 'Set'}))
    expect(screen.getByText('definition.created.success')).toBeInTheDocument()

    jest.advanceTimersByTime(BANNER_HIDE_DELAY_MS - 1)
    await user.click(screen.getByRole('button', {name: 'Go to'}))

    expect(screen.getByText('Another page')).toBeInTheDocument()
    expect(screen.getByText('definition.created.success')).toBeInTheDocument()
  })
})

function TestDisplayFlashComponent() {
  const activeFlash = useActiveFlash()

  return <p>{activeFlash || 'No flash set'}</p>
}

function TestSetFlashComponent() {
  const setFlash = useSetFlash()

  return (
    <>
      <button onClick={() => setFlash('definition.created.success')}>Set</button>
      <button onClick={() => setFlash(null)}>Clear</button>
    </>
  )
}

function TestGoToComponent({to}: {to: string}) {
  const navigate = useNavigate()
  return <button onClick={() => navigate(to)}>Go to</button>
}
