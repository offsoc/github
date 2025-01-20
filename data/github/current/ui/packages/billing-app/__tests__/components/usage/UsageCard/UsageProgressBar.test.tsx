import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import UsageProgressBar from '../../../../components/usage/UsageCard/UsageProgressBar'

describe('UsageProgressBar', () => {
  test('shows green segment when one item is present and hides all others', async () => {
    render(<UsageProgressBar usage={Array(1).fill(100)} totalUsage={100} />)
    expect(screen.getByTestId('green-usage-bar')).toBeInTheDocument()
    expect(screen.queryByTestId('blue-usage-bar')).toBeNull()
    expect(screen.queryByTestId('purple-usage-bar')).toBeNull()
    expect(screen.queryByTestId('red-usage-bar')).toBeNull()
    expect(screen.queryByTestId('brown-usage-bar')).toBeNull()
    expect(screen.queryByTestId('other-usage-bar')).toBeNull()
  })

  test('shows green and blue segments when two items are present and hides all others', async () => {
    render(<UsageProgressBar usage={Array(2).fill(100)} totalUsage={100} />)
    expect(screen.getByTestId('green-usage-bar')).toBeInTheDocument()
    expect(screen.getByTestId('blue-usage-bar')).toBeInTheDocument()
    expect(screen.queryByTestId('purple-usage-bar')).toBeNull()
    expect(screen.queryByTestId('red-usage-bar')).toBeNull()
    expect(screen.queryByTestId('brown-usage-bar')).toBeNull()
    expect(screen.queryByTestId('other-usage-bar')).toBeNull()
  })

  test('shows green, blue and purple segments when three items are present and hides all others', async () => {
    render(<UsageProgressBar usage={Array(3).fill(100)} totalUsage={100} />)
    expect(screen.getByTestId('green-usage-bar')).toBeInTheDocument()
    expect(screen.getByTestId('blue-usage-bar')).toBeInTheDocument()
    expect(screen.getByTestId('purple-usage-bar')).toBeInTheDocument()
    expect(screen.queryByTestId('red-usage-bar')).toBeNull()
    expect(screen.queryByTestId('brown-usage-bar')).toBeNull()
    expect(screen.queryByTestId('other-usage-bar')).toBeNull()
  })

  test('shows green, blue, purple and red segments when four items are present and hides all others', async () => {
    render(<UsageProgressBar usage={Array(4).fill(100)} totalUsage={100} />)
    expect(screen.getByTestId('green-usage-bar')).toBeInTheDocument()
    expect(screen.getByTestId('blue-usage-bar')).toBeInTheDocument()
    expect(screen.getByTestId('purple-usage-bar')).toBeInTheDocument()
    expect(screen.getByTestId('red-usage-bar')).toBeInTheDocument()
    expect(screen.queryByTestId('brown-usage-bar')).toBeNull()
    expect(screen.queryByTestId('other-usage-bar')).toBeNull()
  })

  test('shows green, blue, purple, red and brown segments when five items are present and hides all others', async () => {
    render(<UsageProgressBar usage={Array(5).fill(100)} totalUsage={100} />)
    expect(screen.getByTestId('green-usage-bar')).toBeInTheDocument()
    expect(screen.getByTestId('blue-usage-bar')).toBeInTheDocument()
    expect(screen.getByTestId('purple-usage-bar')).toBeInTheDocument()
    expect(screen.getByTestId('red-usage-bar')).toBeInTheDocument()
    expect(screen.getByTestId('brown-usage-bar')).toBeInTheDocument()
    expect(screen.queryByTestId('other-usage-bar')).toBeNull()
  })

  test('does not show other segment when we do not have allOtherUsage set', async () => {
    render(<UsageProgressBar usage={Array(6).fill(100)} totalUsage={100} />)
    expect(screen.queryByTestId('other-usage-bar')).toBeNull()
  })

  test('shows other segment when we have allOtherUsage set', async () => {
    render(<UsageProgressBar usage={Array(6).fill(100)} totalUsage={100} allOtherUsage={100} />)
    expect(screen.getByTestId('other-usage-bar')).toBeInTheDocument()
  })
})
