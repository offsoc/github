import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import AheadBehindCount, {scaleAheadBehind} from '../components/AheadBehindCount'

jest.mock('@github-ui/react-core/use-feature-flag')

test('renders AheadBehindCount', () => {
  render(<AheadBehindCount aheadCount={2} behindCount={3} />)

  expect(screen.getByRole('img')).toBeVisible()
  expect(screen.getByRole('tooltip')).toHaveAttribute('aria-label', 'Ahead behind count: 5')
})

test('AheadBehindCount bar scale is relative to max diverged', () => {
  const maxDiverged = 100
  const aheadA = 4
  const {rerender} = render(<AheadBehindCount aheadCount={aheadA} behindCount={0} maxDiverged={maxDiverged} />)
  const percentA = scaleAheadBehind(aheadA, maxDiverged)
  expect(percentA).not.toEqual(100)
  expect(screen.getByTestId(`ahead-behind-${percentA}`)).toBeVisible()
  expect(screen.getByRole('tooltip')).toHaveAttribute('aria-label', `Ahead behind count: ${aheadA}`)

  const aheadB = 8
  rerender(<AheadBehindCount aheadCount={aheadB} behindCount={0} maxDiverged={maxDiverged} />)
  const percentB = scaleAheadBehind(aheadB, maxDiverged)
  expect(screen.getByTestId(`ahead-behind-${percentB}`)).toBeVisible()
  expect(screen.getByRole('tooltip')).toHaveAttribute('aria-label', `Ahead behind count: ${aheadB}`)

  expect(percentA).not.toEqual(percentB)
})
