import {render, screen, within} from '@testing-library/react'
import {composeStory} from '@storybook/react'

import Meta, {
  RepositoryRuleset as RepositoryRulesetStory,
  OrganizationRuleset as OrganizationRulesetStory,
} from '../stories/RulesetPage.stories'

const RepositoryRuleset = composeStory(RepositoryRulesetStory, Meta)
const OrganizationRuleset = composeStory(OrganizationRulesetStory, Meta)

describe('RulesetPage', () => {
  it('renders repository ruleset in edit mode', () => {
    render(<RepositoryRuleset />)

    // General
    const generalPanel = within(screen.getByTestId('general-panel'))
    const rulesetName: HTMLInputElement = generalPanel.getByLabelText('Ruleset Name')
    const enforcementButton: HTMLButtonElement = generalPanel.getByRole('button', {
      name: 'Active, Enforcement status',
    })

    expect(rulesetName.value).toBe('Ruleset')
    expect(enforcementButton).toBeInTheDocument()

    // Target branches
    const targetBranchesConditions = within(screen.getByTestId('targets-ref-name-conditions'))
    const targetBranches: HTMLLIElement[] = targetBranchesConditions.getAllByRole('listitem')
    const main = targetBranchesConditions.getByText('main')
    const release = targetBranchesConditions.getByText('release/*')
    const master = targetBranchesConditions.getByText('master')
    const deleteMain = targetBranchesConditions.getByRole('button', {
      name: 'Delete include of refs/heads/main',
    })
    const deleteReleases = targetBranchesConditions.getByRole('button', {
      name: 'Delete include of refs/heads/release/*',
    })
    const deleteMaster = targetBranchesConditions.getByRole('button', {
      name: 'Delete exclude of refs/heads/master',
    })

    expect(targetBranches.length).toBe(3)
    expect(main).toBeInTheDocument()
    expect(release).toBeInTheDocument()
    expect(master).toBeInTheDocument()
    expect(deleteMain).toBeInTheDocument()
    expect(deleteReleases).toBeInTheDocument()
    expect(deleteMaster).toBeInTheDocument()

    // Branch protections
    const rulesPanel = within(screen.getByTestId('rules-panel'))
    const creationRule: HTMLInputElement = rulesPanel.getByLabelText('Restrict creations')
    const pullRequestRule: HTMLInputElement = rulesPanel.getByLabelText('Require a pull request before merging')

    expect(creationRule.checked).toBe(false)
    expect(pullRequestRule.checked).toBe(true)

    // Buttons
    const revertButton: HTMLButtonElement = screen.getByRole('button', {
      name: 'Revert changes',
    })
    const saveButton: HTMLButtonElement = screen.getByRole('button', {
      name: 'Save changes',
    })

    expect(revertButton).toBeInTheDocument()
    expect(saveButton).toBeInTheDocument()
  })

  it('renders repository ruleset in readOnly mode', () => {
    render(<RepositoryRuleset readOnly />)

    // General
    const generalPanel = within(screen.getByTestId('general-panel-readOnly'))
    const rulesetName = generalPanel.getByText('Ruleset')
    const enforcementButton = generalPanel.queryByRole('button', {
      name: 'Active, Enforcement status',
    })

    expect(rulesetName).toBeInTheDocument()
    expect(enforcementButton).toBeNull()

    // Target branches
    const targetBranchesConditions = within(screen.getByTestId('targets-ref-name-conditions'))
    const targetBranches: HTMLLIElement[] = targetBranchesConditions.getAllByRole('listitem')
    const main = targetBranchesConditions.getByText('main')
    const release = targetBranchesConditions.getByText('release/*')
    const master = targetBranchesConditions.getByText('master')
    const deleteMain = targetBranchesConditions.queryByRole('button', {
      name: 'Delete include of refs/heads/main',
    })
    const deleteReleases = targetBranchesConditions.queryByRole('button', {
      name: 'Delete include of refs/heads/release/*',
    })
    const deleteMaster = targetBranchesConditions.queryByRole('button', {
      name: 'Delete exclude of refs/heads/master',
    })

    expect(targetBranches.length).toBe(3)
    expect(main).toBeInTheDocument()
    expect(release).toBeInTheDocument()
    expect(master).toBeInTheDocument()
    expect(deleteMain).toBeNull()
    expect(deleteReleases).toBeNull()
    expect(deleteMaster).toBeNull()

    // Branch protections
    const rulesPanel = within(screen.getByTestId('rules-panel'))
    const creationRule = rulesPanel.queryByText('Restrict creations')
    const pullRequestRule = rulesPanel.getByText('Require a pull request before merging')

    expect(creationRule).toBeNull()
    expect(pullRequestRule).toBeInTheDocument()

    // Buttons
    const revertButton = screen.queryByRole('button', {
      name: 'Revert changes',
    })
    const saveButton = screen.queryByRole('button', {
      name: 'Save changes',
    })

    expect(revertButton).toBeNull()
    expect(saveButton).toBeNull()
  })

  it('renders organization ruleset in edit mode', () => {
    render(<OrganizationRuleset />)

    // General
    const generalPanel = within(screen.getByTestId('general-panel'))
    const rulesetName: HTMLInputElement = generalPanel.getByLabelText('Ruleset Name')
    const enforcementButton: HTMLButtonElement = generalPanel.getByRole('button', {
      name: 'Active, Enforcement status',
    })

    expect(rulesetName.value).toBe('Ruleset')
    expect(enforcementButton).toBeInTheDocument()

    // Target repositories
    const targetRepositoriesConditions = within(screen.getByTestId('targets-repository-name-conditions'))
    const targetRepositories: HTMLLIElement[] = targetRepositoriesConditions.getAllByRole('listitem')
    const smile = targetRepositoriesConditions.getByText('smile')
    const publicServer = targetRepositoriesConditions.getByText('public-server')
    const fishsticks = targetRepositoriesConditions.getByText('fishsticks*')
    const fishsticksSneaky = targetRepositoriesConditions.getByText('fishsticks-sneaky')
    const deleteSmile: HTMLButtonElement = targetRepositoriesConditions.getByRole('button', {
      name: 'Delete include of smile',
    })
    const deletePublicServer: HTMLButtonElement = targetRepositoriesConditions.getByRole('button', {
      name: 'Delete include of public-server',
    })
    const deleteFishSticks: HTMLButtonElement = targetRepositoriesConditions.getByRole('button', {
      name: 'Delete include of fishsticks*',
    })
    const deleteFishSticksSneaky: HTMLButtonElement = targetRepositoriesConditions.getByRole('button', {
      name: 'Delete exclude of fishsticks-sneaky',
    })

    expect(targetRepositories.length).toBe(4)
    expect(smile).toBeInTheDocument()
    expect(publicServer).toBeInTheDocument()
    expect(fishsticks).toBeInTheDocument()
    expect(fishsticksSneaky).toBeInTheDocument()
    expect(deleteSmile).toBeInTheDocument()
    expect(deletePublicServer).toBeInTheDocument()
    expect(deleteFishSticks).toBeInTheDocument()
    expect(deleteFishSticksSneaky).toBeInTheDocument()

    // Target branches
    const targetBranchesConditions = within(screen.getByTestId('targets-ref-name-conditions'))
    const targetBranches: HTMLLIElement[] = targetBranchesConditions.getAllByRole('listitem')
    const main = targetBranchesConditions.getByText('main')
    const release = targetBranchesConditions.getByText('release/*')
    const master = targetBranchesConditions.getByText('master')
    const deleteMain: HTMLButtonElement = targetBranchesConditions.getByRole('button', {
      name: 'Delete include of refs/heads/main',
    })
    const deleteReleases: HTMLButtonElement = targetBranchesConditions.getByRole('button', {
      name: 'Delete include of refs/heads/release/*',
    })
    const deleteMaster: HTMLButtonElement = targetBranchesConditions.getByRole('button', {
      name: 'Delete exclude of refs/heads/master',
    })

    expect(targetBranches.length).toBe(3)
    expect(main).toBeInTheDocument()
    expect(release).toBeInTheDocument()
    expect(master).toBeInTheDocument()
    expect(deleteMain).toBeInTheDocument()
    expect(deleteReleases).toBeInTheDocument()
    expect(deleteMaster).toBeInTheDocument()

    // Branch protections
    const rulesPanel = within(screen.getByTestId('rules-panel'))
    const creationRule: HTMLInputElement = rulesPanel.getByLabelText('Restrict creations')
    const pullRequestRule: HTMLInputElement = rulesPanel.getByLabelText('Require a pull request before merging')

    expect(creationRule.checked).toBe(false)
    expect(pullRequestRule.checked).toBe(true)

    // Buttons
    const revertButton: HTMLButtonElement = screen.getByRole('button', {
      name: 'Revert changes',
    })
    const saveButton: HTMLButtonElement = screen.getByRole('button', {
      name: 'Save changes',
    })

    expect(revertButton).toBeInTheDocument()
    expect(saveButton).toBeInTheDocument()
  })

  it('renders organization ruleset in readOnly mode', () => {
    render(<OrganizationRuleset readOnly />)

    // General
    const generalPanel = within(screen.getByTestId('general-panel-readOnly'))
    const rulesetName = generalPanel.getByText('Ruleset')
    const enforcementButton = generalPanel.queryByRole('button', {
      name: 'Active, Enforcement status',
    })

    expect(rulesetName).toBeInTheDocument()
    expect(enforcementButton).toBeNull()

    // Target repositories
    const targetRepositoriesConditions = within(screen.getByTestId('targets-repository-name-conditions'))
    const targetRepositories: HTMLLIElement[] = targetRepositoriesConditions.getAllByRole('listitem')
    const smile = targetRepositoriesConditions.getByText('smile')
    const publicServer = targetRepositoriesConditions.getByText('public-server')
    const fishsticks = targetRepositoriesConditions.getByText('fishsticks*')
    const fishsticksSneaky = targetRepositoriesConditions.getByText('fishsticks-sneaky')
    const deleteSmile = targetRepositoriesConditions.queryByRole('button', {
      name: 'Delete include of smile',
    })
    const deletePublicServer = targetRepositoriesConditions.queryByRole('button', {
      name: 'Delete include of public-server',
    })
    const deleteFishSticks = targetRepositoriesConditions.queryByRole('button', {
      name: 'Delete include of fishsticks*',
    })
    const deleteFishSticksSneaky = targetRepositoriesConditions.queryByRole('button', {
      name: 'Delete exclude of fishsticks-sneaky',
    })

    expect(targetRepositories.length).toBe(4)
    expect(smile).toBeInTheDocument()
    expect(publicServer).toBeInTheDocument()
    expect(fishsticks).toBeInTheDocument()
    expect(fishsticksSneaky).toBeInTheDocument()
    expect(deleteSmile).toBeNull()
    expect(deletePublicServer).toBeNull()
    expect(deleteFishSticks).toBeNull()
    expect(deleteFishSticksSneaky).toBeNull()

    // Target branches
    const targetBranchesConditions = within(screen.getByTestId('targets-ref-name-conditions'))
    const targetBranches: HTMLLIElement[] = targetBranchesConditions.getAllByRole('listitem')
    const main = targetBranchesConditions.getByText('main')
    const release = targetBranchesConditions.getByText('release/*')
    const master = targetBranchesConditions.getByText('master')
    const deleteMain = targetBranchesConditions.queryByRole('button', {
      name: 'Delete include of refs/heads/main',
    })
    const deleteReleases = targetBranchesConditions.queryByRole('button', {
      name: 'Delete include of refs/heads/release/*',
    })
    const deleteMaster = targetBranchesConditions.queryByRole('button', {
      name: 'Delete exclude of refs/heads/master',
    })

    expect(targetBranches.length).toBe(3)
    expect(main).toBeInTheDocument()
    expect(release).toBeInTheDocument()
    expect(master).toBeInTheDocument()
    expect(deleteMain).toBeNull()
    expect(deleteReleases).toBeNull()
    expect(deleteMaster).toBeNull()

    // Branch protections
    const rulesPanel = within(screen.getByTestId('rules-panel'))
    const creationRule = rulesPanel.queryByText('Restrict creations')
    const pullRequestRule = rulesPanel.getByText('Require a pull request before merging')

    expect(creationRule).toBeNull()
    expect(pullRequestRule).toBeInTheDocument()

    // Buttons
    const revertButton = screen.queryByRole('button', {
      name: 'Revert changes',
    })
    const saveButton = screen.queryByRole('button', {
      name: 'Save changes',
    })

    expect(revertButton).toBeNull()
    expect(saveButton).toBeNull()
  })
})
