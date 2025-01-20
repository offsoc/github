import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {DiffStats} from '../DiffStats'

describe('DiffStats', () => {
  test('renders the correct diff squares', () => {
    render(<DiffStats linesAdded={42} linesDeleted={50} linesChanged={99} />)

    expect(screen.queryAllByTestId('addition diffstat')).toHaveLength(2)
    expect(screen.queryAllByTestId('deletion diffstat')).toHaveLength(2)
    expect(screen.queryAllByTestId('neutral diffstat')).toHaveLength(1)
  })

  test('does not render if stats are not supplied', () => {
    render(<DiffStats linesAdded={undefined} linesDeleted={undefined} linesChanged={undefined} />)

    expect(screen.queryAllByTestId('addition diffstat')).toHaveLength(0)
    expect(screen.queryAllByTestId('deletion diffstat')).toHaveLength(0)
    expect(screen.queryAllByTestId('neutral diffstat')).toHaveLength(0)
  })
})
