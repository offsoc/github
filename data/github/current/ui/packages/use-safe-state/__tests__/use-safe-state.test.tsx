import {act, cleanup, fireEvent, render, screen} from '@testing-library/react'
import {useEffect, useState} from 'react'

import useSafeState from '../use-safe-state'

describe('useSafeState()', () => {
  let states: Array<[boolean, boolean]>

  beforeEach(() => {
    jest.useFakeTimers()
    states = []
  })

  afterEach(cleanup)

  const Child = () => {
    const [loading, setLoading] = useSafeState(true)

    useEffect(() => {
      setTimeout(
        () =>
          setLoading((previous: boolean) => {
            states.push([previous, false])
            return false
          }),
        100,
      )
    }, [setLoading])

    return <div>Loading? {loading}</div>
  }

  const Parent = () => {
    const [showChild, setShowChild] = useState(true)

    return (
      <>
        <button onClick={() => setShowChild(current => !current)}>Toggle</button>
        {showChild && <Child />}
      </>
    )
  }

  it('sets state in a mounted component', () => {
    render(<Parent />)

    expect(states).toEqual([])

    act(() => {
      jest.runAllTimers()
    })

    expect(states).toEqual([[true, false]])
  })

  it('is a harmless no-op in an unmounted component', () => {
    render(<Parent />)

    expect(states).toEqual([])

    fireEvent.click(screen.getByText('Toggle'))

    expect(states).toEqual([])

    jest.runAllTimers()

    expect(states).toEqual([])
  })
})
