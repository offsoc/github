# frozen_string_literal: true

namespace :enterprise do
  # Tasks related to Enterprise instance configuration runs.
  # Configuration happens after changes are made in enterprise-manage.
  namespace :configuration do
    # This task is run once the configuration run has finished.
    task :run => :environment do
      # The second argument is the user id to search.
      # `nil` means "all users".
      LdapUserSyncJob.perform_later if LdapUserSyncJob.enabled?
    end
  end

  # A utility task to provide a simple way to expire all sessions.
  # Changing authentication modes should expire all existing sessions
  task :expire_sessions => :environment do
    UserSession.revoke_all(:logout)
  end

  # Disable 2FA on the global business and any orgs if needed.
  task :disable_two_factor_requirement => :environment do
    if GitHub.enterprise? && !GitHub.auth.two_factor_org_requirement_allowed?
      DisableTwoFactorRequirementJob.perform_now
    end
  end

  desc "Create required users for GitHub Enterprise environment"
  task :create_required_users => :environment do
    abort "This should only be used in GitHub Enterprise." unless GitHub.single_or_multi_tenant_enterprise?
    User.create_ghost

    github_enterprise = Organization.find_by(login: "github-enterprise")
    unless github_enterprise.present?
      ApplicationRecord::Domain::Users.connection.insert(Arel.sql(<<-SQL))
        INSERT IGNORE INTO users (`login`, `plan`, `type`, `organization_billing_email`, `created_at`) VALUES ("github-enterprise", "free", "Organization", "ghost-org@github.com", NOW());
      SQL
    end
  end

  desc "Reconcile fine grained system roles."
  task :setup_fine_grained_permissions => :environment do
    abort "This should only be used in GitHub Enterprise." unless GitHub.single_or_multi_tenant_enterprise?
    GitHub.system_roles.reconcile(purge: true)
  end
end
