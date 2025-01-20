import {render, screen} from '@testing-library/react'
import {FeatureFlagProvider} from '../FeatureFlagProvider'
import {useFeatureFlag, useFeatureFlags} from '../use-feature-flag'

test('renders children', () => {
  render(
    <FeatureFlagProvider
      features={{
        feature1: true,
      }}
    >
      <span>I am a child</span>
    </FeatureFlagProvider>,
  )

  expect(screen.getByText('I am a child')).toBeInTheDocument()
})

test('useFeatureFlag can get context', () => {
  const TestComponent = () => {
    const ff = useFeatureFlag('feature1')

    return <span>{ff.toString()}</span>
  }

  render(
    <FeatureFlagProvider features={{feature1: true}}>
      <TestComponent />
    </FeatureFlagProvider>,
  )

  expect(screen.queryByText('false')).not.toBeInTheDocument()
  expect(screen.getByText('true')).toBeInTheDocument()
})

test('useFeatureFlags can get context', () => {
  const TestComponent = () => {
    const ffs = useFeatureFlags()

    return (
      <div>
        {Object.entries(ffs).map(ff => (
          <div key={ff[0]}>{`${ff[0]}: ${ff[1]}`}</div>
        ))}
      </div>
    )
  }

  render(
    <FeatureFlagProvider features={{feature1: true, feature2: true}}>
      <TestComponent />
    </FeatureFlagProvider>,
  )

  expect(screen.queryByText('feature1: false')).not.toBeInTheDocument()
  expect(screen.queryByText('feature2: false')).not.toBeInTheDocument()
  expect(screen.getByText('feature1: true')).toBeInTheDocument()
  expect(screen.getByText('feature2: true')).toBeInTheDocument()
})
