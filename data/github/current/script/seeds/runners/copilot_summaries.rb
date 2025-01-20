# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class CopilotSummaries < Seeds::Runner
      extend T::Sig

      def self.help
        <<~HELP
        Enable Copilot features, seed sample content that can be summarized, and set up organizations for @monalisa.
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"
        new.run(options)
      end

      sig { params(options: T::Hash[T.any(String, Symbol), T.untyped]).void }
      def run(options)
        create_orgs
        enable_feature_flags
        create_discussions
        create_issues
      rescue Faraday::ConnectionFailed
        warn "Your github/github server is not running. Please start it with ./script/server and try again."
        exit 1
      end

      private

      def create_orgs
        puts "➡️ Enabling Copilot for @#{monalisa}..."
        copilot_enterprise_org
      end

      def enable_feature_flags
        puts "➡️ Enabling feature flags..."
        %w(
          copilot_api_agents
          copilot_api_enable_model_gpt35turbo_switzerlandnorth
          copilot_api_enable_model_gpt4_switzerlandnorth
          copilot_api_platform_agent
          copilot_chat_sso
          copilot_implicit_context
          copilot_summary_custom_prompt
          copilot-api-bing-search-skill
          copilot-api-implicit-url
          copilot-api-path-search-skill
          copilot-api-staff-only-log
          copilot-api-symbol-search-skill
          discussions_copilot_summary
          issues_copilot_summary
        ).each do |feature_flag|
          puts "Enabling #{feature_flag} feature..."
          GitHub.flipper[feature_flag].enable
        end
      end

      def create_discussions
        puts "➡️ Creating discussions..."
        discussion = FactoryBot.create(:discussion, repository: monalisa_smile)
        FactoryBot.create(:discussion_comment, discussion: discussion, repository: monalisa_smile)

        answered_discussion = FactoryBot.create(:discussion_with_answer, repository: monalisa_smile)
        FactoryBot.create(:discussion_comment, discussion: answered_discussion, repository: monalisa_smile)
        FactoryBot.create(:discussion_comment, :nested, discussion: answered_discussion, repository: monalisa_smile)

        question_discussion = FactoryBot.create(:discussion, :question, repository: monalisa_smile)
        FactoryBot.create_pair(:discussion_comment, discussion: question_discussion, repository: monalisa_smile)

        poll_discussion = FactoryBot.create(:discussion, :with_poll, repository: monalisa_smile)
        FactoryBot.create_pair(:discussion_comment, discussion: poll_discussion, repository: monalisa_smile)
        FactoryBot.create(:discussion_comment, :nested, discussion: poll_discussion, repository: monalisa_smile)
      end

      def create_issues
        puts "➡️ Creating issues..."
        labels = monalisa_smile.labels.to_a
        Seeds::Objects::Issue.create(repo: monalisa_smile, actor: monalisa, title: Faker::Lorem.sentence,
          labels: labels.sample(3))
        Seeds::Objects::Issue.create(repo: monalisa_smile, actor: monalisa, title: Faker::Lorem.sentence)
      end

      sig { returns ::User }
      def monalisa
        @monalisa ||= Seeds::Objects::User.monalisa
      end

      sig { returns ::Repository }
      def monalisa_smile
        return @monalisa_smile if @monalisa_smile
        repo = Seeds::Objects::Repository.create_with_nwo(nwo: "#{monalisa}/smile", setup_master: true,
          is_public: true)
        repo.turn_on_discussions(actor: monalisa, instrument: false)
        @monalisa_smile = repo
      end

      sig { returns ::Organization }
      def copilot_enterprise_org
        return @copilot_enterprise_org if @copilot_enterprise_org
        org_on_copilot_enterprise_name = "copilot-enterprise-org"
        org = Organization.find_by(login: org_on_copilot_enterprise_name)
        if org
          puts "➡️ Found @#{org}"
        else
          puts "➡️ Creating @#{org_on_copilot_enterprise_name}..."
          org = FactoryBot.create(:copilot_feature_enabled_enterprise_organization,
            :copilot_plan_enterprise,
            id: 2206, # to match https://github.com/github/copilot-api/blob/8a68ab88b9fdf79dd4f094136942ebe62ac1e1ad/pkg/kb/store/memory.go#L36
            name: org_on_copilot_enterprise_name,
            billing_email: monalisa.emails.first.email,
            admins: [monalisa],
          )

          # enable Bing skill at the business level
          b = Copilot::Business.new(org.business)
          b.copilot_for_dotcom_enabled!
          b.bing_github_chat_enable!

          FactoryBot.create(:copilot_seat_assignment, organization: org, assignable: monalisa)
        end
        @copilot_enterprise_org = org
      end
    end
  end
end
