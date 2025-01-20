# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class MarketplaceListing < Seeds::Runner
      # Some of these partners are specified in the resources/launch-integrators.md
      # document in github/marketplace. Others are integrators that have been approved in
      # production. Some are featured in the Marketplace carousel.
      PRODUCTION_INTEGRATORS = {
        # Continuous Integration
        "travis-ci" => :oauth_app,
        "circle-ci" => :oauth_app,
        "appveyor" => :oauth_app,
        "percy" => :oauth_app,

        # Project Management
        "zenhub" => :oauth_app,
        "waffle" => :oauth_app,
        "zube" => :oauth_app,
        "codetree" => :oauth_app,

        # Monitoring
        "sentry" => :oauth_app,
        "rollbar" => :integration,
        "blackfire-io" => :oauth_app,
        "opbeat" => :oauth_app,

        # Code Quality
        "codacy" => :oauth_app,
        "codecov" => :integration,
        "codebeat" => :oauth_app,
        "gitprime" => :oauth_app,
        "styleci" => :oauth_app,
        "better-code-hub" => :oauth_app,
        "code-climate" => :oauth_app,

        # Dependency management
        "gemnasium" => :oauth_app,
        "dependabot" => :integration,
        "renovate" => :integration,
        "greenkeeper" => :integration,

        # Localization
        "gitlocalize" => :oauth_app,

        # Time tracking
        "wakatime" => :oauth_app,

        # Code review
        "coveralls" => :oauth_app,
        "accesslint" => :integration,

        # Security
        "backhub" => :integration,
      }.freeze

      def self.help
        <<~HELP
        Creates some default categories, agreements, and listings for the marketplace.
        HELP
      end

      class << self
        def run(options = {})
          require "factory_bot_rails"

          puts "Making sure github org and monalisa user exist"
          Seeds::Objects::User.monalisa
          Seeds::Objects::Organization.github

          puts "Creating/updating default categories"
          Seeds::Objects::MarketplaceCategory.seed_all

          puts "Creating/updating default agreements"
          Seeds::Objects::MarketplaceAgreement.create(signatory_type: :integrator)
          Seeds::Objects::MarketplaceAgreement.create(signatory_type: :end_user)

          Marketplace::Listing.transaction do
            PRODUCTION_INTEGRATORS.each do |slug, app_type|
              next if Marketplace::Listing.exists?(slug: slug)
              next if Marketplace::Listing.exists?(name: slug)

              integratable = if app_type == :oauth_app
                puts "Creating listing for a traditional OAuth app: #{slug}"
                Seeds::Objects::OauthApplication.create(owner: random_owner, name: slug)
              else
                puts "Creating listing for an Integration: #{slug}"
                create_integration(name: slug)
              end

              listing = Seeds::Objects::MarketplaceListing.create(listable: integratable, name: slug)
              num_plans = rand(2..5)
              num_plans.times do
                create_marketplace_listing_plan(listing)
              end
            end

            owner = options[:login] ? User.find_by!(login: options[:login]) : Seeds::Objects::User.monalisa

            options[:count].times do |index|
              # Generate a variety of application types
              listing = case index % 2
              when 0
                application = Seeds::Objects::OauthApplication.create(owner: owner)

                puts "Creating listing for a traditional OAuth app: #{application.name}"
                Seeds::Objects::MarketplaceListing.create(listable: application)
              else
                integration = create_integration(owner: owner)

                puts "Creating listing for an Integration: #{integration.name}"
                Seeds::Objects::MarketplaceListing.create(listable: integration)
              end

              num_plans = rand(4) + 1
              num_plans.times do
                create_marketplace_listing_plan(listing)
              end
            end

            Marketplace::Category.find_each do |category|
              category.primary_listing_count =
                Marketplace::Listing.with_verified_state.where(primary_category_id: category.id).count
              category.secondary_listing_count =
                Marketplace::Listing.with_verified_state.where(secondary_category_id: category.id).count
              category.save
            end
          end
        end

        private

        def random_owner
          account_type = [User, Organization].sample
          valid_owners[account_type].sample
        end

        def valid_owners
          @valid_owners ||= begin
            User.all.reject do |account|
              account.bot? || account.external_identities.any? || account.is_emu_admin? ||
                (account.organization? && account.admins.all? { |user| user.email.downcase.start_with?("support@") })
            end.group_by { |account| account.class }
          end
        end

        def create_integration(owner: nil, name: nil)
          suffix = " " + Integration.count.to_s
          Seeds::Objects::Integration.create(
            owner: owner || random_owner,
            app_name: name || "#{Faker::Company.name.first(34 - suffix.length)}#{suffix}",
            permissions: {
              "statuses" => :write,
              "contents" => :read,
              "pull_requests" => :read,
              "issues" => :read
            },
            events: %w(pull_request),
            integration_url: "http://example.com",
            callback_path: "/github/oauth/callback",
            webhook_path: "/github/events",
            setup_path: "/github/setup"
          )
        end

        def create_marketplace_listing_plan(listing)
          plan = if [true, false].sample
            # Free Plan
            Seeds::Objects::MarketplaceListingPlan.create(listing: listing)
          else
            monthly_price = rand(200_00) + 100
            Seeds::Objects::MarketplaceListingPlan.create(listing: listing, monthly_price_in_cents: monthly_price, yearly_price_in_cents: monthly_price, free_trial: [true, false].sample, per_unit: [true, false].sample)
          end
        end
      end
    end
  end
end
