# frozen_string_literal: true

require "thor"
require_relative Rails.root.join("script/seeds/runner")
Seeds::Runner.require_runners

# Do not require anything else here.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class App < Thor
    def self.exit_on_failure?
      true
    end

    desc "example_repos", Seeds::Runner::ExampleRepos.help.lines.first
    long_desc Seeds::Runner::ExampleRepos.help
    method_option :commit_count, type: :numeric, desc: "Exact number of commits to generate per repo", default: Seeds::Runner::ExampleRepos::DEFAULT_COMMIT_COUNT
    method_option :import_users, type: :boolean, desc: "Import users from repository commits. If they don't exist they will be created.", required: false, default: false
    method_option :rand_seed, type: :numeric, desc: "Seed value to provide to Ruby's seed generator. Allows for some determinism in the data generated.", default: nil
    method_option :user_count, type: :numeric, desc: "Create additional users. Monalisa is always created regardless.", required: false, default: 0
    def example_repos
      Seeds::Runner::ExampleRepos.execute(options)
    end

    desc "github_repo", Seeds::Runner::GitHubRepo.help.lines.first
    long_desc Seeds::Runner::GitHubRepo.help
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to copy", required: true
    method_option :business, type: :string, aliases: "-b", desc: "Business to add org to", required: false
    method_option :admin, type: :string, aliases: "-a", desc: "Admin for org and business", required: false
    method_option :token, type: :string, aliases: "-t", desc: "GitHub Personal Access Token", required: false
    method_option :skip_business, type: :boolean, aliases: "-s", desc: "Skip business association", default: false
    method_option :overwrite_visibility, type: :string, aliases: "-v", desc: "Overwrite the visibility of the repo (public|private|internal)", required: false
    method_option :template, type: :boolean, desc: "Make repository a template", required: false, default: false
    method_option :import_users, type: :boolean, desc: "Import users from repository commits", required: false, default: false
    def github_repo
      Seeds::Runner::GitHubRepo.execute(options)
    end

    desc "actions", Seeds::Runner::Actions.help.lines.first
    long_desc Seeds::Runner::Actions.help
    method_option :workflow_run_count, type: :numeric, aliases: "-c", desc: "# of workflow runs to make per workflow", default: 20
    method_option :workflow_count, type: :numeric, aliases: "-w", desc: "# of workflow files to make (creates 2 workflow files if not specified)", default: nil
    def actions
      Seeds::Runner::Actions.execute(options)
    end

    desc "check_run", Seeds::Runner::CheckRun.help.lines.first
    long_desc Seeds::Runner::CheckRun.help
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use", required: true
    method_option :pr, type: :string, desc: "The PR number for which to make checks", required: true
    method_option :interactive, aliases: "-i", type: :boolean, desc: "Whether to use an interactive mode", required: false
    method_option :fresh_push, aliases: "-fp", type: :boolean, desc: "Whether to create a fresh push first", required: false
    method_option :check_outcome, aliases: "-c", type: :string, desc: "Which outcome the check should be", enum: %w(green yellow red), required: false
    def check_run
      Seeds::Runner::CheckRun.execute(options)
    end

    desc "checks", Seeds::Runner::Checks.help.lines.first
    long_desc Seeds::Runner::Checks.help
    def checks
      Seeds::Runner::Checks.execute(options)
    end

    desc "deployments", Seeds::Runner::Deployments.help.lines.first
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use"
    method_option :pr, type: :string, desc: "The PR number for which to make checks"
    method_option :integration_slug, aliases: "-i", type: :string, desc: "The slug of the integration you wish to attribute the deployments to"
    long_desc Seeds::Runner::Deployments.help
    def deployments
      Seeds::Runner::Deployments.execute(options)
    end

    desc "dmca_strike_repos", Seeds::Runner::DmcaStrikeRepos.help.lines.first
    long_desc Seeds::Runner::DmcaStrikeRepos.help
    def dmca_strike_repos
      Seeds::Runner::DmcaStrikeRepos.execute(options)
    end

    desc "internal_integrations", Seeds::Runner::InternalIntegrations.help.lines.first
    long_desc Seeds::Runner::InternalIntegrations.help
    def internal_integrations
      Seeds::Runner::InternalIntegrations.execute(options)
    end

    desc "integration_agents", Seeds::Runner::IntegrationAgents.help.lines.first
    method_option :org_owned, type: :boolean, aliases: "-o", desc: "If integration is org owned"
    method_option :count, type: :numeric, aliases: "-n", desc: "The number of models to make", required: true, default: 1
    long_desc Seeds::Runner::IntegrationAgents.help
    def integration_agents
      Seeds::Runner::IntegrationAgents.execute(options)
    end

    desc "models_for_export", Seeds::Runner::ModelsForExport.help.lines.first
    long_desc Seeds::Runner::ModelsForExport.help
    method_option :count, type: :numeric, aliases: "-n", desc: "The number of models to make", default: 10
    def models_for_export
      Seeds::Runner::ModelsForExport.execute(options)
    end

    desc "models_for_load", Seeds::Runner::ModelsForLoad.help.lines.first
    long_desc Seeds::Runner::ModelsForLoad.help
    method_option :count, type: :numeric, aliases: "-n", desc: "The number of models to make", required: true, default: 100
    def models_for_load
      Seeds::Runner::ModelsForLoad.execute(options)
    end

    desc "reminders", Seeds::Runner::Reminders.help.lines.first
    long_desc Seeds::Runner::Reminders.help
    def reminders
      Seeds::Runner::Reminders.execute(options)
    end

    desc "repository_access_management", Seeds::Runner::RepositoryAccessManagement.help.lines.first
    long_desc Seeds::Runner::RepositoryAccessManagement.help
    def repository_access_management
      Seeds::Runner::RepositoryAccessManagement.execute(options)
    end

    desc "team_sync_integration", Seeds::Runner::TeamSyncIntegration.help.lines.first
    long_desc Seeds::Runner::TeamSyncIntegration.help
    # method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use", required: true
    def team_sync_integration
      Seeds::Runner::TeamSyncIntegration.execute(options)
    end

    desc "failed_organization_invitations", Seeds::Runner::FailedOrganizationInvitations.help.lines.first
    method_option :org_name, type: :string, aliases: "-n", desc: "Organization Name", required: false
    method_option :invite_number, type: :string, aliases: "-t", desc: "Number of invites", required: false
    long_desc Seeds::Runner::FailedOrganizationInvitations.help
    def failed_organization_invitations
      Seeds::Runner::FailedOrganizationInvitations.execute(options)
    end

    desc "pending_organization_invitations", Seeds::Runner::PendingOrganizationInvitations.help.lines.first
    method_option :org_name, type: :string, aliases: "-n", desc: "Organization Name", required: false
    method_option :invite_number, type: :string, aliases: "-t", desc: "Number of invites", required: false
    long_desc Seeds::Runner::PendingOrganizationInvitations.help
    def pending_organization_invitations
      Seeds::Runner::PendingOrganizationInvitations.execute(options)
    end

    desc "organizations", Seeds::Runner::Organizations.help.lines.first
    long_desc Seeds::Runner::Organizations.help
    method_option :org_name, type: :string, aliases: "-n", desc: "Organization Name", required: true
    method_option :email_domain, type: :string, aliases: "-d", desc: "Domain for User Accounts", required: false
    method_option :logins, type: :string, aliases: "-l", desc: "Comma-separated list of User logins and email addresses", required: false
    def organizations
      Seeds::Runner::Organizations.execute(options)
    end

    desc "organization_invitations", Seeds::Runner::OrganizationInvitations.help.lines.first
    long_desc Seeds::Runner::OrganizationInvitations.help
    method_option :org_name, type: :string, aliases: "-n", desc: "Organization Name", required: true
    method_option :invitee, type: :string, aliases: "-i", desc: "Invitee login", required: false
    method_option :email, type: :string, aliases: "-e", desc: "Invitee email", required: false
    method_option :role, type: :string, aliases: "-r", desc: "Invitee role", required: false
    def organization_invitations
      Seeds::Runner::OrganizationInvitations.execute(options)
    end

    desc "code_scanning", Seeds::Runner::CodeScanning.help.lines.first
    long_desc Seeds::Runner::CodeScanning.help
    method_option :name, type: :string, aliases: "-n", desc: "Give custom name to the repository (optional)", required: false
    method_option :repo_path, type: :string, aliases: "-r", desc: "Give path to premade repo (can be local .git folder or remote location)", default: "script/seeds/data/code_scanning/default.git"
    method_option :organization, type: :boolean, aliases: "-o", desc: "Create an Organization owned repository", default: false
    method_option :organization_name, type: :string, desc: "Organization name"
    method_option :is_public, type: :boolean, desc: "Whether or not to create/restore a public repo"
    def code_scanning
      Seeds::Runner::CodeScanning.execute(options)
    end

    desc "code_scanning_autofix", Seeds::Runner::CodeScanningAutofix.help.lines.first
    long_desc Seeds::Runner::CodeScanningAutofix.help
    method_option :repo, type: :string, desc: "Repository name or nwo", required: false
    method_option :org, type: :string, desc: "Organization name", required: false
    def code_scanning_autofix
      Seeds::Runner::CodeScanningAutofix.execute(options)
    end

    desc "security_campaign", Seeds::Runner::SecurityCampaign.help.lines.first
    long_desc Seeds::Runner::SecurityCampaign.help
    method_option :repo_name, type: :string, aliases: "-n", desc: "Custom or existing repository name", required: false
    method_option :org, type: :string, aliases: "-o", desc: "Organization name", required: false
    method_option :manager, type: :string, aliases: "-m", desc: "Manager name", required: false
    method_option :campaign_name, type: :string, desc: "Security Campaign name", required: false
    method_option :campaign_description, type: :string, desc: "Security Campaign description", required: false
    method_option :campaign_duration, type: :numeric, desc: "Security Campaign duration in days (from now)", required: false
    def security_campaign
      Seeds::Runner::SecurityCampaign.execute(options)
    end

    desc "marketplace_listing", Seeds::Runner::MarketplaceListing.help.lines.first
    long_desc Seeds::Runner::MarketplaceListing.help
    method_option :count, type: :numeric, aliases: "-n", desc: "Number of listings to create", default: 1
    method_option :login, type: :string, aliases: "-l", desc: "The owner of the integration/oauth application", required: false
    def marketplace_listing
      Seeds::Runner::MarketplaceListing.execute(options)
    end

    desc "marketplace_partner_action_listings", Seeds::Runner::MarketplacePartnerActionListings.help.lines.first
    long_desc Seeds::Runner::MarketplacePartnerActionListings.help
    def marketplace_partner_action_listings
      Seeds::Runner::MarketplacePartnerActionListings.execute(options)
    end

    desc "azure_models", Seeds::Runner::AzureModels.help.lines.first
    long_desc Seeds::Runner::AzureModels.help
    def azure_models
      Seeds::Runner::AzureModels.execute(options)
    end

    desc "actions_repos", Seeds::Runner::ActionsRepos.help.lines.first
    long_desc Seeds::Runner::ActionsRepos.help
    method_option :count, type: :numeric, aliases: "-n", desc: "Number of repos to create. Will max out at the number of public, unarchived repos in the Actions org on production"
    method_option :login, type: :string, aliases: "-l", desc: "The user to use for this operation, will be the admin of the Actions org", required: false
    method_option :use_marketplace, type: :string, aliases: "-m", desc: "Creates a listing for each action on the marketplace", required: false
    def actions_repos
      Seeds::Runner::ActionsRepos.execute(options)
    end

    desc "actions_repos_codespaces", Seeds::Runner::ActionsReposCodespaces.help.lines.first
    long_desc Seeds::Runner::ActionsReposCodespaces.help
    def actions_repos_codespaces
      Seeds::Runner::ActionsReposCodespaces.execute(options)
    end

    desc "discussions", Seeds::Runner::Discussions.help.lines.first
    long_desc Seeds::Runner::Discussions.help
    method_option :repo, type: :string, aliases: "-r", desc: "Name-with-owner (monalisa/repo-name) of new or existing repository to populate with discussions", default: nil
    method_option :"create-participants", type: :boolean, desc: "Create new users as participants", default: false
    method_option :"participant-count", type: :numeric, desc: "Number of verified users to create as participants", default: 10
    method_option :"discussion-count", type: :numeric, desc: "Exact number of discussions to generate per repo", default: 10
    method_option :"comment-count", type: :numeric, desc: "Exact number of top-level comments to generate for each discussion"
    method_option :"comment-min", type: :numeric, desc: "Minimum number of top-level comments to generate for each discussion"
    method_option :"comment-max", type: :numeric, desc: "Maximum number of top-level comments to generate for each discussion"
    method_option :"thread-count", type: :numeric, desc: "Exact number of child comments to generate for each comment"
    method_option :"thread-min", type: :numeric, desc: "Minimum number of child comments to generate for each comment"
    method_option :"thread-max", type: :numeric, desc: "Maximum number of child comments to generate for each comment"
    method_option :seed, type: :string, aliases: "-s", desc: "Random seed"
    method_option :"convert-issues", type: :boolean, desc: "Create some discussions from issues, if any exist", default: false
    method_option :"link-issues", type: :boolean, desc: "Link some discussions to issues, if any exist", default: false
    method_option :"refer-in-issues-prs", type: :boolean, desc: "Link to discussions in some issues & PRs, if any exist", default: false
    def discussions
      Seeds::Runner::Discussions.execute(options)
    end

    desc "issues", Seeds::Runner::Issues.help.lines.first
    long_desc Seeds::Runner::Issues.help
    def issues
      Seeds::Runner::Issues.execute(options)
    end

    desc "star", Seeds::Runner::Stars.help.lines.first
    long_desc Seeds::Runner::Stars.help
    method_option :repo, type: :string, aliases: "-r", desc: "Name-with-owner (monalisa/repo-name) of new or existing repository to populate with stars", default: nil
    method_option :"star-count", type: :numeric, desc: "Exact number of stars to generate per repo", default: 10
    def stars
      Seeds::Runner::Stars.execute(options)
    end

    desc "issues_performance", Seeds::Runner::IssuesPerformance.help.lines.first
    long_desc Seeds::Runner::IssuesPerformance.help
    method_option :cross_references_count, type: :numeric, desc: "Number of cross-references to create"
    method_option :commit_events_count, type: :numeric, desc: "Number of referencing commits to create"
    method_option :comments_count, type: :numeric, desc: "Number of comments to create"
    method_option :email_comments_count, type: :numeric, desc: "Number of email comments to create"
    method_option :members_count, type: :numeric, desc: "Number of members to create in the repository"
    method_option :repositories_count, type: :numeric, desc: "Number of repositories that the commits are spread across"
    def issues_performance
      Seeds::Runner::IssuesPerformance.execute(options)
    end

    desc "issues_react", Seeds::Runner::IssuesReact.help.lines.first
    long_desc Seeds::Runner::IssuesReact.help
    method_option :tiny, type: :boolean, alias: "--tiny", desc: "Create a tiny dataset"
    method_option :small, type: :boolean, alias: "--small", desc: "Create a small dataset"
    method_option :medium, type: :boolean, alias: "--medium", desc: "Create a medium dataset"
    method_option :large, type: :boolean, alias: "--large", desc: "Create a large dataset"
    def issues_react
      Seeds::Runner::IssuesReact.execute(options)
    end

    desc "issues_state_reason", Seeds::Runner::IssuesStateReason.help.lines.first
    long_desc Seeds::Runner::IssuesStateReason.help
    method_option :number_of_open_issues, type: :numeric, desc: "Number of issue with the state open and state reason nil", default: 10
    method_option :number_of_closed_issues, type: :numeric, desc: "Number of issue with the state closed and state reason nil", default: 10
    method_option :number_of_reopened_issues, type: :numeric, desc: "Number of issue with the state open and state reason reopened", default: 10
    method_option :number_of_not_planned_issues, type: :numeric, desc: "Number of issue with the state closed and state reason not planed", default: 10
    def issues_state_reason
      Seeds::Runner::IssuesStateReason.execute(options)
    end

    desc "issues_load", Seeds::Runner::IssuesLoad.help.lines.first
    long_desc Seeds::Runner::IssuesLoad.help
    method_option :repo_name, type: :string, desc: "Name of the repo", required: true, default: "github/issue_load"
    method_option :label_count, type: :numeric, desc: "Number of labels", required: true, default: 20
    method_option :issue_count, type: :numeric, desc: "Number of issues", required: true, default: 200
    def issues_load
      Seeds::Runner::IssuesLoad.execute(options)
    end

    desc "sub_issue", Seeds::Runner::SubIssue.help.lines.first
    long_desc Seeds::Runner::SubIssue.help
    method_option :repo_name, type: :string, desc: "Name of the repo", required: true, default: "github/issue_load"
    method_option :sub_issue_count, type: :numeric, desc: "Number of sub-issues", required: false, default: 5
    def sub_issue
      Seeds::Runner::SubIssue.execute(options)
    end

    desc "memex_elasticsearch_benchmark", Seeds::Runner::MemexElasticsearchBenchmark.help.lines.first
    long_desc Seeds::Runner::MemexElasticsearchBenchmark.help
    method_option :num_projects, type: :numeric, desc: "Generate this many projects", required: false, default: Seeds::Runner::MemexElasticsearchBenchmark::DEFAULT_PROJECTS
    method_option :num_items, type: :numeric, desc: "Generate this many items for each project", required: false, default: Seeds::Runner::MemexElasticsearchBenchmark::DEFAULT_ITEMS
    method_option :seed, type: :numeric, desc: "Specify the seed to use when generating random data", required: false
    method_option :output_directory, type: :string, desc: "Output path for the files that can be used to run the benchmark", required: false, default: Seeds::Runner::MemexElasticsearchBenchmark::DEFAULT_OUTPUT_DIRECTORY.to_s
    def memex_elasticsearch_benchmark
      Seeds::Runner::MemexElasticsearchBenchmark.execute(options)
    end

    desc "memex_projects", Seeds::Runner::MemexProjects.help.lines.first
    long_desc Seeds::Runner::MemexProjects.help
    method_option :empty, type: :boolean, desc: "Create an empty project", required: false
    method_option :p50, type: :boolean, desc: "Create a project with 100 items and 10 columns", required: false, default: false
    method_option :p99, type: :boolean, desc: "Create a project with 1000 items and 10 columns", required: false, default: false
    method_option :mega, type: :boolean, desc: "Create a project with 500 items", required: false, default: false
    method_option :count, type: :numeric, desc: "Create a project with n items", required: false, default: 0
    method_option :seed, type: :numeric, desc: "Specify the seed to use when generating random data", required: false, default: 0
    method_option :tracking, type: :boolean, desc: "Add a tracking issue", required: false, default: false
    method_option :owner, type: :string, desc: "Assign the project to a specific organization or user", required: false, default: "github"
    def memex_projects
      Seeds::Runner::MemexProjects.execute(options)
    end

    desc "memex_custom_templates", Seeds::Runner::MemexCustomTemplates.help.lines.first
    long_desc Seeds::Runner::MemexCustomTemplates.help
    def memex_custom_templates
      Seeds::Runner::MemexCustomTemplates.execute(options)
    end

    desc "tasklist_blocks", Seeds::Runner::TasklistBlocks.help.lines.first
    long_desc Seeds::Runner::TasklistBlocks.help
    method_option :count, type: :numeric, desc: "Create n items, some with children and grandchildren in tasklist blocks", required: false, default: 5
    method_option :add_percent_to_project, type: :numeric, desc: "Adds n% of the created items to a project", required: false, default: 0
    method_option :seed, type: :numeric, desc: "Specify the seed to use when generating random data", required: false, default: 0
    def tasklist_blocks
      Seeds::Runner::TasklistBlocks.execute(options)
    end

    desc "enterprise_account_with_bundled_licenses", Seeds::Runner::EnterpriseAccountWithBundledLicenses.help.lines.first
    long_desc Seeds::Runner::EnterpriseAccountWithBundledLicenses.help
    method_option :administrator_login, type: :string, aliases: "-a", desc: "The user to make the administrator of the new enterprise account", required: false
    def enterprise_account_with_bundled_licenses
      Seeds::Runner::EnterpriseAccountWithBundledLicenses.execute(options)
    end

    desc "tracked_issues", Seeds::Runner::TrackedIssues.help.lines.first
    long_desc Seeds::Runner::TrackedIssues.help
    method_option :repo_name, type: :string, desc: "Name of repo to use", required: true, default: "github/tracked_issues"
    def tracked_issues
      Seeds::Runner::TrackedIssues.execute(options)
    end

    desc "tracked_issues_load", Seeds::Runner::TrackedIssuesLoad.help.lines.first
    long_desc Seeds::Runner::TrackedIssuesLoad.help
    method_option :repo_name, type: :string, desc: "Name of the repo", required: true, default: "github/tracked_issues_load"
    method_option :tracking_issues_count, type: :numeric, desc: "Number of tracking issues", required: true, default: 10
    method_option :tracked_issues_count, type: :numeric, desc: "Number of tracked issues in each tracking issue", required: true, default: 100
    def tracked_issues_load
      Seeds::Runner::TrackedIssuesLoad.execute(options)
    end

    desc "billing_owners", Seeds::Runner::BillingOwners.help.lines.first
    long_desc Seeds::Runner::BillingOwners.help
    method_option :reset, type: :boolean, desc: "Delete and recreate owners and usage", default: false
    method_option :invoiced_organization_zuora_account_id, type: :string, desc: "The zuora account id to connect to the invoiced organization. GitHub uses this to pull invoices and other info. You can find the href ID on https://apisandbox.zuora.com/ like https://apisandbox.zuora.com/apps/CustomerAccount.do?method=view&id=2c92c0fa62ceb6a60162d46f64891534"
    method_option :invoiced_business_zuora_account_id, type: :string, desc: "The zuora account id to connect to the invoiced business. GitHub uses this to pull invoices and other info. You can find the href ID on https://apisandbox.zuora.com/ like https://apisandbox.zuora.com/apps/CustomerAccount.do?method=view&id=2c92c0fa62ceb6a60162d46f64891534"
    method_option :credit_card_users, type: :numeric, desc: "How many users paying by credit card to create.", default: 1
    method_option :credit_card_organizations, type: :numeric, desc: "How many organizations paying by credit card to create.", default: 2
    method_option :invoiced_organizations, type: :numeric, desc: "How many organizations paying by invoice to create.", default: 2
    method_option :invoiced_businesses, type: :numeric, desc: "How many businesses paying by invoice to create.", default: 2
    method_option :azure_businesses, type: :numeric, desc: "How many businesses paying by azure to create.", default: 1
    def billing_owners
      Seeds::Runner::BillingOwners.execute(options)
    end

    desc "billing_business_personas", Seeds::Runner::BillingBusinessPersonas.help.lines.first
    long_desc Seeds::Runner::BillingBusinessPersonas.help
    method_option :reset, type: :boolean, desc: "Delete and recreate businesses", default: false
    method_option :self_serve_business_monthly, type: :boolean, desc: "Determines whether a self-serve business on a monthly billing frequency should be created", default: true
    method_option :self_serve_business_yearly, type: :boolean, desc: "Determines whether a self-serve business on a yearly billing frequency should be created", default: true
    method_option :self_serve_rbi_payment_method, type: :boolean, desc: "Determines whether a self-serve business with payment affected by RBI should be created", default: true
    method_option :self_serve_locked_billing, type: :boolean, desc: "Determines whether a self-serve business with locked billing should be created", default: true
    method_option :self_serve_dunning, type: :boolean, desc: "Determines whether a self-serve business on a dunning cycle should be created", default: false
    method_option :self_serve_no_payment_method, type: :boolean, desc: "Determines whether a self-serve business with no payment method should be created", default: true
    method_option :self_serve_declined_payment_method, type: :boolean, desc: "Determines whether a self-serve business with a payment method that will be declined should be created", default: true
    method_option :self_serve_business_on_trial, type: :boolean, desc: "Determines whether a self-serve business on an Enterprise trial should be created", default: true
    method_option :self_serve_metered_business_on_trial, type: :boolean, desc: "Determines whether a self-serve metered business on an Enterprise trial should be created", default: true
    method_option :self_serve_metered_ghec_business, type: :boolean, desc: "Determines whether a self-serve metered GHEC business should be created", default: true
    method_option :sales_serve_volume_ghec_business, type: :boolean, desc: "Determines whether a sales-serve volume GHEC business should be created", default: true
    method_option :sales_serve_volume_ghec_business_with_vss_bundle, type: :boolean, desc: "Determines whether a sales-serve volume GHEC business with a VSS bundle should be created", default: true
    def billing_business_personas
      Seeds::Runner::BillingBusinessPersonas.execute(options)
    end

    desc "billing_enabled_products", Seeds::Runner::BillingEnabledProducts.help.lines.first
    long_desc Seeds::Runner::BillingBusinessPersonas.help
    method_option :reset, type: :boolean, desc: "Delete and recreate enabled products", default: false
    method_option :customer_id, type: :numeric, desc: "Customer id, defaults to 1, github-inc", default: 1
    method_option :all_products, type: :boolean, desc: "Enable all existing products (actions, lfs, copilot, packages, codespaces, ghec, ghas)", default: false
    method_option :actions, type: :boolean, desc: "Enable actions", default: true
    method_option :git_lfs, type: :boolean, desc: "Enable LFS", default: false
    method_option :copilot, type: :boolean, desc: "Enable Copilot", default: false
    method_option :packages, type: :boolean, desc: "Enable Packages", default: false
    method_option :codespaces, type: :boolean, desc: "Enable Codespaces", default: false
    method_option :ghec, type: :boolean, desc: "Enable GitHub Enterprise Cloud", default: false
    method_option :ghas, type: :boolean, desc: "Enable GitHub Advanced Security", default: false
    def billing_enabled_products
      Seeds::Runner::BillingEnabledProducts.execute(options)
    end

    desc "billing_orgs_vnext", Seeds::Runner::BillingOrgsVNext.help.lines.first
    long_desc Seeds::Runner::BillingOrgsVNext.help
    def billing_orgs_vnext
      Seeds::Runner::BillingOrgsVNext.execute(options)
    end

    desc "zuora_webhooks", Seeds::Runner::ZuoraWebhooks.help.lines.first
    long_desc Seeds::Runner::ZuoraWebhooks.help
    def zuora_webhooks
      Seeds::Runner::ZuoraWebhooks.execute(options)
    end

    desc "ghas_committers", Seeds::Runner::GhasCommitters.help.lines.first
    long_desc Seeds::Runner::GhasCommitters.help
    method_option :reset, type: :boolean, desc: "Delete and recreate owners and usage.", default: false
    method_option :skip_repos, type: :boolean, desc: "Skip restoring repositories.", default: false
    method_option :seats, type: :numeric, desc: "How many GHAS seats to give the business.", default: 100
    def ghas_committers
      Seeds::Runner::GhasCommitters.execute(options)
    end

    desc "ghas_trial", Seeds::Runner::GhasTrial.help.lines.first
    long_desc Seeds::Runner::GhasTrial.help
    method_option :reset, type: :boolean, desc: "Delete and recreate trial organizations.", default: false
    method_option :days, type: :numeric, desc: "Days in trial.", default: 30
    def ghas_trial
      Seeds::Runner::GhasTrial.execute(options)
    end

    desc "sponsors", Seeds::Runner::Sponsors.help.lines.first
    long_desc Seeds::Runner::Sponsors.help
    method_option :add_sponsorships_to, type: :string, desc: "Add sponsorships to a sponsorable (by login)"
    method_option :add_sponsorships_from, type: :string, desc: "Add sponsorships from a sponsor (by login)"
    method_option :count, type: :numeric, desc: "Number of sponsorships to create", default: 1
    method_option :type, type: :string, desc: "Type of sponsorships to create (user or org)", default: "user"
    def sponsors
      Seeds::Runner::Sponsors.execute(options)
    end

    desc "trade_controls", Seeds::Runner::TradeControls.help.lines.first
    long_desc Seeds::Runner::TradeControls.help
    method_option :add_trade_controls_to, type: :string, alias: "-a", desc: "Add trade screening record to a user"
    method_option :screening_status, type: :string, alias: "-s", desc: "Screening status to set for the trade screening record", default: "not_screened"
    method_option :toggle_flags, type: :boolean, alias: "-t", desc: "If trade controls feature flags should be toggled", default: false
    method_option :toggle_flags, aliases: "-t", type: :string, enum: Seeds::Runner::TradeControls::FLAG_TYPES.values, desc: "If trade controls feature flags should be toggled", required: false
    def trade_controls
      Seeds::Runner::TradeControls.execute(options)
    end

    desc "demo_github_app", Seeds::Runner::DemoGitHubApp.help.lines.first
    long_desc Seeds::Runner::DemoGitHubApp.help
    method_option :interactive, type: :boolean, alias: "-w", desc: "an interactive prompt for setting up the app", default: false
    method_option :name, type: :string, alias: "-n", desc: "The name of the app", default: Seeds::Runner::DemoGitHubApp::DEFAULT_NAME
    method_option :port, type: :string, alias: "-p", desc: "The port your app listens on", default: Seeds::Runner::DemoGitHubApp::DEFAULT_PORT
    def demo_github_app
      Seeds::Runner::DemoGitHubApp.execute(options)
    end

    desc "user", Seeds::Runner::Users.help.lines.first
    long_desc Seeds::Runner::Users.help
    method_option :login, type: :string, aliases: "-l", desc: "Login of the user", required: true
    method_option :email, type: :string, aliases: "-e", desc: "Email of the user", required: false
    def user
      Seeds::Runner::Users.execute(options)
    end

    desc "global_advisories", Seeds::Runner::GlobalAdvisories.help.lines.first
    long_desc Seeds::Runner::GlobalAdvisories.help
    def global_advisories
      Seeds::Runner::GlobalAdvisories.execute(options)
    end

    desc "releases", Seeds::Runner::Releases.help.lines.first
    long_desc Seeds::Runner::Releases.help
    method_option :release_count, type: :numeric, desc: "Number of releases to create", default: 1
    method_option :with_package, type: :boolean, desc: "Create a package for the seed", default: false
    def releases
      Seeds::Runner::Releases.execute(options)
    end

    desc "feeds", Seeds::Runner::Feeds.help.lines.first
    long_desc Seeds::Runner::Feeds.help
    # method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use", required: true
    def feeds
      Seeds::Runner::Feeds.execute(options)
    end

    desc "surveys", Seeds::Runner::Surveys.help.lines.first
    long_desc Seeds::Runner::Surveys.help
    method_option :title, type: :string, aliases: "-t", desc: "Title of the Survey", required: true
    method_option :slug, type: :string, aliases: "-s", desc: "Slug of the Survey (also the FeatureFlag)", required: true
    method_option :question_count, type: :numeric, aliases: "-q", desc: "Number of question to create", required: true
    method_option :user_count, type: :numeric, aliases: "-u", desc: "The number of users to create answers for. Default is total number of users in the databse.", required: false
    def surveys
      Seeds::Runner::Surveys.execute(options)
    end

    desc "merge_queue", Seeds::Runner::MergeQueue.help.lines.first
    long_desc Seeds::Runner::MergeQueue.help
    def merge_queue
      Seeds::Runner::MergeQueue.execute(options)
    end

    desc "merge_queue_checks", Seeds::Runner::MergeQueueChecks.help.lines.first
    long_desc Seeds::Runner::MergeQueueChecks.help
    method_option :interactive, type: :boolean, aliases: "-i", desc: "Run interactively", default: false
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repository", required: true
    method_option :name, type: :string, aliases: "-n", desc: "Name for check run"
    method_option :pull_request, type: :numeric, aliases: "-p", desc: "PR number"
    method_option :target, type: :string, aliases: "-t", desc: "Target PR or MQ Groups"
    method_option :status, type: :string, aliases: "-s", desc: "Status of check run"
    def merge_queue_checks
      Seeds::Runner::MergeQueueChecks.execute(options)
    end

    desc "merge_queue_load_test", Seeds::Runner::MergeQueueLoadTest.help.lines.first
    long_desc Seeds::Runner::MergeQueueLoadTest.help
    method_option :target_depth, type: :numeric, aliases: "-d", desc: "Target queue depth", require: true
    method_option :repository, type: :string, aliases: "-r", desc: "Repository to run load test on", require: true
    method_option :required_builds_count, type: :numeric, aliases: "-b", desc: "Number of required builds wanted for this run", require: true
    method_option :verbose, type: :boolean, aliases: "-v", desc: "verbose mode", required: false
    method_option :repo_rules, type: :boolean, desc: "use repo rules instead of branch protections", default: false
    def merge_queue_load_test
      Seeds::Runner::MergeQueueLoadTest.execute(options)
    end

    desc "advanced_security", Seeds::Runner::AdvancedSecurity.help.lines.first
    long_desc Seeds::Runner::AdvancedSecurity.help
    method_option :business_slug, type: :string, desc: "Business slug"
    method_option :create_repo, type: :boolean, desc: "Create a repository", default: true
    method_option :organization_name, type: :string, desc: "Organization name"
    def advanced_security
      Seeds::Runner::AdvancedSecurity.execute(options)
    end

    desc "secret_scanning", Seeds::Runner::SecretScanning.help.lines.first
    long_desc Seeds::Runner::SecretScanning.help
    method_option :name, type: :string, aliases: "-n", desc: "Give custom name to the repository (optional)", required: false
    method_option :repo_path, type: :string, aliases: "-r", desc: "Give path to premade repo (can be local .git folder or remote location)", default: "script/seeds/data/secret_scanning/default.git"
    method_option :organization, type: :boolean, aliases: "-o", desc: "Create an Organization owned repository", default: false
    def secret_scanning
      Seeds::Runner::SecretScanning.execute(options)
    end

    desc "secret_scanning_alert_timeline", Seeds::Runner::SecretScanningAlertTimeline.help.lines.first
    long_desc Seeds::Runner::SecretScanningAlertTimeline.help
    method_option :repo_name, type: :string, aliases: "-r", desc: "Name of the repo", required: false
    method_option :first_alert, type: :numeric, aliases: "-f", desc: "Alert number to begin with. The seed will automatically pick the next n alerts for operations", required: false, default: 1
    def secret_scanning_alert_timeline
      Seeds::Runner::SecretScanningAlertTimeline.execute(options)
    end

    desc "user_lists", Seeds::Runner::UserLists.help.lines.first
    long_desc Seeds::Runner::UserLists.help
    def user_lists
      Seeds::Runner::UserLists.execute(options)
    end

    desc "create_initial_sample_repos", Seeds::Runner::CreateInitialSampleRepos.help.lines.first
    long_desc Seeds::Runner::CreateInitialSampleRepos.help
    def create_initial_sample_repos
      Seeds::Runner::CreateInitialSampleRepos.execute(options)
    end

    desc "default_seeds", Seeds::Runner::DefaultSeeds.help.lines.first
    long_desc Seeds::Runner::DefaultSeeds.help
    def default_seed
      Seeds::Runner::DefaultSeeds.execute(options)
    end

    desc "og_image_app", Seeds::Runner::OgImageApp.help.lines.first
    long_desc Seeds::Runner::OgImageApp.help
    def og_image_app
      Seeds::Runner::OgImageApp.execute(options)
    end

    desc "statuses", Seeds::Runner::Statuses.help.lines.first
    long_desc Seeds::Runner::Statuses.help
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to seed", required: true
    method_option :branch, type: :string, aliases: "-b", desc: "branch of repo to seed"
    method_option :context, type: :string, aliases: "-c", desc: "context for status"
    method_option :state, type: :string, aliases: "-s", desc: "state for status"
    def statuses
      Seeds::Runner::Statuses.execute(options)
    end

    desc "explore_collections", Seeds::Runner::ExploreCollections.help.lines.first
    long_desc Seeds::Runner::ExploreCollections.help
    def explore_collections
      Seeds::Runner::ExploreCollections.execute(options)
    end

    desc "explore_topics", Seeds::Runner::ExploreTopics.help.lines.first
    long_desc Seeds::Runner::ExploreTopics.help
    def explore_topics
      Seeds::Runner::ExploreTopics.execute(options)
    end

    desc "complex_featured_topics", Seeds::Runner::ComplexFeaturedTopics.help.lines.first
    long_desc Seeds::Runner::ComplexFeaturedTopics.help
    method_option :nwo, type: :string, desc: "NWO of repo to add topics to", required: false
    method_option :topics_to_add, type: :numeric, desc: "How many topics to add (Max 20)", required: false, default: 20
    def complex_featured_topics
      Seeds::Runner::ComplexFeaturedTopics.execute(options)
    end

    desc "renderables", Seeds::Runner::Renderables.help.lines.first
    long_desc Seeds::Runner::Renderables.help
    def renderables
      Seeds::Runner::Renderables.execute(options)
    end

    desc "math", Seeds::Runner::Math.help.lines.first
    long_desc Seeds::Runner::Math.help
    def math
      Seeds::Runner::Math.execute(options)
    end

    desc "repo_pull_requests_from_commits", Seeds::Runner::RepoPullRequestsFromCommits.help.lines.first
    method_option :nwo, type: :string, desc: "NWO of repo to use", required: true
    method_option :limit,
      type: :numeric,
      default: 100,
      desc: "How many pull requests to make",
      required: false
    long_desc Seeds::Runner::RepoPullRequestsFromCommits.help
    def repo_pull_requests_from_commits
      Seeds::Runner::RepoPullRequestsFromCommits.execute(options)
    end

    desc "repo_pull_request_reviews", Seeds::Runner::RepoPullRequestReviews.help.lines.first
    method_option :nwo, type: :string, desc: "NWO of repo to use", required: true
    long_desc Seeds::Runner::RepoPullRequestReviews.help
    def repo_pull_request_reviews
      Seeds::Runner::RepoPullRequestReviews.execute(options)
    end

    desc "user_interactions", Seeds::Runner::UserInteractions.help.lines.first
    long_desc Seeds::Runner::UserInteractions.help
    def user_interactions
      Seeds::Runner::UserInteractions.execute(options)
    end

    desc "gist", Seeds::Runner::Gist.help.lines.first
    long_desc Seeds::Runner::Gist.help
    def gist
      Seeds::Runner::Gist.execute(options)
    end

    desc "security_manager", Seeds::Runner::SecurityManager.help.lines.first
    long_desc Seeds::Runner::SecurityManager.help
    method_option :organization_name, type: :string, desc: "Organization name"
    def security_manager
      Seeds::Runner::SecurityManager.execute(options)
    end

    desc "achievements", Seeds::Runner::Achievements.help.lines.first
    long_desc Seeds::Runner::Achievements.help
    method_option :user, type: :string, aliases: "-u", desc: "User to grant achievements", default: "monalisa"
    method_option :achievement, type: :array, aliases: "-a",
      desc: "Achievement(s) to grant, by substring of slug",
      default: %w(all)
    method_option :tier, type: :numeric, aliases: "-t",
      desc: "Tier to grant when applicable (zero-indexed)",
      default: 0
    method_option :private_only, type: :boolean, desc: "Grant only private-contribution achievements", default: false
    def achievements
      Seeds::Runner::Achievements.execute(options)
    end

    desc "pull_requests", Seeds::Runner::PullRequests.help.lines.first
    long_desc Seeds::Runner::PullRequests.help
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of PR base repo", required: false
    method_option :author, type: :string, aliases: "-u", desc: "Login of PR author", default: Seeds::Runner::PullRequests::DEFAULT_AUTHOR, required: false
    method_option :reviewers, type: :array, aliases: "-v", desc: "Logins of PR reviewers", default: Seeds::Runner::PullRequests::DEFAULT_REVIEWERS, required: false
    method_option :num_drafts, type: :numeric, aliases: "-d", desc: "Number of draft PRs", default: Seeds::Runner::PullRequests::DEFAULT_NUM_DRAFTS, required: false
    method_option :num_comments, type: :numeric, aliases: "-c", desc: "Number of comments in first, second, and third PRs", default: Seeds::Objects::Commit::DEFAULT_NUM_RANDOM_COMMITS, required: false
    method_option :num_commits, type: :numeric, aliases: "-m", desc: "Number of commits in fourth PR", default: Seeds::Objects::Commit::DEFAULT_NUM_RANDOM_COMMITS, required: false
    method_option :num_files_changed, type: :numeric, aliases: "-n", desc: "Number of files changed in third PR", default: Seeds::Runner::PullRequests::DEFAULT_NUM_FILES_CHANGED, required: false
    def pull_requests
      Seeds::Runner::PullRequests.execute(options)
    end

    desc "pull_request_annotations", Seeds::Runner::PullRequestAnnotations.help.lines.first
    long_desc Seeds::Runner::PullRequestAnnotations.help
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of PR base repo", required: false
    method_option :author, type: :string, aliases: "-u", desc: "Login of PR author", default: Seeds::Runner::PullRequests::DEFAULT_AUTHOR, required: false
    def pull_request_annotations
      Seeds::Runner::PullRequestAnnotations.execute(options)
    end

    desc "pull_request_reviews", Seeds::Runner::PullRequestReviews.help.lines.first
    long_desc Seeds::Runner::PullRequestReviews.help
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of PR base repo", required: false
    method_option :author, type: :string, aliases: "-u", desc: "Login of PR author", default: Seeds::Runner::PullRequestReviews::DEFAULT_AUTHOR, required: false
    method_option :user_reviewers, type: :array, aliases: "-v", desc: "Reviewer user logins", default: Seeds::Runner::PullRequestReviews::DEFAULT_USERS, required: false
    method_option :team_reviewers, type: :array, aliases: "-t", desc: "Reviewer team names of reviewers", default: Seeds::Runner::PullRequestReviews::DEFAULT_TEAMS, required: false
    def pull_request_reviews
      Seeds::Runner::PullRequestReviews.execute(options)
    end

    desc "enterprise_users", Seeds::Runner::EnterpriseUsers.help.lines.first
    long_desc Seeds::Runner::EnterpriseUsers.help
    method_option :enterprise_installation, type: :boolean, aliases: "-e", desc: "Create an enterprise with enterprise installations. Defaults to using GitHub Inc, with enterprise installations included.", required: false
    method_option :vss_bundle, type: :boolean, aliases: "-v", desc: "Create an enterprise with VSS bundle attached. Defaults to using GitHub Inc, with VSS Bundle included.", required: false
    method_option :standalone_business, type: :boolean, aliases: "-s", desc: "Use a standalone business without enterprise installations or VSS bundles.", required: false
    method_option :standalone_organization, type: :string, aliases: "-o", desc: "Create users in a standalone organization, without a business. Must supply an org name. This is a WIP.", required: false
    method_option :org_members, type: :numeric, aliases: "-m", desc: "Number of org members to create.", default: 1, required: false
    method_option :suspended_users, type: :numeric, desc: "Number of suspended users to create.", default: 1, required: false
    method_option :outside_collaborators, type: :numeric, desc: "Number of outside collaborators to create.", default: 1, required: false
    method_option :failed_invites, type: :numeric, desc: "Number of failed invitations to create.", default: 1, required: false
    method_option :invites, type: :numeric, desc: "Number of non-business users to create with business invitations.", default: 1, required: false
    def enterprise_users
      Seeds::Runner::EnterpriseUsers.execute(options)
    end

    desc "basic_enterprise_account", Seeds::Runner::BasicEnterpriseAccount.help.lines.first
    long_desc Seeds::Runner::BasicEnterpriseAccount.help
    def basic_enterprise_account
      Seeds::Runner::BasicEnterpriseAccount.execute(options)
    end

    desc "sso_identity_codespace", Seeds::Runner::SsoIdentityCodespace.help.lines.first
    long_desc Seeds::Runner::SsoIdentityCodespace.help
    method_option :no_scim, type: :boolean, aliases: "-n", desc: "Do not provision users via SCIM, rely on SAML JIT instead", default: false
    def sso_identity_codespace
      Seeds::Runner::SsoIdentityCodespace.execute(options)
    end

    desc "organization_programmatic_access", Seeds::Runner::OrganizationProgrammaticAccess.help.lines.first
    long_desc Seeds::Runner::OrganizationProgrammaticAccess.help
    method_option :user, type: :string, aliases: "-u", desc: "User login, defaults to monalisa", required: false
    method_option :target, type: :string, aliases: "-t", desc: "Target login, defaults to github", required: false
    method_option :name, type: :string, aliases: "-n", desc: "Token name", required: false
    def organization_programmatic_access
      Seeds::Runner::OrganizationProgrammaticAccess.execute(options)
    end

    desc "sponsors_explore", Seeds::Runner::SponsorsExplore.help.lines.first
    long_desc Seeds::Runner::SponsorsExplore.help
    method_option :user_count, type: :numeric, aliases: "-u", desc: "How many sponsorable users to make",
      required: false
    method_option :org_count, type: :numeric, aliases: "-o", desc: "How many sponsorable organizations to make",
      required: false
    method_option :repo_count, type: :numeric, aliases: "-r",
      desc: "How many public repositories to make for each user and org", required: false
    def sponsors_explore
      Seeds::Runner::SponsorsExplore.execute(options)
    end

    desc "feature_flags", Seeds::Runner::FeatureFlags.help.lines.first
    long_desc Seeds::Runner::FeatureFlags.help
    method_option :name, type: :string, aliases: "-n", desc: "Name of the feature", required: true
    method_option :service_name, type: :string, aliases: "-s", desc: "Name of the feature's owning service", required: false
    def feature_flags
      Seeds::Runner::FeatureFlags.execute(options)
    end

    desc "mobile_tokens", Seeds::Runner::MobileTokens.help.lines.first
    long_desc Seeds::Runner::MobileTokens.help
    method_option :clean, type: :boolean, aliases: "-c", desc: "Destroy and recreate existing mobile apps and access tokens", required: false
    method_option :user, type: :string, aliases: "-u", desc: "User login to create a mobile token for. Creates a user if the login doesn't exist. Defaults to monalisa", required: false
    def mobile_tokens
      Seeds::Runner::MobileTokens.execute(options)
    end

    desc "pull_request_syntax_highlighting", Seeds::Runner::PullRequestSyntaxHighlighting.help.lines.first
    long_desc Seeds::Runner::PullRequestSyntaxHighlighting.help
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of PR base repo", default: Seeds::Runner::PullRequestSyntaxHighlighting::DEFAULT_NWO
    method_option :author, type: :string, aliases: "-u", desc: "Login of PR author", default: Seeds::Runner::PullRequestSyntaxHighlighting::DEFAULT_USER_NAME
    def pull_request_syntax_highlighting
      Seeds::Runner::PullRequestSyntaxHighlighting.execute(options)
    end

    desc "pages_repos_codespaces", Seeds::Runner::PagesReposCodespaces.help.lines.first
    long_desc Seeds::Runner::PagesReposCodespaces.help
    def pages_repos_codespaces
      Seeds::Runner::PagesReposCodespaces.execute(options)
    end

    desc "web_notifications", Seeds::Runner::WebNotifications.help.lines.first
    long_desc Seeds::Runner::WebNotifications.help
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use", default: Seeds::Runner::WebNotifications::DEFAULT_NWO
    method_option :user, type: :string, aliases: "-u", desc: "Login of notified user", default: Seeds::Runner::WebNotifications::DEFAULT_USER_NAME
    method_option :issue_notification_count, type: :numeric, desc: "Number of issue notifications to create", default: Seeds::Runner::WebNotifications::DEFAULT_ISSUE_NOTIFICATION_COUNT
    method_option :pr_notification_count, type: :numeric, desc: "Number of PR notifications to create", default: Seeds::Runner::WebNotifications::DEFAULT_PR_NOTIFICATION_COUNT
    method_option :discussion_notification_count, type: :numeric, desc: "Number of discussion notifications to create", default: Seeds::Runner::WebNotifications::DEFAULT_DISCUSSION_NOTIFICATION_COUNT
    def web_notifications
      Seeds::Runner::WebNotifications.execute(options)
    end

    desc "notifications", Seeds::Runner::Notifications.help.lines.first
    long_desc Seeds::Runner::Notifications.help
    def notifications
      Seeds::Runner::Notifications.execute(options)
    end

    desc "gate_requests", Seeds::Runner::GateRequests.help.lines.first
    long_desc Seeds::Runner::GateRequests.help
    def gate_requests
      Seeds::Runner::GateRequests.execute(options)
    end

    desc "vulnerabilities", Seeds::Runner::Vulnerabilities.help.lines.first
    long_desc Seeds::Runner::Vulnerabilities.help
    def vulnerabilities
      Seeds::Runner::Vulnerabilities.execute(options)
    end

    desc "hyperlist_web", Seeds::Runner::IssuesReact.help.lines.first
    long_desc Seeds::Runner::IssuesReact.help
    method_option :seed, type: :numeric, desc: "Random seed", default: 0
    method_option :tiny, type: :boolean, aliases: "-t", desc: "Create a tiny dataset", default: false
    method_option :small, type: :boolean, aliases: "-s", desc: "Create a small dataset", default: false
    method_option :medium, type: :boolean, aliases: "-m", desc: "Create a medium dataset", default: false
    method_option :large, type: :boolean, aliases: "-l", desc: "Create a large dataset", default: false
    def hyperlist_web
      Seeds::Runner::IssuesReact.execute(options)
    end

    desc "billing_product_uuids", Seeds::Runner::BillingProductUUIDs.help.lines.first
    long_desc Seeds::Runner::BillingProductUUIDs.help
    method_option :product_type, type: :string, enum: Seeds::Runner::BillingProductUUIDs::PRODUCT_TYPES.values, desc: "Product type to create.", required: true
    def billing_product_uuids
      Seeds::Runner::BillingProductUUIDs.execute(options)
    end

    desc "run_test_framework", Seeds::Runner::RunTestFramework.help.lines.first
    long_desc Seeds::Runner::RunTestFramework.help
    def run_test_framework
      Seeds::Runner::RunTestFramework.execute(options)
    end

    desc "repo_advisory", Seeds::Runner::RepoAdvisory.help.lines.first
    long_desc Seeds::Runner::RepoAdvisory.help
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use", default: Seeds::Runner::RepoAdvisory::DEFAULT_USER_NWO
    method_option :user, type: :string, aliases: "-u", desc: "Login of advisory author", default: Seeds::Runner::RepoAdvisory::DEFAULT_USER_NAME
    method_option :package, type: :string, aliases: "-p", desc: "Name of affected package", default: Seeds::Runner::RepoAdvisory::DEFAULT_PACKAGE_NAME
    method_option :ecosystem, type: :string, aliases: "-e", desc: "Name of affected ecosystem", default: Seeds::Runner::RepoAdvisory::DEFAULT_ECOSYSTEM_NAME
    method_option :versions, type: :string, aliases: "-v", desc: "Name of affected versions", default: Seeds::Runner::RepoAdvisory::DEFAULT_AFFECTED_VERSIONS
    method_option :published, type: :boolean, desc: "Publish the advisory", default: false
    method_option :innersource, type: :boolean, desc: "Create innersource advisory", default: false
    def repo_advisory
      Seeds::Runner::RepoAdvisory.execute(options)
    end

    desc "repos", Seeds::Runner::Repos.help.lines.first
    long_desc Seeds::Runner::Repos.help
    method_option :force, type: :boolean, aliases: "-f", desc: "Remove repo if exists", default: false
    def repos
      Seeds::Runner::Repos.execute(options)
    end

    desc "sponsors_popular", Seeds::Runner::SponsorsPopular.help.lines.first
    long_desc Seeds::Runner::SponsorsPopular.help
    method_option :active_sponsorships, type: :numeric, aliases: "-a", desc: "Number of current sponsorships to create", required: false
    method_option :past_sponsorships, type: :numeric, aliases: "-p", desc: "Number of past sponsorships to create", required: false
    method_option :blocked_sponsorships, type: :numeric, aliases: "-b", desc: "Number of blocked sponsorships to create", required: false
    def sponsors_popular
      Seeds::Runner::SponsorsPopular.execute(options)
    end

    desc "issues_for_repo", Seeds::Runner::IssuesForRepo.help.lines.first
    long_desc Seeds::Runner::IssuesForRepo.help
    method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use.", required: true
    method_option :count, type: :numeric, aliases: "-c", desc: "Number of issues to create.", required: false, default: Seeds::Runner::IssuesForRepo::DEFAULT_ISSUE_COUNT
    method_option :labels, type: :string, aliases: "-l", desc: "Comma delimited list of label names.", required: false
    method_option :seed, type: :string, aliases: "-s", desc: "Random seed.", required: false
    method_option :issue_comment_max, type: :numeric, desc: "Maximum number of comments per issue.", required: false, default: Seeds::Runner::IssuesForRepo::DEFAULT_ISSUE_COMMENT_MAX
    method_option :commit_reference_max, type: :numeric, desc: "Maximum number of comit references per issue.", required: false, default: Seeds::Runner::IssuesForRepo::DEFAULT_COMMIT_REFERENCE_MAX
    method_option :linked_issue_max, type: :numeric, desc: "Maximum number of linked issues.", required: false, default: Seeds::Runner::IssuesForRepo::DEFAULT_LINKED_ISSUE_MAX
    def issues_for_repo
      Seeds::Runner::IssuesForRepo.execute(options)
    end

    desc "team_repos_pilot", Seeds::Runner::TeamReposPilot.help.lines.first
    long_desc Seeds::Runner::TeamReposPilot.help
    method_option :commit_count, type: :numeric, aliases: "-c", desc: "Exact number of commits to generate per repo", default: 0
    method_option :discussion_count, type: :numeric, aliases: "-d", desc: "Exact number of discussions to generate per repo", default: Seeds::Runner::TeamReposPilot::DEFAULT_DISCUSSION_COUNT
    method_option :label_count, type: :numeric, aliases: "-l", desc: "Number labels to create for each repo.", required: false, default: Seeds::Runner::TeamReposPilot::DEFAULT_LABEL_COUNT
    method_option :issue_count, type: :numeric, aliases: "-i", desc: "Number of issues to create.", required: false, default: Seeds::Runner::TeamReposPilot::DEFAULT_ISSUE_COUNT
    method_option :issue_comment_max, type: :numeric, aliases: "-m", desc: "Maximum number of comments per issue.", required: false, default: nil
    method_option :issue_commit_reference_max, type: :numeric, aliases: "-n", desc: "Maximum number of comit references per issue.", required: false, default: nil
    method_option :issue_linked_max, type: :numeric, aliases: "-o", desc: "Maximum number of linked issues.", required: false, default: nil
    method_option :pr_count, type: :numeric, aliases: "-p", desc: "Number of PRs to create.", required: false, default: Seeds::Runner::TeamReposPilot::DEFAULT_PR_COUNT
    method_option :seed, type: :string, aliases: "-s", desc: "Random seed.", required: false
    method_option :topic_count, type: :numeric, aliases: "-t", desc: "Number topics to add to each repo.", required: false, default: Seeds::Runner::TeamReposPilot::DEFAULT_TOPIC_COUNT
    def team_repos_pilot
      Seeds::Runner::TeamReposPilot.execute(options)
    end

    desc "generate_labels", Seeds::Runner::GenerateLabels.help.lines.first
    method_option :nwo, type: :string, desc: "NWO of repo to use.", required: true
    method_option :label_count, type: :numeric, desc: "Number of labels to generate", required: true
    long_desc Seeds::Runner::GenerateLabels.help
    def generate_labels
      Seeds::Runner::GenerateLabels.execute(options)
    end

    desc "billing_transactions", Seeds::Runner::BillingTransactions.help.lines.first
    long_desc Seeds::Runner::BillingTransactions.help
    def billing_transactions
      Seeds::Runner::BillingTransactions.execute(options)
    end

    desc "ghes_actions_job_execution", Seeds::Runner::GhesActionsJobExecution.help.lines.first
    long_desc Seeds::Runner::GhesActionsJobExecution.help
    method_option :days, type: :numeric, aliases: "-d", desc: "# of days to create records for", default: 1
    method_option :executions_per_day, type: :numeric, aliases: "-e", desc: "# of records to create per day", default: 100
    def ghes_actions_job_execution
      Seeds::Runner::GhesActionsJobExecution.execute(options)
    end

    desc "custom_properties", Seeds::Runner::CustomProperties.help.lines.first
    long_desc Seeds::Runner::CustomProperties.help
    method_option :repos_count, type: :numeric, aliases: "-n", desc: "Number of repos to create, defaults to 100", required: false
    def custom_properties
      Seeds::Runner::CustomProperties.execute(options)
    end

    desc "group_settings", Seeds::Runner::GroupSettings.help.lines.first
    long_desc Seeds::Runner::GroupSettings.help
    method_option :repos_count, type: :numeric, aliases: "-n", desc: "Number of repos to create, defaults to 100", required: false
    def group_settings
      Seeds::Runner::GroupSettings.execute(options)
    end

    desc "sample_orgs", Seeds::Runner::SampleOrgs.help.lines.first
    long_desc Seeds::Runner::SampleOrgs.help
    method_option :count, type: :numeric, aliases: "-n", desc: "Number of orgs to create of each type", default: 2
    def sample_orgs
      Seeds::Runner::SampleOrgs.execute(options)
    end

    desc "classroom", Seeds::Runner::Classroom.help.lines.first
    long_desc Seeds::Runner::Classroom.help
    # method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use", required: true
    def classroom
      Seeds::Runner::Classroom.execute(options)
    end

    desc "request_a_feature", Seeds::Runner::RequestAFeature.help.lines.first
    long_desc Seeds::Runner::RequestAFeature.help
    method_option :org_name, type: :string, aliases: "-o", desc: "Org name to use", required: false, default: "request-a-feature-org"
    method_option :user_count, type: :numeric, aliases: "-n", desc: "Number of users for the org", required: false, default: 5
    method_option :plan, type: :string, aliases: "-p", desc: "Plan name for the org", required: false, default: "free"
    method_option :timestamp, type: :string, aliases: "-t", desc: "Timestamp to be used for creating the requests", required: false, default: "Time.current"
    method_option :notifications, type: :boolean, aliases: "-x", desc: "Notifications for the requests", required: false, default: false
    method_option :enterprise, type: :boolean, aliases: "-e", desc: "Creates a business and a few notifications", required: false, default: false
    def request_a_feature
      Seeds::Runner::RequestAFeature.execute(options)
    end

    desc "complete_enterprise_account", Seeds::Runner::CompleteEnterpriseAccount.help.lines.first
    long_desc Seeds::Runner::CompleteEnterpriseAccount.help
    method_option :business_type, type: :string, aliases: "-t", desc: "Business type", required: true, default: "self_serve_business_monthly"
    method_option :reset, type: :boolean, desc: "Delete and recreate enterprise", default: true
    method_option :organization_count, type: :numeric, aliases: "-c", desc: "Number of organizations to create", default: 2
    method_option :shared_users, type: :boolean, aliases: "-su", desc: "Create shared users for the orgs (1 member and 1 admin)", default: true
    method_option :repositories, type: :boolean, aliases: "-r", desc: "Create 2 repos for each org (1 private and 1 public)", default: true
    method_option :business_invitations, type: :boolean, aliases: "-bi", desc: "Create 2 invitations for the business (1 owner and 1 billing manager)", default: true
    method_option :organization_invitations, type: :boolean, aliases: "-oi", desc: "Create 2 invitations for the organizations (1 owner and 1 billing manager)", default: true
    def complete_enterprise_account
      Seeds::Runner::CompleteEnterpriseAccount.execute(options)
    end

    desc "organization_roles", Seeds::Runner::OrganizationRoles.help.lines.first
    long_desc Seeds::Runner::OrganizationRoles.help
    # method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use", required: true
    def organization_roles
      Seeds::Runner::OrganizationRoles.execute(options)
    end

    desc "sample_repos", Seeds::Runner::SampleRepos.help.lines.first
    long_desc Seeds::Runner::SampleRepos.help
    method_option :count, type: :numeric, aliases: "-n", desc: "Number of repos to create", default: 10
    method_option :org, type: :string, aliases: "-o", desc: "Org owning repos", default: "github"
    def sample_repos
      Seeds::Runner::SampleRepos.execute(options)
    end

    desc "contribution_graph", Seeds::Runner::ContributionGraph.help.lines.first
    long_desc Seeds::Runner::ContributionGraph.help
    method_option :number_of_days, type: :numeric, aliases: "-n", desc: "the number of days to seed with commits", default: 365
    method_option :public, type: :boolean, aliases: "-p", desc: "whether the commits should be public or private", default: true
    def contribution_graph
      Seeds::Runner::ContributionGraph.execute(options)
    end

    desc "security_overview_analytics", Seeds::Runner::SecurityOverviewAnalytics.help.lines.first
    long_desc Seeds::Runner::SecurityOverviewAnalytics.help
    method_option :business_slug, type: :string, desc: "Business slug", required: false
    method_option :owner_slug, type: :string, desc: "User/Org slug", required: false
    method_option :alerts_per_repository, type: :numeric, desc: "Total number of alerts per repository", required: false, default: 100
    method_option :skip_initialization, type: :boolean, desc: "Skip SOA data reset", required: false, default: false
    method_option :repositories_per_owner, type: :numeric, desc: "Total number of repositories to create", required: false, default: 10
    def security_overview_analytics
      Seeds::Runner::SecurityOverviewAnalytics.execute(options)
    end

    desc "security_overview_analytics_enterprise", Seeds::Runner::SecurityOverviewAnalytics.help.lines.first
    long_desc Seeds::Runner::SecurityOverviewAnalyticsEnterprise.help
    method_option :business_slug, type: :string, desc: "Business slug", required: false
    method_option :alerts_per_repository, type: :numeric, desc: "Total number of alerts per repository", required: false, default: 10
    method_option :organizations, type: :numeric, desc: "Total number of organizations to create", required: false, default: 10
    method_option :users, type: :numeric, desc: "Total number of users to create", required: false, default: 10
    method_option :repositories_per_owner, type: :numeric, desc: "Total number of repositories to create per owner", required: false, default: 10
    def security_overview_analytics_enterprise
      Seeds::Runner::SecurityOverviewAnalyticsEnterprise.execute(options)
    end

    desc "marketing", Seeds::Runner::Marketing.help.lines.first
    long_desc Seeds::Runner::Marketing.help
    def marketing
      Seeds::Runner::Marketing.execute(options)
    end

    desc "copilot4prs", Seeds::Runner::Copilot4prs.help.lines.first
    long_desc Seeds::Runner::Copilot4prs.help
    # method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use", required: true
    def copilot4prs
      Seeds::Runner::Copilot4prs.execute(options)
    end

    desc "proxima_service_identity", Seeds::Runner::ProximaServiceIdentity.help.lines.first
    long_desc Seeds::Runner::ProximaServiceIdentity.help
    def proxima_service_identity
      Seeds::Runner::ProximaServiceIdentity.execute(options)
    end

    desc "copilot_summaries", Seeds::Runner::CopilotSummaries.help.lines.first
    long_desc Seeds::Runner::CopilotSummaries.help
    def copilot_summaries
      Seeds::Runner::CopilotSummaries.execute(options)
    end

    desc "ghes", Seeds::Runner::Ghes.help.lines.first
    method_option :debug, type: :boolean, aliases: "-d", desc: "Enable debug logging", default: false
    method_option :organizations, type: :numeric, aliases: "-o", desc: "Number of organizations to create", default: 1
    method_option :users, type: :numeric, aliases: "-u", desc: "Number of users to create", default: 1
    method_option :repositories_per_organization, type: :numeric, aliases: "-ro", desc: "Number of repositories to create for each organization", default: 1
    method_option :repositories_per_user, type: :numeric, aliases: "-ru", desc: "Number of repositories to create for each user", default: 1
    method_option :labels_per_repository, type: :numeric, aliases: "-l", desc: "Number of labels to create for each repository", default: 1
    method_option :commits_per_repository, type: :numeric, aliases: "-c", desc: "Number of commits to create for each repository", default: 1
    method_option :issues_per_repository, type: :numeric, aliases: "-i", desc: "Number of issues to create for each repository", default: 1
    method_option :pull_requests_per_repository, type: :numeric, aliases: "-p", desc: "Number of pull requests to create for each repository", default: 1
    method_option :comments_per_issue, type: :numeric, aliases: "-ci", desc: "Number of comments to create for each issue", default: 1
    method_option :reviews_per_pull_request, type: :numeric, aliases: "-rpr", desc: "Number of reviews to create for each pull request", default: 1
    method_option :review_comments_per_pull_request, type: :numeric, aliases: "-rc", desc: "Number of review comments to create for each pull request", default: 1
    method_option :refs_per_repository, type: :numeric, aliases: "-rf", desc: "Number of refs to create for repository", default: 1
    method_option :gists_per_user, type: :numeric, aliases: "-g", desc: "Number of gists to create for each user", default: 1
    method_option :comments_per_gist, type: :numeric, aliases: "-cg", desc: "Number of comments to create for each gist", default: 1
    method_option :memex_projects, type: :numeric, aliases: "-mp", desc: "Number of memex projects to create", default: 1
    method_option :memex_project_columns, type: :numeric, aliases: "-mpc", desc: "Number of memex project columns to create", default: 1
    method_option :memex_project_items, type: :numeric, aliases: "-mpi", desc: "Number of memex project items to create of each type", default: 1
    method_option :milestones_per_repository, type: :numeric, aliases: "-m", desc: "Number of milestones to create for each repository", default: 1
    method_option :issue_links, type: :numeric, aliases: "-il", desc: "Number of issue links to create for each issue", default: 1
    method_option :issue_types, type: :numeric, aliases: "-it", desc: "Number of issue types to create for each issue", default: 1

    long_desc Seeds::Runner::Ghes.help
    def ghes
      Seeds::Runner::Ghes.execute(options)
    end

    desc "console", "start a console with seeds objects and runners loaded"
    method_option :factory_bot, type: :boolean, desc: "Extend console with Factory Bot methods.", default: true
    def console
      Seeds::Runner.setup
      if options[:factory_bot]
        puts "Loading factory bot methods"

        # Sham is a legacy from the use of Machinist and is slated for retirement but needed today by the user-factory
        sham = Rails.root.join("test/test_helpers/sham.rb")
        require sham if File.exist?(sham)

        # We need to load some dependencies as we include UserTestHelpers in FactoryBot::SyntaxRunner for some
        # user-factory things and also include FactoryBot::Syntax::Methods in Minitest::Test to do the same thing
        # we're doing here :-)
        require "minitest"
        require Rails.root.join("test/test_helpers/user_test_helpers.rb")
        require Rails.root.join("test/test_helpers/factory_bot.rb")

        # HACK eagerly load user schema to avoid conflict (see https://github.com/github/github/issues/234469)
        Platform::Schema::get_type("User")

        # And finally we extend the console with `build`, `create`, etc.
        eval("include FactoryBot::Syntax::Methods", TOPLEVEL_BINDING)
      end
      # Remove options so starting the console doesn't error out with an unknown option
      ARGV.delete("--factory-bot")
      ARGV.delete("--no-factory-bot")

      load Rails.root.join("script/console")
    end

    desc "generate NAME", "generate a new runner or object"
    method_option :type, type: :string, enum: %w(runner object), default: "runner"
    def generate(name)
      Seeds::Runner::Generate.run(name, options) # Don't use execute so we don't run setup
    end

    desc "memex_project_issue_events", Seeds::Runner::MemexProjectIssueEvents.help.lines.first
    long_desc Seeds::Runner::MemexProjectIssueEvents.help
    def memex_project_issue_events
      Seeds::Runner::MemexProjectIssueEvents.execute(options)
    end

    desc "ghes_licenses", Seeds::Runner::GhesLicenses.help.lines.first
    long_desc Seeds::Runner::GhesLicenses.help
    method_option :business_id, type: :numeric, aliases: "-i", desc: "Business the license will be created for", required: true
    def ghes_licenses
      Seeds::Runner::GhesLicenses.execute(options)
    end

    desc "milestones", Seeds::Runner::Milestones.help.lines.first
    long_desc Seeds::Runner::Milestones.help
    method_option :repo_name, type: :string, desc: "Name of the repo", required: true, default: "github/hub"
    method_option :milestone_count, type: :numeric, desc: "Number of milestones", required: true, default: 10
    def milestones
      Seeds::Runner::Milestones.execute(options)
    end

    desc "delegated_bypass", Seeds::Runner::DelegatedBypass.help.lines.first
    long_desc Seeds::Runner::DelegatedBypass.help
    method_option :force, type: :boolean, aliases: "-f", desc: "Remove repo and org if exists", default: false
    method_option :multiple, type: :boolean, aliases: "-m", desc: "Setup multiple rulesets for multi approval", default: false
    def delegated_bypass
      Seeds::Runner::DelegatedBypass.execute(options)
    end

    desc "proxima_third_party_apps", Seeds::Runner::ProximaThirdPartyApps.help.lines.first
    long_desc Seeds::Runner::ProximaThirdPartyApps.help
    def proxima_third_party_app
      Seeds::Runner::ProximaThirdPartyApps.execute(options)
    end

    desc "hadron", Seeds::Runner::Hadron.help.lines.first
    long_desc Seeds::Runner::Hadron.help
    def hadron
      Seeds::Runner::Hadron.execute(options)
    end
  end
end
