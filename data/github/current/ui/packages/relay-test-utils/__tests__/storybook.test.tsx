import {render, screen} from '@testing-library/react'
import {composeStory} from '@storybook/react'
import IssuesShowMeta, {RelayDecorator, RelayDecoratorWithDefaultMapFunction} from '../mocks/IssuesShow.stories'
import IssuesShowFragmentMeta, {RelayDecoratorFragment} from '../mocks/IssuesShowFragment.stories'

const RelayDecoratorStory = composeStory(RelayDecorator, IssuesShowMeta)
const RelayDecoratorWithDefaultMapFunctionStory = composeStory(RelayDecoratorWithDefaultMapFunction, IssuesShowMeta)
const RelayDecoratorFragmentStory = composeStory(RelayDecoratorFragment, IssuesShowFragmentMeta)

describe('Relay Storybook decorators', () => {
  describe('relayDecorator', () => {
    test('should render', () => {
      render(<RelayDecoratorStory />)
      expect(screen.getByText(/Issues Show Page — My issue title 1 #33/)).toBeInTheDocument()
      expect(screen.getByText(/You are SOME NAME/)).toBeInTheDocument()
      expect(screen.getByText('Name with owner: OWNER/REPO_NAME')).toBeInTheDocument()
    })

    test('should render with default mapQueryRefsToStoryArgs function', () => {
      render(<RelayDecoratorWithDefaultMapFunctionStory />)
      expect(screen.getByText(/Issues Show Page — My issue title 1 #33/)).toBeInTheDocument()
      expect(screen.getByText(/You are SOME NAME/)).toBeInTheDocument()
      expect(screen.getByText('Name with owner: OWNER/REPO_NAME')).toBeInTheDocument()
    })
  })

  describe('relayDecorator with fragment', () => {
    test('should render', () => {
      render(<RelayDecoratorFragmentStory />)
      expect(screen.getByText(/Issues Show Page — My issue title 1/)).toBeInTheDocument()
      expect(screen.getByText(/You are SOME NAME/)).toBeInTheDocument()
      expect(screen.getByText('Name with owner: OWNER/REPO_NAME')).toBeInTheDocument()
      expect(screen.getByText('Repo description: My repo has a lazy-loaded description')).toBeInTheDocument()
    })
  })
})
