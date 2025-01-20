# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Repos < Seeds::Runner
      REPOS_ORG = "repos-org"
      REPO_NAME = "maximum-effort"
      CONFIG_REPO_NAME = ".github"

      def self.help
        <<~HELP
        - Adds code_search_code_view feature flag and corresponding feature preview.
        - Seeds pre-made repos for testing purposes.
        Use `-f` (force) flag to recreate org and repos from scratch.
        HELP
      end

      class << self
        def run(options = {})
          require_relative "../../create-launch-github-app"

          user = Seeds::Objects::User.monalisa
          puts "--- Creating features ---"
          create_features(user)
          puts "--- Seeding repos ---"
          seed_repos(user, options)
        end

        def create_features(user)
          # Create the code search code view feature flag and associated feature preview
          if !FlipperFeature.find_by(name: :code_search_code_view)
            FlipperFeature.create(name: :code_search_code_view).enable(user)
            puts "Created FlipperFeature: code_search_code_view"
          else
            puts "FlipperFeature: code_search_code_view already exists"
          end

          code_search_code_view_feature = FlipperFeature.find_by(name: :code_search_code_view)

          if !Feature.find_by(slug: :code_search_code_view)
            Feature.create(
              public_name: "New Code View",
              slug: :code_search_code_view,
              flipper_feature: code_search_code_view_feature,
              feedback_link: "https://github.com/community/community/discussions/categories/general-feedback",
              enrolled_by_default: true
            )
            puts "Created Feature: New Code View"
          else
            puts "Feature: New Code View already exists"
          end

          # Enable additional feature flags to turn on react versions
          Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "react_code_view_enabled")
          Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "react_code_search_enabled")

          # Enable SSR flags
          Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "react_blob_ssr")
          Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "react_overview_ssr")
          Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "commits_ux_refresh_ssr")
          Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "diff_ux_refresh_ssr")

          # Enable Survey Dialog
          Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "code_navigation_survey")
        end

        def seed_repos(user, options = {})
          if options[:force]
            puts "--- Deleting existing [#{REPO_NAME}, #{CONFIG_REPO_NAME}] repos ---"
            Repository.find_by_name(REPO_NAME)&.destroy!
            Repository.find_by_name(CONFIG_REPO_NAME)&.destroy!
            puts "--- Deleting existing repos org ---"
            Organization.find_by(login: REPOS_ORG)&.destroy!
            ReservedLogin.untombstone!(REPOS_ORG)
          end

          repos_org = Organization.find_by(login: REPOS_ORG)
          if repos_org.nil?
            repos_org = Seeds::Objects::Organization.create(login: REPOS_ORG, admin: user)
            puts "Created org: #{repos_org.login}"
          else
            puts "Org #{repos_org.login} already exists"
          end

          repo = create_repo_if_not_exists(name: REPO_NAME, owner: repos_org)
          github_repo = create_repo_if_not_exists(name: CONFIG_REPO_NAME, owner: repos_org)

          create_funding_override(github_repo, repo, user)
          create_citation_warning(repo, user)
          create_license_file(repo, user)
          create_legacy_issue_template(repo, user)
          create_nested_dir(repo, user)
          create_dir_with_long_commit_message(repo, user)
          create_dir_with_many_files(repo, user)
          create_dir_with_long_file_names(repo, user)
          create_dir_with_different_blob_contents(repo, user)
          create_symbol_search_dir(repo, user)
          create_dir_with_many_collaborators(repo, user)
          create_dir_with_readme(repo, user)
          create_dir_with_files_of_different_sizes(repo, user)
          create_special_files_dirs(repo, user)
          create_dir_with_check_suite(repo, user)
          create_large_commit(repo, user, 100)
          create_large_commit(repo, user, 250)
          create_large_commit(repo, user, 500)

          # Create an 'outsider' user, not in the org, with repos in various states
          outsider = Seeds::Objects::User.create(login: "outsider", email: "outsider@example.com")
          create_user_with_repos_in_various_states(outsider)
        end

        def create_nested_dir(repo, user)
          puts "\nCreating nested directory for #{repo.nwo}"

          path = %w[nested-directory directory that goes deep into the darkness of this repo]

          files = {}
          path.each_with_index do |_name, index|
            next if index == 0
            999.times do |i|
              file_path = path.slice(0, index).append("file_#{i + 1}.txt").join("/")
              files[file_path] = "This is a file #{i + 1}"
            end
          end

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: files,
            message: "Add nested directory",
          )

          puts "Nested directory created: #{path.join("/")}"
        rescue GitRPC::Timeout, GitRPC::Protocol::DGit::ResponseError => err
          puts "Skipping nested directory creation for #{repo.nwo}, got a #{err.class.name} error: #{err}"
        end

        def create_dir_with_long_commit_message(repo, user)
          puts "\nCreating directory with long commit message for #{repo.nwo}"
          path = "directory-with-long-commit-message"

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              "#{path}/file.txt" => "This is a file",
            },
            message: "feat: This is a very long commit message. I don't know what to write here. It is warm and sunny in Zurich if anyone cares I hope this message is long enough",
          )
        rescue Git::Ref::ComparisonMismatch => err
          puts "Skipping creation of directory with long commit message for #{repo.nwo}, got a #{err.class.name} " \
            "error: #{err}"
        end

        def create_dir_with_check_suite(repo, user)
          puts "\nCreating directory with check suite for #{repo.nwo}"
          path = "directory-with-check-suite"
          workflow_file_path = "#{path}/file.txt"


          commit = Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              workflow_file_path => "This is a file",
            },
            message: "feat: This is a commit message. Checking here the check suite is added.",
          )

          create_check_suite(repo: repo, commit: commit, workflow_file_path: workflow_file_path)
        end

        def create_dir_with_many_files(repo, user)
          puts "\nCreating many files directory for #{repo.nwo}"
          path = "directory-with-many-files"

          files = {}
          2000.times do |i|
            file_path = "#{path}/file_#{i + 1}.txt"
            files[file_path] = "This is a file #{i + 1}"
          end

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: files,
            message: "Add directory with many files",
          )

          puts "Many files directory created: #{path}"
        end

        def create_dir_with_long_file_names(repo, user)
          puts "\nCreating directory with long file names for #{repo.nwo}"

          path = "directory-with-long-name-and-even-longer-file-names"

          files = {}
          100.times do |i|
            file_path = "#{path}/#{i + 1}_#{random_string(200)}.txt"
            files[file_path] = "This is a long file #{i + 1}"
          end

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: files,
            message: "Add directory with long file names",
          )

          puts "Directory with long file names created: #{path}"
        end

        def create_dir_with_different_blob_contents(repo, user)
          puts "\nCreating directory with different blob contents for #{repo.nwo}"

          dir = "directory-with-blobs"

          files = {
            "#{dir}/huge-blob.txt" => (random_string(80) + "\n") * 100_000,
            "#{dir}/medium-blob.txt" => (random_string(80) + "\n") * 10_000,
          }

          Dir[Rails.root.join("script", "seeds", "data", "repos", "blob-contents", "*")].each do |file_path|
            files["#{dir}/#{File.basename(file_path)}"] = File.read(file_path)
          end

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: files,
            message: "Add directory with different blob contents",
          )

          ref = repo.refs.find("refs/heads/#{repo.default_branch}")
          ref.append_commit({ message: "Add symlink", author: user }, user) do |changes|
            changes.add("#{dir}/symlink", "#{dir}/markdown.md", mode: 0120000)
          end

          puts "Directory with different blob contents created: #{dir}"
        end

        def create_symbol_search_dir(repo, user)
          puts "\nCreating symbol search directory for #{repo.nwo}"

          path = "symbol-search-directory"

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              "#{path}/functools.py" => File.read(Rails.root.join("script", "seeds", "data", "repos", "functools.py")),
              "#{path}/app.py" => File.read(Rails.root.join("script", "seeds", "data", "repos", "app.py")),
            },
            message: "Add python source code",
          )

          puts "Symbol search directory created: #{path}"
        rescue GitRPC::Timeout => err
          puts "Skipping creation of symbol search directory for #{repo.nwo}, got a #{err.class.name} error: #{err}"
        end

        def create_dir_with_many_collaborators(repo, user)
          puts "\nCreating directory with many collaborators for #{repo.nwo}"

          path = "directory-with-many-collaborators"
          file_name = "file.txt"

          content = []

          30.times do |i|
            collaborator = ::Seeds::Objects::User.create(login: "collaborator-#{i + 1}", email: "collaborator-#{i + 1}@github.com")
            repo.add_member(collaborator)
            content << "This is a line #{i + 1} by #{collaborator.login}"

            Seeds::Objects::Commit.create(
              committer: collaborator,
              repo: repo,
              branch_name: repo.default_branch,
              files: {
                [path, file_name].join("/") => content.join("\n")
              },
              message: "Add changes by #{collaborator.login}",
            )
          end

          puts "Directory with many collaborators created: #{path}"
        end

        def create_funding_override(github_repo, repo, user)
          puts "\nCreating funding override for #{repo.nwo}"

          text = <<~HEREDOC
          github: [octocat, surftocat]
          patreon: octocat
          HEREDOC

          Seeds::Objects::Commit.create(
            committer: user,
            repo: github_repo,
            branch_name: github_repo.default_branch,
            files: {
              "FUNDING.yml" => text
            },
            message: "Create FUNDING file",
          )

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              "FUNDING.yml" => text
            },
            message: "Create FUNDING file",
          )

          puts "Funding override created"
        end

        def create_citation_warning(repo, user)
          puts "\nCreating citation warning for #{repo.nwo}"

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              "CITATION.cff" => "Some text that cannot be parsed"
            },
            message: "Create CITATION file",
          )

          puts "Citation warning created"
        end

        def create_license_file(repo, user)
          puts "\nCreating license file for #{repo.nwo}"

          text = <<~HEREDOC
          Copyright (c) #{Time.now.year} Monalisa Octocat

          Permission is hereby granted, free of charge, to any person obtaining a copy
          of this software and associated documentation files (the "Software"), to deal
          in the Software without restriction, including without limitation the rights
          to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
          copies of the Software, and to permit persons to whom the Software is
          furnished to do so, subject to the following conditions:

          The above copyright notice and this permission notice shall be included in
          all copies or substantial portions of the Software.

          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
          IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
          AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
          LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
          OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
          THE SOFTWARE.
          HEREDOC

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              "LICENSE" => text
            },
            message: "Create license file",
          )

          puts "License file created"
        end

        def create_legacy_issue_template(repo, user)
          puts "\nCreating legacy issue template file for #{repo.nwo}"

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              ".github/ISSUE_TEMPLATE.md" => "name: Legacy version of issue templates"
            },
            message: "Create legacy issue template file",
          )

          puts "Legacy issue template file created"
        end

        def random_string(length)
          rand(36**length).to_s(36)
        end

        def create_repo_if_not_exists(owner:, name:, is_public: true)
          repo = Repository.find_by(owner_login: owner.login, name: name)
          if repo.nil?
            repo = Seeds::Objects::Repository.create(
              repo_name: name,
              owner_name: owner.login,
              setup_master: true,
              is_public: is_public
            )
            puts "#{repo.nwo} created\n"
          else
            puts "#{repo.nwo} already exists"
          end

          repo
        end

        def create_dir_with_readme(repo, user)
          puts "\nCreating directory with a README for #{repo.nwo}"

          dir = "directory-with-readme"
          readme_text = ("README " * 10 + "\n\n") * 20
          file_text = "# First\n\n" + readme_text + "# Second\n\n" + readme_text + "# Third\n\n" + readme_text
          files = {
            "#{dir}/README.md" => file_text
          }

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: files,
            message: "Create a directory with a README file",
          )

          puts "Directory with a README created: #{dir}"
        end

        private

        def create_and_install_github_app(repo:)
          name = "ReposApp"
          puts "Creating GitHub Actions app with name '#{name}'"

          app = Integration.find_by(name: name)

          if !app.present?
            app = Seeds::Objects::Integration.create(repo: repo, owner: repo.owner, app_name: name)
          else
            puts "App already exists."
          end

          puts "Installing app on #{repo.nwo} repository"
          installer = repo.owner.organization? ? repo.owner.admins.first : repo.owner
          owner_installation = app.installations_on(repo.owner).first
          if owner_installation.present?
            IntegrationInstallation::Editor.append(
              owner_installation,
              repositories: [repo],
              editor: installer,
              entry_point: :seeds_runners_repos_create_and_install_actions_app
            )
          else
            app.install_on(
              repo.owner,
              repositories: [repo],
              installer: installer,
              entry_point: :seeds_runners_repos_create_and_install_actions_app
            )
          end

          app
        end

        def create_dir_with_files_of_different_sizes(repo, user)
          puts "\nCreating directory with files of different sizes for #{repo.nwo}"

          dir = "directory-with-file-sizes"

          files = {
            "#{dir}/1_size_500_KB.txt" => (random_string(63) + "\n") * (500.kilobytes / 64),
            "#{dir}/2_size_501_KB.txt" => (random_string(63) + "\n") * (501.kilobytes / 64),
            "#{dir}/3_size_1_MB.txt" => (random_string(63) + "\n") * (1.megabytes / 64),
            "#{dir}/4_size_1.1_MB.txt" => (random_string(63) + "\n") * (1.1.megabytes / 64),
            "#{dir}/5_size_10_MB.txt" => (random_string(63) + "\n") * (10.megabytes / 64),
            "#{dir}/6_size_10.1_MB.txt" => (random_string(63) + "\n") * (10.1.megabytes / 64),
          }

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: files,
            message: "Add directory with files of different sizes",
          )

          puts "Directory with files of different sizes created: #{dir}"
        rescue GitRPC::Timeout => err
          puts "Skipping creation of directory with files of different sizes for #{repo.nwo}, got a " \
            "#{err.class.name} error: #{err}"
        end

        def create_special_files_dirs(repo, user)
          puts "\nCreating devcontainer file for #{repo.nwo}"

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              ".devcontainer/devcontainer.json" => "{ \n\"name\": \"test-devcontainer\"\n}"
            },
            message: "Create devcontainer file",
          )

          puts "devcontainer file created"

          puts "\nCreating workflow actions file for #{repo.nwo}"

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              ".github/workflows/test-action.yml" => "name: Test Action"
            },
            message: "Create workflow action file",
          )

          puts "Workflow actions file created"

          puts "\nCreating slash commands file for #{repo.nwo}"

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              ".github/commands/feature.yml" => "--- \ntrigger: feature"
            },
            message: "Create slah command file",
          )

          puts "Slash command file created"
        end

        def create_check_suite(repo:, commit:, workflow_file_path:, branch_name: nil, status: nil, conclusion: nil)
          puts "Creating check suite for #{repo.nwo} on commit #{commit.sha}"
          branch = branch_name || repo.default_branch
          app = create_and_install_github_app repo: repo

          push = Push.create!(
            before: commit.first_parent_oid,
            after: commit.oid,
            ref: "refs/heads/#{branch}",
            repository_id: repo.id,
            pusher: repo.owner,
            pushed_at: Time.now
          )

          status = status || ::CheckRun.statuses[:completed]
          conclusion = conclusion || ::CheckRun.conclusions[:failure]

          check_suite = ::CheckSuite.find_by(repository_id: repo.id, github_app_id: app.id, head_sha: push.after)
          if check_suite.nil?
            check_suite = Seeds::Objects::CheckSuite.create(
              repo: repo,
              app: app,
              push: push,
              head_branch: branch,
              head_sha: push.after,
              attrs: {
                name: name,
                status: status,
                conclusion: conclusion,
                workflow_file_path: workflow_file_path,
                event: "push",
                check_runs_rerunnable: false, # Individual GitHub Actions check runs are not re-runnable
                external_id: SecureRandom.uuid,
              })
          else
            puts "CheckSuite already exists"
          end

          # create check_run
          checks = [
            { id: 1, status: :in_progress, conclusion: nil },
            { id: 2, status: :completed, conclusion: :skipped },
            { id: 3, status: :completed, conclusion: :failure },
            { id: 4, status: :completed, conclusion: :success }
          ]
          checks.each do |check|
            started_at = Time.now.utc - (rand(1..20).minutes)
            check_run_status = ::CheckRun.statuses[check[:status]]
            check_run_completed = check_run_status == ::CheckRun.statuses[:completed]
            check_run_conclusion = check_run_completed ? ::CheckRun.conclusions[check[:conclusion]] : nil
            check_run = check_suite.check_runs.create!(
              name:  "Check_run_number_#{check[:id]}",
              display_name: "Job #{check[:id]}",
              status: check_run_status,
              completed_at: check_run_completed ? Time.now.utc : nil,
              conclusion: check_run_conclusion,
              started_at: started_at,
              number: check[:id],
              repository: repo,
              external_id: SecureRandom.uuid
            )
            check_run.save!
          end
          check_suite.save!
        end

        def create_user_with_repos_in_various_states(user)

          puts "\nCreating '#{user}' user with repos in various states"

          create_repo_if_not_exists(name: "public", owner: user, is_public: true)
          create_repo_if_not_exists(name: "private", owner: user, is_public: false)

          create_repo_if_not_exists(name: "public-locked", owner: user, is_public: true).lock_for_billing
          create_repo_if_not_exists(name: "private-locked", owner: user, is_public: false).lock_for_billing

          puts "User '#{user}' created with repos in various states"
        end

        def create_large_commit(repo, user, file_count)
          puts "\nCreating large commit for #{repo.nwo}"
          path = "directory-with-large-commit"

          files = {
            "#{path}/functools.py" => File.read(Rails.root.join("script", "seeds", "data", "repos", "functools.py")),
            "#{path}/app.py" => File.read(Rails.root.join("script", "seeds", "data", "repos", "app.py")),
            "#{path}/1_size_500_KB.txt" => (random_string(63) + "\n") * (500.kilobytes / 64),
            "#{path}/2_size_501_KB.txt" => (random_string(63) + "\n") * (501.kilobytes / 64),
            "#{path}/3_size_1_MB.txt" => (random_string(63) + "\n") * (1.megabytes / 64),
            "#{path}/4_size_1.1_MB.txt" => (random_string(63) + "\n") * (1.1.megabytes / 64),
          }

          file_count.times do |i|
            file_path = "#{path}/sub_dir/#{random_string(10)}.txt"
            files[file_path] = "This is file #{i + 1}"
          end

          commit = Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: files,
            message: "feat: This is a commit with #{file_count} files",
          )
        end

        def create_directory_filename_overflow(repo, user)
          files = {
            "Makefile" => "Real contents",
            "\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\xC2\xA0\n\n\n\n\n" => "Fake contents",
            "\n\n\n\n.gitignore\n\n\n\nLICENSE" => "Unrelated file contents",
          }

          commit = Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: files,
            message: "add files that overflow directory and filename length limits",
          )
        end
      end

    end
  end
end
