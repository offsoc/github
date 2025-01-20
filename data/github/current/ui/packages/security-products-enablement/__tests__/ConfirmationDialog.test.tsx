import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import ConfirmationDialog from '../components/ConfirmationDialog'
import {dialogWrapper} from './test-helpers'
import {RequestStatus} from '../security-products-enablement-types'

describe('ConfirmationDialog', () => {
  const url = 'https://example.com'
  const confirmationDialogSummary = {
    public_repo_count: 5,
    private_and_internal_repo_count: 10,
    private_and_internal_repos_count_exceeding_licenses: 0,
    licenses_needed: 2,
    total_repo_count: 15,
    errors: [],
    requestStatus: RequestStatus.Success,
  }
  const pendingConfigurationChanges = {
    config: {
      id: 1,
      name: 'GitHub recommended',
      description: 'Recommended configuration for GitHub security products',
      enable_ghas: true,
      repositories_count: 0,
      default_for_new_private_repos: false,
      default_for_new_public_repos: false,
      enforcement: 'not_enforced',
    },
    overrideExistingConfig: false,
    applyToAll: false,
    repositoryFilterQuery: '',
  }
  const nonRecommendedConfig = {
    config: {
      id: 2,
      name: 'Custom config',
      description: 'Custom configuration for GitHub security products',
      enable_ghas: true,
      repositories_count: 0,
      default_for_new_private_repos: true,
      default_for_new_public_repos: false,
      enforcement: 'not_enforced',
    },
    overrideExistingConfig: false,
    applyToAll: false,
    repositoryFilterQuery: '',
  }
  const enforcedConfig = {
    config: {
      id: 3,
      name: 'Custom config',
      description: 'Custom configuration for enforcing GitHub security products',
      enable_ghas: true,
      repositories_count: 0,
      default_for_new_private_repos: true,
      default_for_new_public_repos: false,
      enforcement: 'enforced',
    },
    overrideExistingConfig: false,
    applyToAll: false,
    repositoryFilterQuery: '',
  }

  it('renders the confirmation message', () => {
    render(
      <ConfirmationDialog
        confirmationDialogSummary={confirmationDialogSummary}
        pendingConfigurationChanges={pendingConfigurationChanges}
        showDefaultForNewReposDropDown={false}
        hasPublicRepos={true}
        ghasPurchased={true}
        docsBillingUrl={url}
      />,
      {wrapper: dialogWrapper},
    )

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)

    expect(listItems[0]).toHaveTextContent('5 public repositories')
    expect(listItems[1]).toHaveTextContent('10 private and internal repositories')
    expect(listItems[2]).toHaveTextContent('2 GitHub Advanced Security licenses required')
  })

  it('does not render the license summary message if GHAS is not purchased in confirmation message', () => {
    render(
      <ConfirmationDialog
        confirmationDialogSummary={confirmationDialogSummary}
        pendingConfigurationChanges={pendingConfigurationChanges}
        showDefaultForNewReposDropDown={false}
        hasPublicRepos={true}
        ghasPurchased={false}
        docsBillingUrl={url}
      />,
      {wrapper: dialogWrapper},
    )

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    expect(listItems[0]).toHaveTextContent('5 public repositories')
    expect(listItems[1]).toHaveTextContent('10 private and internal repositories')
  })

  it('renders the license exceed warning message for select all', () => {
    const confirmationDialogSummaryWithError = {
      public_repo_count: 5,
      private_and_internal_repo_count: 10,
      private_and_internal_repos_count_exceeding_licenses: 0,
      licenses_needed: 2,
      total_repo_count: 15,
      errors: ['license_limit_exceeded'],
      requestStatus: RequestStatus.Success,
    }

    render(
      <ConfirmationDialog
        confirmationDialogSummary={confirmationDialogSummaryWithError}
        pendingConfigurationChanges={pendingConfigurationChanges}
        showDefaultForNewReposDropDown={false}
        hasPublicRepos={true}
        ghasPurchased={true}
        docsBillingUrl={url}
      />,
      {wrapper: dialogWrapper},
    )

    const banner = screen.getByTestId('flash')
    expect(banner).toHaveTextContent(
      'You need 2 additional licenses. Private repositories that do not have GitHub Advanced Security will only have free features enabled.',
    )
  })

  it('renders the license exceed warning message for selected repos', () => {
    const confirmationDialogSummaryWithError = {
      public_repo_count: 5,
      private_and_internal_repo_count: 10,
      private_and_internal_repos_count_exceeding_licenses: 2,
      licenses_needed: 2,
      total_repo_count: 15,
      errors: ['license_limit_exceeded'],
      requestStatus: RequestStatus.Success,
    }

    render(
      <ConfirmationDialog
        confirmationDialogSummary={confirmationDialogSummaryWithError}
        pendingConfigurationChanges={pendingConfigurationChanges}
        showDefaultForNewReposDropDown={false}
        hasPublicRepos={true}
        ghasPurchased={true}
        docsBillingUrl={url}
      />,
      {wrapper: dialogWrapper},
    )

    const banner = screen.getByTestId('flash')
    expect(banner).toHaveTextContent(
      '2 private repositories do not have GitHub Advanced Security and will only have free features enabled.',
    )
  })

  it('renders the ghas not purchased message for private repos on a non-ghas orgs', () => {
    const confirmationDialogSummaryWithError = {
      public_repo_count: 1,
      private_and_internal_repo_count: 1,
      private_and_internal_repos_count_exceeding_licenses: 0,
      licenses_needed: 0,
      total_repo_count: 2,
      errors: ['ghas_not_purchased'],
      requestStatus: RequestStatus.Success,
    }

    render(
      <ConfirmationDialog
        confirmationDialogSummary={confirmationDialogSummaryWithError}
        pendingConfigurationChanges={pendingConfigurationChanges}
        showDefaultForNewReposDropDown={false}
        hasPublicRepos={true}
        ghasPurchased={true}
        docsBillingUrl={url}
      />,
      {wrapper: dialogWrapper},
    )

    const banner = screen.getByTestId('flash')
    expect(banner).toHaveTextContent(
      'This organization does not have GitHub Advanced Security. Private repositories will only have free features enabled.',
    )
  })

  it('does not render the ghas not purchased message for public repos only on a non-ghas orgs', () => {
    const confirmationDialogSummaryWithError = {
      public_repo_count: 1,
      private_and_internal_repo_count: 0,
      private_and_internal_repos_count_exceeding_licenses: 0,
      licenses_needed: 0,
      total_repo_count: 1,
      errors: ['ghas_not_purchased'],
      requestStatus: RequestStatus.Success,
    }

    render(
      <ConfirmationDialog
        confirmationDialogSummary={confirmationDialogSummaryWithError}
        pendingConfigurationChanges={pendingConfigurationChanges}
        showDefaultForNewReposDropDown={false}
        hasPublicRepos={true}
        ghasPurchased={true}
        docsBillingUrl={url}
      />,
      {wrapper: dialogWrapper},
    )

    const banner = screen.queryByTestId('flash')
    expect(banner).toBeNull()
  })

  it('renders an error message when the request for confirmation summary fails', () => {
    const confirmationDialogSummaryFailure = {
      public_repo_count: 0,
      private_and_internal_repo_count: 0,
      private_and_internal_repos_count_exceeding_licenses: 0,
      licenses_needed: 0,
      total_repo_count: 0,
      errors: [],
      requestStatus: RequestStatus.Error,
    }

    render(
      <ConfirmationDialog
        confirmationDialogSummary={confirmationDialogSummaryFailure}
        pendingConfigurationChanges={pendingConfigurationChanges}
        showDefaultForNewReposDropDown={false}
        hasPublicRepos={true}
        ghasPurchased={true}
        docsBillingUrl={url}
      />,
    )

    const dialogContent = screen.getByTestId('confirmation-dialog-content')
    expect(dialogContent).toHaveTextContent(
      'We are currently unable to calculate the required number of licenses for this application',
    )
  })

  it('does not render NewRepoDefaultDropDown if showDefaultForNewReposDropDown is false', async () => {
    render(
      <ConfirmationDialog
        confirmationDialogSummary={confirmationDialogSummary}
        pendingConfigurationChanges={nonRecommendedConfig}
        showDefaultForNewReposDropDown={false}
        hasPublicRepos={true}
        ghasPurchased={true}
        docsBillingUrl={url}
      />,
      {wrapper: dialogWrapper},
    )

    expect(screen.queryByTestId('repo-default-button')).not.toBeInTheDocument()
  })

  it('does render NewRepoDefaultDropDown if showDefaultForNewReposDropDown is true', () => {
    render(
      <ConfirmationDialog
        confirmationDialogSummary={confirmationDialogSummary}
        pendingConfigurationChanges={nonRecommendedConfig}
        showDefaultForNewReposDropDown={true}
        hasPublicRepos={true}
        ghasPurchased={true}
        docsBillingUrl={url}
      />,
      {wrapper: dialogWrapper},
    )

    expect(screen.getByTestId('repo-default-button')).toBeInTheDocument()
  })

  describe('without public repos', () => {
    it('renders NewRepoDefaultDropDown', () => {
      render(
        <ConfirmationDialog
          confirmationDialogSummary={confirmationDialogSummary}
          pendingConfigurationChanges={pendingConfigurationChanges}
          showDefaultForNewReposDropDown={true}
          hasPublicRepos={false}
          ghasPurchased={true}
          docsBillingUrl={url}
        />,
        {wrapper: dialogWrapper},
      )

      expect(screen.getByTestId('repo-default-button')).toBeInTheDocument()
    })

    it('renders apply and enforce text on an enforced configuration', () => {
      render(
        <ConfirmationDialog
          confirmationDialogSummary={confirmationDialogSummary}
          pendingConfigurationChanges={enforcedConfig}
          showDefaultForNewReposDropDown={true}
          hasPublicRepos={false}
          ghasPurchased={true}
          docsBillingUrl={url}
        />,
        {wrapper: dialogWrapper},
      )

      expect(screen.getByText(/apply and enforce/)).toBeInTheDocument()
    })

    it('renders apply text on a non-enforced configuration', () => {
      render(
        <ConfirmationDialog
          confirmationDialogSummary={confirmationDialogSummary}
          pendingConfigurationChanges={nonRecommendedConfig}
          showDefaultForNewReposDropDown={true}
          hasPublicRepos={false}
          ghasPurchased={true}
          docsBillingUrl={url}
        />,
        {wrapper: dialogWrapper},
      )

      expect(screen.getByText(/apply/)).toBeInTheDocument()
      expect(screen.queryByText(/enforce/)).not.toBeInTheDocument()
    })
  })
})
