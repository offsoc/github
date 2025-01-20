import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ReposSelector, simpleRepoLoader} from '../ReposSelector'

test('Renders the ReposSelector', () => {
  const repos: Array<{name: string}> = [{name: 'github/github'}]

  render(
    <ReposSelector
      currentSelection={undefined}
      repositoryLoader={simpleRepoLoader(repos)}
      selectAllOption={true}
      selectionVariant="single"
      onSelect={() => null}
    />,
  )
  expect(screen.getByRole('button')).toHaveTextContent('All repositories')
})
