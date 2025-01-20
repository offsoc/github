# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class GateRequests < Seeds::Runner
      def self.help
        <<~HELP
          Creates a a gate request that is attached to the hub repo.

          Usage: bin/seed gate_requests
        HELP
      end

      def self.run(options = {})
        mona = Seeds::Objects::User.monalisa
        hub_repo = Seeds::Objects::Repository.hub_repo

        now = Time.now
        yesterday = Time.now - (60 * 60 * 24)
        check_run_options_set = [
          { status: "completed", conclusion: "success", started_at: yesterday, completed_at: now },
          { status: "completed", conclusion: "neutral", started_at: yesterday, completed_at: nil },
          { status: "completed", conclusion: "failure", started_at: yesterday, completed_at: now },
          { status: "in_progress", conclusion: nil, started_at: yesterday, completed_at: nil }
        ]

        pull_creator = ::Seeds::Objects::User.create(login: "pullcreator", email: "pullcreator@github.com")
        hub_repo.owner.add_admin(pull_creator, adder: mona)

        pull = ::Seeds::Objects::PullRequest.create(
          base_ref: hub_repo.default_branch_ref,
          committer: pull_creator,
          is_draft: false,
          repo: hub_repo,
          reviewer_user_ids: [],
          reviewer_team_ids: [],
          title: Faker::Hacker.say_something_smart
        )

        env = Environment.find_or_create_by(name: "staging", repository: hub_repo)
        gate = Gate.create(type: :manual_approval, timeout: 0, body: "", environment: env)
        gate.environment.repository.add_member_without_validation_or_notifications(mona)
        gate_approver = GateApprover.find_or_create_by(gate: gate, repository: hub_repo, approver: mona)

        launch_github_app = GitHub.launch_github_app || setup_launch_github_app_on(hub_repo)
        check_suite = \
          ::CheckSuite.create!(
            github_app: GitHub.launch_github_app,
            repository: pull.head_repository,
            head_sha: pull.head_sha,
            head_branch: pull.head_ref,
          )

        check_run_options = check_run_options_set.sample
        check_run = Seeds::Objects::CheckRun.create(
          check_suite,
          completed_at: check_run_options[:completed_at],
          conclusion: check_run_options[:conclusion],
          details_url: GitHub.url,
          name: Faker::Superhero.name,
          repository: check_suite.repository,
          status: check_run_options[:status],
          started_at: check_run_options[:started_at],
        )

        workflow = ::Actions::Workflow.create!(name: "test", repository: check_suite.repository, state: :active, path: ".github/workflows/workflow-#{SecureRandom.hex(20)}.yml")
        workflow_run = ::Actions::WorkflowRun.create!(check_suite: check_suite, workflow: workflow, head_sha: pull.head_sha, repository: check_suite.repository, actor: check_suite.creator, name: "deploy-pages")

        puts "Creating gate request for #{check_run.name}"
        GateRequest.create_or_update_gate_request(env.approval_gate, check_run, "token", nil)
      end

      # Borrowed from script/seeds/runners/actions.rb
      def self.setup_launch_github_app_on(repo)
        require_relative "../../create-launch-github-app"

        name = GitHub.launch_github_app_name
        puts "Creating GitHub Actions app with name '#{name}'"

        app = ::Integration.find_by(name: name)
        if app.present?
          puts "App already exists."
        else
          app = ::CreateLaunchGitHubApp.new.create_app
        end

        puts "Installing app on #{repo.nwo} repository"
        installer = repo.owner.organization? ? repo.owner.admins.first : repo.owner
        owner_installation = app.installations_on(repo.owner).first

        if owner_installation.present?
          puts "App already installed."
        else
          app.install_on(
            repo.owner,
            repositories: [repo],
            installer: installer,
            entry_point: :seeds_runners_gate_requests_create_actions_app
          )
        end
      end
    end
  end
end
