# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class CheckRun < Seeds::Runner
      class << self

        def help
          <<~EOF
          Launch a check run generator for a repo and pull request, or launch an interactive session to create many.
          EOF
        end

        def run(options = {})
          require "readline"
          # hash of 'file name' => 'file contents'
          files = { "timetracking-#{Time.now.iso8601}" => "Current time is: #{Time.now.iso8601}" }

          check_run_opts = T.let({}, T.untyped)

          unless options[:interactive]
            check_run_opts = outcome_to_check_run_opts(options[:check_outcome])
            create_push_and_check(nwo: options[:nwo], pr_id: options[:pr], files: files, fresh_push: options[:fresh_push], check_run_opts: check_run_opts)
            return
          end

          outcomes = %w[green yellow red]
          check_run_name = Faker::Superhero.name
          current_check_run = T.let(nil, T.nilable(CheckRun))
          puts "==== Welcome to the interactive mode. ====="

          loop do
            puts "\n"
            puts "==== What do you want to do next ====="
            puts "(Current check run name is #{check_run_name})"
            puts "Press one of the following keys and hit ENTER: "
            puts "q: Quit"
            puts "g: Create a green (successful) check-run"
            puts "y: Create a yellow (neutral) check-run"
            puts "r: Create a red (failed) check-run"
            puts "n: Generate a new check-run name (to re-use)"
            puts "s: Generate steps for current check_run"
            puts "p: Create a new push (with a new check-suite)"

            print "Your input: "
            input = user_input
            puts

            case input
            when "q"
              puts "Bye bye."
              break
            when "p"
              puts "Creating push for repo with options: #{options.inspect}"
              create_push_only(nwo: options[:nwo], pr_id: options[:pr], files: files)
            when "n"
              check_run_name = Faker::Superhero.name
              puts "The new name is #{check_run_name}"
            when "s"
              if current_check_run
                puts "Creating steps for #{current_check_run}"
                Seeds::Objects::CheckRun.create_steps(current_check_run)
              else
                puts "There is no check-run with the name #{check_run_name} yet. First create one with g/y/r"
              end
            when /[ryg]/
              outcome = outcomes.find { |o| o.chars.first == input }
              check_run_opts = outcome_to_check_run_opts(outcome).merge(name: check_run_name, details_url: "https://github.localhost")
              current_check_run = create_push_and_check(
                nwo: options[:nwo],
                pr_id: options[:pr],
                files: files,
                fresh_push: options[:fresh_push],
                check_run_opts: check_run_opts
              )
            else
              next
            end
          end
        end

        private

        def user_input
          Readline.readline("", true).strip
        end

        def create_push_and_check(nwo:, pr_id:, files:, fresh_push:, check_run_opts:, message: "Example commit message for checks")
          repo = Repository.nwo(nwo)
          ensure_integration_exists(repo)
          pr = repo.issues.find_by_number(pr_id).pull_request
          if pr.nil?
            raise Runner::RunnerError, "Could not find PR with number #{pr_id} on repo #{repo.nwo}"
          end

          push = nil
          if fresh_push
            puts "creating new commit and push for #{nwo} with pr #{pr.number} and user #{pr.user}"
            push = Seeds::Objects::Push.create(
              committer: pr.user,
              repo: repo,
              branch_name: pr.head_ref,
              files: files,
              message: message
            )
          else
            push = Repositories::Domain::Pushes.new(:checks_api).by_repo_id_and_after(repository_id: repo.id, after: pr.head_sha)
            raise Objects::ActionFailed, "push was not found, please use --fresh-push" if push.nil?
          end

          if check_suite = CheckSuite.where(push_id: push.id).last
            puts <<~EOF
            Creating check run with:
              - conclusion: #{check_run_opts[:conclusion] || "nil"}
              - status: #{check_run_opts[:status]}
            EOF
            Seeds::Objects::CheckRun.create(check_suite, **T.unsafe({ repository: repo, **check_run_opts }))
          else
            raise Objects::ActionFailed, "no checksuites found on the last push, please use --fresh-push to make a new push object"
          end
        end

        def create_push_only(nwo:, pr_id:, files:, message: "Example commit message for checks")
          repo = Repository.nwo(nwo)
          ensure_integration_exists(repo)
          pr = repo.issues.find_by_number(pr_id).pull_request
          if pr.nil?
            raise Runner::RunnerError, "Could not find PR with number #{pr_id} on repo #{repo.nwo}"
          end

          Seeds::Objects::Push.create(
            committer: pr.user,
            repo: repo,
            branch_name: pr.head_ref,
            files: files,
            message: message
          )
        end

        def ensure_integration_exists(repo)
          owner_integrations = Integration.where(owner: repo.owner)
          installations = owner_integrations.flat_map { |i| i.installations_on(repo.owner) }
          return if installations.any? { |i| i.installed_on_all_repositories? || i.repository_ids.include?(repo.id) }
          Seeds::Objects::Integration.create(repo: repo, owner: repo.owner, app_name: Faker::App.name)
        end

        def outcome_to_check_run_opts(outcome)
          default_args = { name: Faker::Superhero.name, details_url: "https://github.localhost" }
          state_args = case outcome
          when "green"
            { status: "completed", conclusion: "success", started_at: 1.day.ago, completed_at: Time.now }
          when "yellow"
            { status: "completed", conclusion: "neutral", started_at: 1.day.ago, completed_at: nil }
          when "red"
            { status: "completed", conclusion: "failure", started_at: 1.day.ago, completed_at: 1.hour.ago }
          else
            { status: "in_progress", conclusion: nil, started_at: 2.days.ago, completed_at: nil }
          end
          state_args.merge(default_args)
        end
      end
    end
  end
end
