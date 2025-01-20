# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class MergeQueueChecks < Seeds::Runner
      class << self
        CHECK_SUITE_APP_NAME = "Checks Seed"

        def help
          <<~EOF
          CheckRun generator for pull requests in merge queues.
          Example: bin/seed merge_queue_checks -r=monalisa/merge-queue -n=mq -p=10 -t=pr -s=success
          EOF
        end

        def run(options = {})
          require "readline"
          nwo = options[:nwo]
          repository = Repository.nwo(nwo)
          unless repository.present?
            abort "Repository not found: #{nwo}"
          end
          ensure_integration_exists(repository: repository)
          check_run_name = options[:name] || "default"

          if options[:interactive]
            interactive_mode(repository: repository, check_run_name: check_run_name)
          else
            pull_request = find_pull_request(repository: repository, number: options[:pull_request])
            abort "Pull Request ##{options[:pull_request]} not found" unless pull_request.present?
            print_pr_status(pull_request: pull_request)

            ensure_valid_target_and_status(target: options[:target], status: options[:status])
            if options[:target] == "pr"
              check_suite = find_or_create_check_suite(repository: repository, sha: pull_request.head_sha)
              create_check_run_for_check_suite(check_suite: check_suite, name: check_run_name, outcome: options[:status])
            elsif options[:target] == "mq"
              queue_entry_sha = queue_entry_head_sha(pull_request: pull_request)
              if queue_entry_sha.present?
                check_suite = find_or_create_check_suite(repository: repository, sha: queue_entry_sha)
                create_check_run_for_check_suite(check_suite: check_suite, name: check_run_name, outcome: options[:status])
              else
                puts "No MergeQueueEntry for this PR"
              end
            end

            print_mq_status(pull_request: pull_request)
          end
        end

        private

        def interactive_mode(repository:, check_run_name:)
          puts "✨ Let's build some status checks for #{repository.nwo}. ✨"
          puts "✨ Status check name is #{check_run_name} ✨"

          loop do
            puts
            print "PR number (or (Q)uit) > "
            input = user_input

            exit if input == "q"

            next unless input =~ /^[0-9]+$/
            unless pull_request = find_pull_request(repository: repository, number: input.to_i)
              puts "Pull Request ##{input} not found."
              next
            end

            print_pr_status(pull_request: pull_request)
            print_mq_status(pull_request: pull_request)

            loop do
              puts
              puts "(C)hoose a new PR"
              puts "(P) Add a check to the PR"
              puts "(M) Add a check to the Merge Groups"
              puts "(Q)uit"
              print "> "
              input = user_input

              break if input == "c"
              exit if input == "q"

              case input
              when "p"
                input = get_user_check_type

                case input
                when "r"
                  outcome = get_user_check_run_outcome
                  check_suite = find_or_create_check_suite(repository: repository, sha: pull_request.head_sha)
                  create_check_run_for_check_suite(check_suite: check_suite, name: check_run_name, outcome: outcome)
                when "s"
                  outcome = get_user_status_outcome
                  create_status_for_sha(repository: repository, sha: pull_request.head_sha, name: check_run_name, outcome: outcome)
                end
              when "m"
                input = get_user_check_type

                queue_entry_sha = queue_entry_head_sha(pull_request: pull_request)
                unless queue_entry_sha
                  puts "No MergeQueueEntry SHA for this PR"
                  next
                end

                case input
                when "r"
                  outcome = get_user_check_run_outcome
                  check_suite = find_or_create_check_suite(repository: repository, sha: queue_entry_sha)
                  create_check_run_for_check_suite(check_suite: check_suite, name: check_run_name, outcome: outcome)
                when "s"
                  outcome = get_user_status_outcome
                  create_status_for_sha(repository: repository, sha: queue_entry_sha, name: check_run_name, outcome: outcome)
                end
              end
              print_pr_status(pull_request: pull_request)
              print_mq_status(pull_request: pull_request)
            end
          end
        end

        def user_input
          Readline.readline("", true).strip.downcase
        end

        def ensure_valid_target_and_status(target:, status:)
          abort "Invalid target: #{target} (must be pr or mq)" unless %w[pr mq].include?(target)
          abort "Invalid status: #{status} (must be success, failure, neutral or waiting)" unless %w[success failure neutral waiting].include?(status)
        end

        def find_pull_request(repository:, number:)
          repository.issues.find_by_number(number)&.pull_request
        end

        def print_pr_status(pull_request:)
          puts "Pull Request ##{pull_request.number} is #{pull_request.state}."
        end

        def print_mq_status(pull_request:)
          mq_entry = pull_request.merge_queue_entry
          if mq_entry.present?
            puts "PR is queued"
          else
            puts "PR is not in a Merge Queue"
          end
        end

        def get_user_check_run_outcome
          loop do
            print "(S)uccess, (F)ailure, (N)eutral, (W)aiting > "
            input = user_input
            if %w(n s f w).include?(input)
              return input
            end
          end
        end

        def get_user_status_outcome
          loop do
            print "(S)uccess, (F)ailure, (E)rror, E(x)pected, (P)ending > "
            input = user_input
            if %w(s f e x p).include?(input)
              return input
            end
          end
        end

        def get_user_check_type
          loop do
            puts
            puts "(C)hoose a new PR"
            puts "(R) Add a CheckRun"
            puts "(S) Add a Status"
            print "> "
            input = user_input
            if %w(r s).include?(input)
              return input
            end

            break if input == "c"
          end
        end

        def create_check_run_for_check_suite(check_suite:, name:, outcome:)
          check_run_options = outcome_to_check_run_opts(outcome)
          puts "Creating CheckRun with status #{check_run_options[:status]} and conclusion #{check_run_options[:conclusion]}"
          check_run = T.unsafe(Seeds::Objects::CheckRun).create(check_suite, repository: check_suite.repository, name: name, **check_run_options)
          MergeQueues.execute_from_sha!(check_suite.repository, check_run.head_sha)
        end

        def ensure_integration_exists(repository:)
          owner_integrations = Integration.where(owner: repository.owner, name: CHECK_SUITE_APP_NAME)
          installations = owner_integrations.flat_map { |i| i.installations_on(repository.owner) }
          return if installations.any? { |i| i.installed_on_all_repositories? || i.repository_ids.include?(repository.id) }
          Seeds::Objects::Integration.create(repo: repository, owner: repository.owner, app_name: CHECK_SUITE_APP_NAME)
        end

        def find_or_create_check_suite(repository:, sha:)
          check_suite = CheckSuite.where(repository: repository, head_sha: sha).last
          unless check_suite
            github_app = repository.owner.integrations.find_by(name: CHECK_SUITE_APP_NAME)
            check_suite = CheckSuite.create(repository: repository, head_sha: sha, github_app_id: github_app.id)
          end
          check_suite
        end

        def create_status_for_sha(repository:, sha:, name:, outcome:)
          user = repository.owner
          status = outcome_to_status(outcome)
          puts "Creating Status with status #{status}"
          status = Status.create(repository: repository, sha: sha, context: name, state: status, creator: user)
          MergeQueues.execute_from_sha!(T.must(status.repository), status.head_sha)
        end

        # Returns the object id (sha) of the last group entry of the passed pull request
        #
        # Returns nil if the pull request is not in a merge queue
        def queue_entry_head_sha(pull_request:)
          pull_request.reload.merge_queue_entry&.head_sha
        end

        def outcome_to_check_run_opts(outcome)
          default_args = { details_url: "http://github.localhost" }
          state_args = T.let({}, Hash)
          state_args = case outcome
          when "s", "success"
            { status: "completed", conclusion: "success", started_at: 20.minutes.ago, completed_at: Time.now }
          when "n", "neutral"
            { status: "completed", conclusion: "neutral", started_at: 20.minutes.ago, completed_at: nil }
          when "f", "failure"
            { status: "completed", conclusion: "failure", started_at: 20.minutes.ago, completed_at: 1.hour.ago }
          when "w", "waiting"
            { status: "in_progress", conclusion: nil, started_at: 5.minutes.ago, completed_at: nil }
          end
          state_args.merge(default_args)
        end

        def outcome_to_status(outcome)
          case outcome
          when "s", "success"
            "success"
          when "f", "failure"
            "failure"
          when "e", "error"
            "error"
          when "x", "expected"
            "expected"
          when "p", "pending"
            "pending"
          end
        end
      end
    end
  end
end
