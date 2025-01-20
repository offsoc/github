import {screen, render, within} from '@testing-library/react'
import {PullRequestCodeButton} from '../components/PullRequestCodeButton'
import {getHeaderPageData} from '../test-utils/mock-data'
import {createRepository} from '@github-ui/current-repository/test-helpers'
import {renderWithClient} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'

describe('Pull Request Code Button', () => {
  test('renders a button with a dropdown', () => {
    const {pullRequest, repository} = getHeaderPageData()

    render(
      <PullRequestCodeButton
        codespacesEnabled={repository.codespacesEnabled}
        copilotEnabled={false}
        editorEnabled={false}
        isEnterprise={repository.isEnterprise}
        headBranch={pullRequest.headBranch}
        pullRequestNumber={pullRequest.number}
        repository={createRepository(repository)}
      />,
    )

    const codeButtonElement = screen.getByRole('button', {name: /Code/i})
    expect(codeButtonElement).toBeInTheDocument()
  })

  test('when menu is open, renders local menu (no tabs)', async () => {
    const {pullRequest, repository} = getHeaderPageData()

    const {user} = renderWithClient(
      <PullRequestCodeButton
        codespacesEnabled={false}
        copilotEnabled={false}
        editorEnabled={false}
        isEnterprise={repository.isEnterprise}
        headBranch={pullRequest.headBranch}
        pullRequestNumber={pullRequest.number}
        repository={createRepository(repository)}
      />,
    )

    const codeButtonElement = screen.getByRole('button', {name: /Code/})
    await user.click(codeButtonElement)

    expect(screen.getByRole('textbox', {name: `gh pr checkout ${pullRequest.number}`})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Copy url to clipboard'})).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Learn more about the GitHub CLI'})).toBeInTheDocument()
    expect(screen.getByRole('menuitem', {name: 'Checkout with GitHub Desktop'})).toBeInTheDocument()

    // If Codespaces and Copilot are disabled, then we render the Local section alone without any tabs
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', {name: /Local/})).not.toBeInTheDocument()
  })

  test('when menu is open and codespaces feature is enabled, renders a Codespaces tab', async () => {
    const {pullRequest, repository} = getHeaderPageData()

    const {user} = renderWithClient(
      <PullRequestCodeButton
        codespacesEnabled={true}
        copilotEnabled={false}
        editorEnabled={false}
        isEnterprise={repository.isEnterprise}
        headBranch={pullRequest.headBranch}
        pullRequestNumber={pullRequest.number}
        repository={createRepository(repository)}
      />,
    )

    const codeButtonElement = screen.getByRole('button', {name: /Code/i})
    await user.click(codeButtonElement)

    const tabList = screen.getByRole('tablist')
    expect(within(tabList).getByRole('tab', {name: /Local/})).toBeInTheDocument()
    expect(within(tabList).getByRole('tab', {name: /Codespaces/})).toBeInTheDocument()
    expect(within(tabList).queryByRole('tab', {name: /Copilot/})).not.toBeInTheDocument()
  })

  test('when menu is open and copilot feature is enabled, renders a Copilot tab', async () => {
    const {pullRequest, repository} = getHeaderPageData()

    const {user} = renderWithClient(
      <PullRequestCodeButton
        codespacesEnabled={false}
        copilotEnabled={true}
        editorEnabled={false}
        isEnterprise={repository.isEnterprise}
        headBranch={pullRequest.headBranch}
        pullRequestNumber={pullRequest.number}
        repository={createRepository(repository)}
      />,
    )

    const codeButtonElement = screen.getByRole('button', {name: /Code/i})
    await user.click(codeButtonElement)

    const tabList = screen.getByRole('tablist')
    expect(within(tabList).getByRole('tab', {name: /Local/})).toBeInTheDocument()
    expect(within(tabList).queryByRole('tab', {name: /Codespaces/})).not.toBeInTheDocument()
    expect(within(tabList).getByRole('tab', {name: /Copilot/})).toBeInTheDocument()
  })

  test('when menu is open and editor feature is enabled, renders a GitHub Editor tab', async () => {
    const {pullRequest, repository} = getHeaderPageData()

    const {user} = renderWithClient(
      <PullRequestCodeButton
        codespacesEnabled={false}
        copilotEnabled={true} // editor is only enabled if copilot is enabled
        editorEnabled={true}
        isEnterprise={repository.isEnterprise}
        headBranch={pullRequest.headBranch}
        pullRequestNumber={pullRequest.number}
        repository={createRepository(repository)}
      />,
    )

    const codeButtonElement = screen.getByRole('button', {name: /Code/i})
    await user.click(codeButtonElement)

    const tabList = screen.getByRole('tablist')
    expect(within(tabList).getByRole('tab', {name: /Local/})).toBeInTheDocument()
    expect(within(tabList).queryByRole('tab', {name: /Codespaces/})).not.toBeInTheDocument()
    expect(within(tabList).getByRole('tab', {name: /Copilot/})).toBeInTheDocument()
    expect(within(tabList).getByRole('tab', {name: /GitHub Editor/})).toBeInTheDocument()
  })
})
