# typed: true
# frozen_string_literal: true

require_relative "../runner"

# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SecurityOverviewAnalytics < Seeds::Runner
      def self.help
        <<~HELP
        Create a repos with seeded alert revisions for Security Overview Analytics development
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"
        require "ruby-progressbar"

        user = Seeds::Objects::User.monalisa

        owner = options[:owner_slug] ? ::User.find_by!(login: options[:owner_slug]) : Seeds::Objects::Organization.github

        alerts_per_repository = options[:alerts_per_repository].to_i
        options = options.dup
        options[:create_repo] = false
        if owner.organization?
          # Follow the same pattern as AdvancedSecurity
          AdvancedSecurity.run(options)
        end


        repositories_per_owner = options[:repositories_per_owner].to_i
        # Make sure owner has at least that many repos
        until owner.repositories.count >= repositories_per_owner do
          repository = Seeds::Objects::Repository.create(owner_name: owner, setup_master: true, is_public: false)
        end

        run_initialization = options[:skip_initialization].nil? || options[:skip_initialization] == false

        self.initialize_soa if run_initialization

        repo_configs = []
        owner.repositories.each do |repository|
          if owner.user? && owner.is_enterprise_managed?
            repo_configs << FactoryBot.create(:security_overview_analytics_repository, repository: repository, business_id: owner.enterprise_managed_business.id)
          else
            # make sure security products are enabled for the repo (e.g. honor the "for new repos" org setting)
            repository.setup_security_products_on_creation(user, false) if owner.organization?
            repo_configs << FactoryBot.create(:security_overview_analytics_repository, repository: repository)
          end
        end

        today_id = Time.now.strftime("%Y%m%d").to_i
        dates = ::SecurityOverviewAnalytics::Date.where(id: ..today_id).limit(365).order(id: :desc).to_a
        today_id = T.must(dates.first)[:id]

        # Create feature status revisions for each repo
        feature_status_fields = ::SecurityOverviewAnalytics::FeatureStatusRevision::UpdatePayload.props.keys
        repo_configs.each do |repository_metadata|
          # Re-wipe feature status revision as setup_security_products_on_creation sometimes has time to create them
          ::SecurityOverviewAnalytics::FeatureStatusRevision.where(repository_id: repository_metadata[:repository_id]).delete_all
          # enable a random sampling of features on a random date
          enabled_at_ago = rand(0..363)
          date = dates[enabled_at_ago]
          feature_statuses = feature_status_fields.map { |feature_field| [feature_field, [true, false].sample] }.to_h
          FactoryBot.create(:soa_feature_status_revision, repository_metadata:, date:, **feature_statuses)
        end

        if !!options[:progress]
          progress = options[:progress]
        elsif Rails.env.development?
          progress = ProgressBar.create(
            title: " ",
            total: repo_configs.count * alerts_per_repository,
            format: "%a %b\u{15E7}%i %p%% %e %t",
            progress_mark: " ",
            remainder_mark: "\u{FF65}",
          )
        end

        # Create alert revisions in each repo.
        # If each repo will have 100 alerts for dependabot, code scanning, and secret scanning alerts in proportions: 40, 20, 40
        # Half of the alerts will be resolved, so creating initial and resolved alert revisions
        # Using factorybot to speed up alert creation and follow what we do in tests
        # ref https://github.com/github/security-center-experiments/blob/main/internal/alerts/alerts_experiments.go#L19

        repo_configs.each do |repo_config|
          (alerts_per_repository * 0.4).to_i.times do |i|
            create_revision(:security_overview_analytics_dependabot_alert_revision, i, dates, today_id, repo_config)
            progress.increment if progress
          end
          (alerts_per_repository * 0.2).to_i.times do |i|
            create_revision(:security_overview_analytics_code_scanning_alert_revision, i, dates, today_id, repo_config)
            create_pull_request_alert(i, dates, repo_config)
            progress.increment if progress
          end
          (alerts_per_repository * 0.4).to_i.times do |i|
            create_revision(:security_overview_analytics_secret_scanning_alert_revision, i, dates, today_id, repo_config)
            progress.increment if progress
          end
        end

        if run_initialization
          # Populate dates calendar for the dates that were not created previously
          ::SecurityOverviewAnalytics::Helpers.calendar_population_job_class.perform_later

          # Kick off standard security overview analytics initialization, which
          # will mark the business as initialized for incremental ingestion.
          # Note that repo metadata is already created by the above loop.
          business = options[:business_slug] ? ::Business.find_by!(slug: options[:business_slug]) : Seeds::Objects::Business.github
          ::SecurityOverviewAnalytics::Initialization.for(business).enqueue
          ::SecurityOverviewAnalytics::FanoutScheduler.initialize_for(business)
        end
      end

      def self.initialize_soa
        ::SecurityOverviewAnalytics::FeatureStatusRevision.delete_all
        ::SecurityOverviewAnalytics::SecretScanningAlertRevision.delete_all
        ::SecurityOverviewAnalytics::CodeScanningAlertRevision.delete_all
        ::SecurityOverviewAnalytics::CodeScanningPullRequestAlert.delete_all
        ::SecurityOverviewAnalytics::DependabotAlertRevision.delete_all
        ::SecurityOverviewAnalytics::Repository.delete_all

        # Set up array of dates for the year using factorybot
        ::SecurityOverviewAnalytics::Date.delete_all

        365.times do |i|
          FactoryBot.create(:security_overview_analytics_date, date_value: (Time.now - i.days))
        end
      end

      def self.create_revision(factory, i, dates, today_id, repo_config)
        max_date_id = ::SecurityOverviewAnalytics::Date::FUTURE_DATE_ID

        alert_resolved = i % 2 == 0 ? true : false
        alert_created_at_ago = rand(0..363)
        alert_created_at = (Time.now - alert_created_at_ago.days)
        if alert_resolved && alert_created_at_ago > 0
          # Resolved some time between now and alert_created_at
          alert_resolved_at_ago = rand(0..alert_created_at_ago - 1)
          alert_resolved_at = Time.now - alert_resolved_at_ago.days
        else
          alert_resolved_at_ago = nil
          alert_resolved_at = nil
        end
        rev = FactoryBot.create(factory, repository_metadata: repo_config,
          alert_resolved: alert_resolved,
          alert_number: i,
          alert_created_at: alert_created_at,
          alert_resolved_at: alert_resolved_at,
          date: (alert_resolved && alert_created_at_ago > 0 ? dates[alert_resolved_at_ago] : dates[alert_created_at_ago]),
          next_revision_date_id: max_date_id,
          )
        if alert_resolved && alert_created_at_ago > 0
          # If alert is resolved and created beforetoday, create separate backdated initial revision
          FactoryBot.create(factory, repository_metadata: repo_config,
            alert_resolved: false,
            alert_number: i,
            alert_created_at: rev.alert_created_at,
            date: dates[alert_created_at_ago],
            next_revision_date_id: today_id,
          )
        end
      end

      sig do
        params(
          idx: Integer,
          dates: T::Array[::SecurityOverviewAnalytics::Date],
          repository_metadata: ::SecurityOverviewAnalytics::Repository,
        ).void
      end
      def self.create_pull_request_alert(idx, dates, repository_metadata)
        resolution_scenarios = [
          # Fixed with autofix
          {
            alert_resolved: true,
            has_autofix: true,
            autofix_accepted: true,
            alert_resolution: nil,
          },

          # Fixed without autofix
          {
            alert_resolved: true,
            has_autofix: %w[true false].sample,
            autofix_accepted: false,
            alert_resolution: nil,
          },

          # Dismissed, not fixed
          {
            alert_resolved: true,
            has_autofix: %w[true false].sample,
            autofix_accepted: false,
            alert_resolution: [
              ::Turboscan::Proto::ResultResolution::FALSE_POSITIVE,
              ::Turboscan::Proto::ResultResolution::WONT_FIX,
              ::Turboscan::Proto::ResultResolution::USED_IN_TESTS,
            ].sample,
          },

          # Unresolved
          {
            alert_resolved: false,
            has_autofix: %w[true false].sample,
            autofix_accepted: false,
            alert_resolution: nil,
          },
        ]

        FactoryBot.create(
          :soa_code_scanning_pr_alert,
          repository_metadata:,
          date_id: dates.map(&:id).sample,
          alert_number: idx,
          tool: %w[CodeQL].sample,
          rule_sarif_identifier: %w[
            java/missing-override-annotation
            js/unused-local-variable
            js/xss-through-dom
            js/incomplete-sanitization
            cs/reference-equality-with-object
            js/useless-assignment-to-local
            cs/useless-assignment-to-local
            java/log-injection
            cs/useless-cast-to-self
            cs/useless-upcast
            js/automatic-semicolon-insertion
            js/unsafe-jquery-plugin
            py/unused-import
            java/unused-parameter
            java/deprecated-call
            cs/catch-of-all-exceptions
            js/functionality-from-untrusted-source
            java/local-variable-is-never-read
            js/useless-expression
            js/redos
          ].sample,
          alert_severity: %w[critical high medium low].sample,
          alert_resolved: %w[true false].sample,
          has_autofix: %w[true false].sample,
          **(resolution_scenarios.sample),
        )
      end
    end
  end
end
