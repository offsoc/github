# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class PullRequestAnnotations < Seeds::Runner
      DEFAULT_AUTHOR = "monalisa"
      DEFAULT_REPO_NAME = "smile"

      def self.help
        <<~HELP
        Seed pull request annotation data for local development.

        - Ensures given PR author exists
        - Ensures given repo exists
        - Enables actions workflow that creates annotations on push
        - Creates pull request with annotations on changed and unchanged files

        Options:
          -author, -u
            String name of the pull request author.
            Defaults to #{DEFAULT_AUTHOR}.
            Example: bin/seed pull_requests -u octocat
          -nwo, -r
            String "name with owner" of the pull request base repository.
            Defaults to #{DEFAULT_AUTHOR}/#{DEFAULT_REPO_NAME}.
            Example: bin/seed pull_requests -r octocat/octorepo
        HELP
      end

      def self.run(options = {})
        # Ensure PR author exists
        author_login = options[:author] || DEFAULT_AUTHOR
        puts "Finding or creating PR author #{author_login}..."
        author = Seeds::Objects::User.create(login: author_login)

        # Ensure repo exists
        nwo = options[:nwo] || "#{author_login}/#{DEFAULT_REPO_NAME}"
        puts "Finding or creating repo #{nwo}..."
        repo = Seeds::Objects::Repository.create_with_nwo(nwo: nwo, setup_master: true)

        # Add users to the repo
        unless repo.members.include?(author)
          puts "Adding author to repo as member with write permissions..."
          repo.add_member(author)
        end

        # Ensure GitHub Actions app exists and is installed on repo
        # Borrowed from script/seeds/runners/actions.rb
        name = GitHub.launch_github_app_name
        puts "Finding or creating GitHub Actions app '#{name}'..."
        app = Integration.find_by(name: name)
        if !app.present?
          # Delay loading because it makes the script app slow because it boots github
          require_relative "../../create-launch-github-app"
          app = CreateLaunchGitHubApp.new.create_app
        end

        puts "Installing app on #{nwo} repository..."
        installer = repo.owner.organization? ? repo.owner.admins.first : repo.owner
        owner_installation = app.installations_on(repo.owner).first
        if owner_installation.present?
          ::IntegrationInstallation::Editor.append(
            owner_installation,
            repositories: [repo],
            editor: installer,
            entry_point: :seeds_runners_actions_create_and_install_github_app
          )
        else
          app.install_on(
            repo.owner,
            repositories: [repo],
            installer: installer,
            entry_point: :seeds_runners_actions_create_and_install_github_app
          )
        end

        # Since we're manually creating check suite, check run, and check annotation records,
        # this workflow file is essentially irrelevant, but we can still check it in if only
        # for greater fidelity to how things work in production.
        workflow_file_data = {
          filename: ".github/workflows/sample.yml",
          content: File.read(Rails.root.join("script", "seeds", "data", "actions", "workflow_templates", "sample.yml")),
        }

        # Build map of file names and comments in format required by Seeds::Objects::Commit.create files argument
        # ex. {"filename" => "file contents"}
        required_files = Seeds::Objects::CheckAnnotation::EXAMPLE_FILE_DATA.each_with_object({}) do |file, memo|
          memo[file[:filename]] = file[:content]
        end.merge({ workflow_file_data[:filename] => workflow_file_data[:content] })

        puts "Ensure initial files have been added to repo..."
        repo.blobs(repo.default_oid).map(&:path).each do |existing_file|
          required_files.delete(existing_file)
        end

        Seeds::Objects::Commit.create(
          repo: repo,
          committer: author,
          message: "Initial commit",
          files: required_files
        )

        puts "Committing changes to files on new branch..."
        head_branch_name = "annotations-#{SecureRandom.hex}"

        commit = Seeds::Objects::Commit.create(
          repo: repo,
          message: "Changing files to trigger annotation creation",
          committer: author,
          branch_name: head_branch_name,
          files: {
            "contributing.md" => Seeds::Objects::CheckAnnotation::EXAMPLE_FILE_DATA[0][:content] += "\n\nLast updated #{Time.current}",
            "evergreen.md" => Seeds::Objects::CheckAnnotation::EXAMPLE_FILE_DATA[1][:content] += "\n\nLast updated #{Time.current}",
          }
        )

        # Create push to trigger check suite creation
        push = ::Push.create!(
          before: commit.first_parent_oid,
          after: commit.oid,
          ref: "refs/heads/#{head_branch_name}",
          repository_id: repo.id,
          pusher: repo.owner,
          pushed_at: Time.current
        )

        puts "Finding or creating check suite for head_sha #{push.after}..."
        check_suite = ::CheckSuite.find_by(repository_id: repo.id, github_app_id: app.id, head_sha: push.after)
        if check_suite.nil?
          check_suite = \
            Seeds::Objects::CheckSuite.create(
              repo: repo,
              app: app,
              push: push,
              head_branch: head_branch_name,
              head_sha: push.after,
              attrs: {
                name: "CI With Annotations",
                status: ::CheckRun.statuses[:completed],
                conclusion: ::CheckRun.conclusions[:success],
                workflow_file_path: workflow_file_data[:filename],
                event: "push",
                check_runs_rerunnable: false, # Individual GitHub Actions check runs are not re-runnable
                external_id: SecureRandom.uuid,
              }
            )
        end

        puts "Creating check run for check suite '#{check_suite.name}'..."
        check_run = \
          check_suite.check_runs.create!(
            name:  "Check_run_number_1",
            display_name: Faker::Lorem.sentence,
            status: ::CheckRun.statuses[:completed],
            completed_at: Time.current,
            conclusion: ::CheckRun.conclusions[:success],
            started_at: Time.current - 1.minute,
            number: 1,
            repository: repo,
            external_id: SecureRandom.uuid
          )

        puts "Creating annotations for check run id #{check_run.id}"
        Seeds::Objects::CheckAnnotation.create_examples_for_check_run(check_run)
        # Ensure some messages are long enough to truncate
        check_run.annotations.sample(5).each do |annotation|
          annotation.update!(message: "#{annotation.message} #{Faker::Lorem.paragraph * 3}")
        end

        puts "Creating pull request..."
        pull = ::PullRequest.create_for!(
          repo,
          user: author,
          title: "Pull request with annotations",
          body: "This pull request has files with annotations.",
          head: head_branch_name,
          base: repo.default_branch,
        )

        puts "Done!"
        puts "View pull request at #{pull.url}"
      end
    end
  end
end
