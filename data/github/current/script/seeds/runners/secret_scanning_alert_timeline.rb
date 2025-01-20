# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SecretScanningAlertTimeline < Seeds::Runner
      def self.help
        <<~HELP
        Create historical timelines for secret scanning alerts in a repo.
        This requires token-scanning-service to be running
        HELP
      end

      def self.run(options = {})
        repo_name = options[:repo_name]
        repo = Repository.find_by(name: repo_name, owner_login: Seeds::Objects::Organization.github.login)

        if repo.nil?
          Seeds::Runner::SecretScanning.execute(
            repo_path: "script/seeds/data/secret_scanning/default.git",
            organization: true,
            name: repo_name
          )

          repo = Repository.find_by(name: repo_name, owner_login: Seeds::Objects::Organization.github.login)
        end

        puts "Waiting 10 seconds for secrets to be detected..."
        sleep(10.seconds)

        mona = Seeds::Objects::User.monalisa

        alert_number = options[:first_alert] || 1
        create_timeline_resolve_with_comment(alert_number, repo, mona)
        alert_number += 1
        create_timeline_resolve_without_comment(alert_number, repo, mona)
        alert_number += 1
        create_timeline_resolve_reopen(alert_number, repo, mona)
        alert_number += 1
        create_timeline_resolve_reopen_resolve(alert_number, repo, mona)
        alert_number += 1
        create_50_timeline_events(alert_number, repo, mona)
      end

      def self.create_timeline_resolve_with_comment(alert_number, repo, user)
        puts "Creating timeline for resolving alert with comment"

        resolve_token_using_service(alert_number, repo, user, :FALSE_POSITIVE, Faker::Creature::Dog.meme_phrase.truncate(280))

        print_on_completion(alert_number, repo.name_with_display_owner)
      end

      def self.create_timeline_resolve_without_comment(alert_number, repo, user)
        puts "Creating timeline for resolving alert without comment"

        resolve_token_using_service(alert_number, repo, user, :WONT_FIX)

        print_on_completion(alert_number, repo.name_with_display_owner)
      end

      def self.create_timeline_resolve_reopen(alert_number, repo, user)
        puts "Creating timeline for resolving an alert and then reopening it"

        resolve_token_using_service(alert_number, repo, user, :REVOKED, Faker::TvShows::SiliconValley.quote.truncate(280))
        resolve_token_using_service(alert_number, repo, user, :REOPENED)

        print_on_completion(alert_number, repo.name_with_display_owner)
      end

      def self.create_timeline_resolve_reopen_resolve(alert_number, repo, user)
        puts "Creating timeline for resolving an alert, reopening it, and then resolving again with a comment"

        resolve_token_using_service(alert_number, repo, user, :USED_IN_TESTS)
        resolve_token_using_service(alert_number, repo, user, :REOPENED)
        resolve_token_using_service(alert_number, repo, user, :REVOKED, Faker::Food.description.truncate(280))

        print_on_completion(alert_number, repo.name_with_display_owner)
      end

      def self.create_50_timeline_events(alert_number, repo, user)
        puts "Creating timeline with 50 resolutions"

        50.times do |_i|
          action = [:RESOLVE, :REOPEN].sample

          case action
          when :RESOLVE
            resolve_token_using_service(alert_number, repo, user, [:REVOKED, :USED_IN_TESTS, :FALSE_POSITIVE, :WONT_FIX].sample, [Faker::Movies::HarryPotter.quote.truncate(280), ""].sample)
          when :REOPEN
            resolve_token_using_service(alert_number, repo, user, :REOPENED)
          end
        end

        print_on_completion(alert_number, repo.name_with_display_owner)
      end

      def self.print_on_completion(alert_number, name_with_display_owner)
        puts "Created timeline for alert #{alert_number} on repository #{name_with_display_owner} ✅\n\n"
      end

      def self.resolve_token_using_service(alert_number, repo, user, resolution, resolution_comment = nil)
        response = GitHub::TokenScanning::Service::Client.new(user).resolve_token(
          repository_id: repo.id,
          token_id: alert_number,
          resolver_id: user.id,
          resolution: resolution,
          default_branch_name: repo.default_branch,
          feature_flags: [],
          resolution_comment: resolution_comment,
        )

        if response.nil?
          return StandardError.new("timeout when resolving token")
        end

        if response.error.present?
          StandardError.new(response.error.msg)
        end
      end
    end
  end
end
