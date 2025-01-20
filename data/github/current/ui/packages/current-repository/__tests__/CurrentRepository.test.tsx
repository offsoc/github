import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CurrentRepositoryProvider, useCurrentRepository} from '../CurrentRepository'
import {createRepository} from '../test-helper'

const TestingComponent = () => {
  const repo = useCurrentRepository()
  return <div data-testid="current-repo">{JSON.stringify(repo)}</div>
}

describe('<CurrentRepositoryProvider />', () => {
  test('provides expected useCurrentRepository value to child elements', () => {
    const expectedCurrentRepo = createRepository()

    render(
      <CurrentRepositoryProvider repository={expectedCurrentRepo}>
        <TestingComponent />
      </CurrentRepositoryProvider>,
    )

    const repoElement = screen.getByTestId('current-repo')
    const actualCurrentRepo = JSON.parse(repoElement.textContent || '')

    expect(expectedCurrentRepo).toEqual(actualCurrentRepo)
  })
})
