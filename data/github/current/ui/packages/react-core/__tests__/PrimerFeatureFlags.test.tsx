import {FeatureFlags} from '@primer/react/experimental'
import {render, screen} from '@testing-library/react'
import {PrimerFeatureFlags} from '../PrimerFeatureFlags'
import {mockClientEnv} from '@github-ui/client-env/mock'

// Note: there is not currently an exported member from @primer/react that allows us to test if a flag has been passed
// along through the FeatureFlags context provider. As a result, we mock the component and assert on the flags that are
// being passed along in order to test the logic of PrimerFeatureFlags
jest.mock('@primer/react/experimental', () => {
  const implementation = jest.requireActual('@primer/react/experimental')
  return {
    ...implementation,
    FeatureFlags: jest.fn().mockImplementation(implementation.FeatureFlags),
  }
})

test('renders children', () => {
  render(
    <PrimerFeatureFlags>
      <span>test child</span>
    </PrimerFeatureFlags>,
  )
  expect(screen.getByText('test child')).toBeInTheDocument()
})

test('forwards primer_react_* flags to FeatureFlags in @primer/react', () => {
  mockClientEnv({
    featureFlags: ['primer_react_test'],
  })

  render(
    <PrimerFeatureFlags>
      <span>test child</span>
    </PrimerFeatureFlags>,
  )

  expect(FeatureFlags).toHaveBeenLastCalledWith(
    expect.objectContaining({
      flags: {
        primer_react_test: true,
      },
    }),
    {},
  )
})

test('does not forward non-primer_react_* flags to FeatureFlags in @primer/react', () => {
  mockClientEnv({
    featureFlags: ['example_github_ui_flag'],
  })

  render(
    <PrimerFeatureFlags>
      <span>test child</span>
    </PrimerFeatureFlags>,
  )

  expect(FeatureFlags).toHaveBeenLastCalledWith(
    expect.objectContaining({
      flags: {},
    }),
    {},
  )
})
