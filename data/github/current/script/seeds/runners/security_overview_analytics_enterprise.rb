# typed: true
# frozen_string_literal: true

require_relative "../runner"

# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SecurityOverviewAnalyticsEnterprise < Seeds::Runner
      def self.help
        <<~HELP
        Create enterprise organizations, users and repos with seeded alert revisions for Security Overview Analytics development
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"
        require "ruby-progressbar"
        user = Seeds::Objects::User.monalisa
        business = options[:business_slug] ? ::Business.find_by(slug: options[:business_slug]) : Seeds::Objects::Business.github

        if business.nil?
          # Using slug as name for business
          business = Seeds::Objects::Business.create(name: options[:business_slug], owner: user)
        end

        organizations = options[:organizations]
        # Make sure business has at least specified number of orgs
        until business.organizations.count >= organizations do
          org = Seeds::Objects::Organization.create(login: Seeds::DataHelper.random_company_slug, admin: user)
          org.update!(business: business)
        end

        users = options[:users]
        # Make sure business has at least specified number of users
        new_user_ids = []
        until business.admin_and_organization_member_ids.count >= users do
          newuser = Seeds::Objects::User.create(login: Seeds::DataHelper.random_username)
          # Adding as owner bypasses the invite process
          business.add_owner(newuser, actor: user)
        end

        alerts_per_repository = options[:alerts_per_repository].to_i

        progress = ProgressBar.create(
          title: " ",
          total: 2 * 10 * 10 * alerts_per_repository,
          format: "%a %b\u{15E7}%i %p%% %e %t",
          progress_mark: " ",
          remainder_mark: "\u{FF65}",
        ) if Rails.env.development?

        options = options.dup
        options[:skip_initialization] = true
        options[:business_slug] = business.slug
        options[:progress] = progress

        SecurityOverviewAnalytics.initialize_soa

        business.organizations.reload.each do |org|
          options[:owner_slug] = org.login
          SecurityOverviewAnalytics.run(options)
        end

        business.admins.each do |user|
          options[:owner_slug] = user.login
          SecurityOverviewAnalytics.run(options)
        end

        # Populate dates calendar for the dates that were not created previously
        ::SecurityOverviewAnalytics::Helpers.calendar_population_job_class.perform_later

        # Kick off standard security overview analytics initialization, which
        # will mark the business as initialized for incremental ingestion.
        # Note that repo metadata is already created by the above loop.
        ::SecurityOverviewAnalytics::Initialization.for(business).enqueue
        ::SecurityOverviewAnalytics::FanoutScheduler.initialize_for(business)
      end
    end
  end
end
