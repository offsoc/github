# frozen_string_literal: true
desc "Reset to pristine state, wiping existing DB and repo storage"
task :setup => [
  "repos:setup",
  "db:drop", "db:setup", "es:reset", "es:test:prepare",
  "db:add_initial_admins", "db:ghost", "db:staff_user", "db:create_org",
  "db:setup_global_business", "db:setup_internal_apps", "db:migrate_only",
  "db:team_subscriptions_backfill", "db:test:prepare"
]

# Run instead of setup when the database has already been prep'd but we're
# switching between runtime modes.
task "setup:update" => ["db:ghost", "db:setup_global_business",
  "db:setup_internal_apps", "db:migrate_only", "db:test:prepare"]

# Aliases for backward compatibility with docs
task "setup:default" => :setup
task :bootstrap => :setup

namespace :db do
  # depend on this task to protect against running in production envs
  task :protect do
    if %w[production staging].include?(Rails.env)
      fail "refusing to run in production environment" unless GitHub.single_or_multi_tenant_enterprise?
    end
  end

  desc "Create the database, load the schema and seed data"
  task :setup => [:protect, "cache:flush"]

  desc "Add owners team to organizations"
  task :add_initial_admins => :environment do
    Organization.all.each(&:add_initial_admins)
  end

  desc "Migrate the database but don't dump schema.rb"
  task :migrate_only => :environment do
    ActiveRecord::Migration.verbose = ENV["VERBOSE"] ? ENV["VERBOSE"] == "true" : true

    ActiveRecord::Base.connection_pool.migration_context.migrate(ENV["VERSION"] ? ENV["VERSION"].to_i : nil) # rubocop:disable GitHub/DoNotCallMethodsOnActiveRecordBase
  end

  desc "Create the ghost user"
  task :ghost => [:protect, :environment] do
    User.create_ghost
  end

  desc "Create staff user"
  task :staff_user => [:protect, :environment] do
    User.create_staff_user if GitHub.guard_audit_log_staff_actor?
  end

  desc "create trusted org for oauth apps."
  task :create_org => [:environment, :ghost] do
    if GitHub.enterprise?
      GitHub.stratocaster.disable

      org = GitHub.trusted_oauth_apps_owner
      unless org
        Organization.create_trusted_oauth_apps_owner
      end
    end
  end

  desc "Set up internal apps for enterprise environment in development"
  task setup_internal_apps: [:create_org] do
    next unless GitHub.enterprise?
    next if Rails.env.production?

    Rake::Task["enterprise:merge_queue:create"].execute
  end

  desc "Set up global business for single business environment in development"
  task setup_global_business: [:environment] do
    next unless GitHub.single_business_environment?
    next if Rails.env.production?

    puts "Setting up global business"
    Rake::Task["business:create"].execute

    puts "Adding admins and organizations to global business"

    admins = User.where \
      "login <> ? AND type = 'User' AND gh_role = 'staff'",
      [GitHub.ghost_user_login]
    admins.each do |admin|
      GitHub.global_business.add_owner(admin, actor: nil)
    end

    orgs = Organization.where \
      "login <> ?", [GitHub.trusted_oauth_apps_org_name]
    orgs.each do |org|
      GitHub.global_business.add_organization org
    end
  end

  desc "Backfill Team subscriptions"
  task :team_subscriptions_backfill => [:protect, :environment] do
    require "github/transitions/20171106193137_move_team_subscriptions_into_newsies"
    puts "Backfilling Team subscriptions"
    GitHub::Transitions::MoveTeamSubscriptionsIntoNewsies.new(dry_run: false).perform
  end

  Rake::Task["migrate"].enhance do
    Rake::Task["db:seed"].invoke
  end
end
