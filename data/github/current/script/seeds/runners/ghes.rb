# frozen_string_literal: true

require_relative "../runner"
require "json"

# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

# This runner is used to seed test datasets for GHES.
# It is not used for seeding production data and will only run in the enterprise runtime.
module Seeds
  class Runner
    class Ghes < Seeds::Runner
      def self.help
        <<~HELP
        Seed data to a GHES instance for testing.

        Can be called with a size parameter to seed a small, medium, or large dataset. Default is small.

        Dataset sizes can be overridden with the config parameter. For example, to seed 10 users and 5 organizations:
        `ghes --config='{"users": 10, "organizations": 5}'`

        Use the print_config parameter to print the final configuration and return without seeding.
        HELP
      end

      def self.run(options = {})
        # Set our runtime options and configuration
        self.set_options(options)

        # Exit if only printing the configuration
        return if @print_config

        @admin_user = User.find_by(login: "ghe-admin") || Seeds::Objects::User.monalisa
        puts "Admin user: #{@admin_user.login}" if @debug
        raise "Admin user not found" unless @admin_user

        puts "Seeding GHES data..."

        if @issue_links > 0
          repo = Seeds::Objects::Repository.create(owner_name: @admin_user.login, repo_name: "starter-repo", setup_master: true)
          issue = Seeds::Objects::Issue.create(repo: repo, actor: @admin_user)
          puts "Created issue #{issue.name_with_display_owner_reference} for linking" if @debug
        end

        # Create a GitHub App for check runs
        gh_app_name = "ghes-seed-app"
        puts "Finding or creating GitHub Actions app '#{gh_app_name}'..." if @debug
        @gh_app = Integration.find_by(name: gh_app_name)
        if !@gh_app.present?
          integration_attributes = {
            owner: @admin_user,
            name: gh_app_name,
            url: "https://example.com",
            public: true,
          }
          @gh_app = Integration.create!(integration_attributes)
        end

        (0...@organizations).each do |i|
          app = Faker::App.name
          app = app.downcase.gsub(" ", "-")
          # TODO(elee): catch specific error when creating orgs and print friendly error message
          org = Seeds::Objects::Organization.create(
            login: "#{app}-#{i}",
            admin: @admin_user,
            plan: nil,
          )
          puts "Created organization: #{org.login}" if @debug
          self.seed_org(org)
        end

        # Install the GitHub App on the first repository
        first_repo = Repository.first
        puts "Installing app on #{first_repo.nwo} repository" if @debug
        installer = first_repo.owner.organization? ? first_repo.owner.admins.first : first_repo.owner
        owner_installation = @gh_app.installations_on(first_repo.owner).first
        if owner_installation.present?
          IntegrationInstallation::Editor.append(
            owner_installation,
            repositories: [first_repo],
            editor: installer,
            entry_point: :seeds_runners_actions_create_and_install_github_app
          )
        else
          @gh_app.install_on(
            first_repo.owner,
            repositories: [first_repo],
            installer: installer,
            entry_point: :seeds_runners_actions_create_and_install_github_app
          )
        end

        (0...@check_suites).each do
          check_suite = Seeds::Objects::CheckSuite.create(
            repo: Repository.first,
            app: @gh_app,
            head_branch: Repository.first.refs.first.name,
            head_sha: Repository.first.refs.first.sha,
            push: nil,
            attrs: nil
          )
          puts "Created check suite: #{check_suite.id}" if @debug
        end

        # These require check suites
        (0...@check_runs).each do
          check_run = Seeds::Objects::CheckRun.create(
            CheckSuite.first,
            name: "Test Check Run",
            status: "completed",
            completed_at: Time.now,
            conclusion: "success",
            started_at: Time.now - 1.hour,
            details_url: "https://example.com",
            with_steps: true,
            repository: Repository.first
          )
          puts "Created check run: #{check_run.id}" if @debug
        end

        # These must be attached to a check run -- TODO(elee): avoid duplicates
        (0...@check_annotations).each do
          check_annotations = Seeds::Objects::CheckAnnotation.create_examples_for_check_run(
            ::CheckRun.all.sample
          )
          puts "Created #{check_annotations.length} check annotations" if @debug
        end

        (0...@commits).each do
          commit = Seeds::Objects::Commit.create(
            repo: Repository.first,
            message: "A message",
            committer: @admin_user
          )
          puts "Created commit: #{commit.oid}" if @debug
        end

        # TODO: Pushes are not seeding when called here or in the checks runner.
        # The owning team will need to be contacted for help on this implementation.
        [].each do
          repo = Repository.all.sample
          push = Seeds::Objects::Push.create(
            **{
              committer: @admin_user,
              repo: repo,
              branch_name: repo.default_branch,
              files: { "README.md" =>
                Faker::Markdown.sandwich(sentences: 15) + Faker::Lorem.paragraphs(number: 4 + rand(3)).join("\n\n") },
              message: "Add #{repo.default_branch}/README.md",
            })
          puts "Created push: #{push.oid}" if @debug
        end

        (0...@commit_comments).each do
          commit_comment = Seeds::Objects::CommitComment.create(
            user: @admin_user,
            repo: Repository.first
          )
          puts "Created commit comment: #{commit_comment.id}" if @debug
        end

        (0...@deployments).each do
          deployment = Seeds::Objects::Deployment.create(
            repository: Repository.first,
            head_sha: repo.refs.first.sha,
            integration: @gh_app,
          )
          puts "Created deployment: #{deployment.id}" if @debug
        end

        # TODO: Our repository does not have discussion categories created, so the create function is failing.
        # The owning team should be consulted to determine how to create discussion categories.
        [].each do
          discussion = Seeds::Objects::Discussion.create(
            user: @admin_user,
            repo: Repository.first,
          )
          puts "Created discussion: #{discussion.id}" if @debug
        end

        (0...@discussion_posts).each do
          discussion_post = Seeds::Objects::DiscussionPost.create(
            user: @admin_user,
            team: Team.first,
          )
          puts "Created discussion post: #{discussion_post.id}" if @debug
        end

        (0...@users).each do |i|
          handle = Faker::Movies::Hackers.handle
          handle = handle.downcase.gsub(" ", "-")
          user = Seeds::Objects::User.create(
            login: "#{handle}-#{i}",
            password: "passworD1", # The default password environment variable is not set in GHES instances
            billing_attempts: nil, # Override the default set for dotcom user seeding
            plan: nil, # Override the default set for dotcom user seeding
          )
          puts "Created user: #{user.login}" if @debug
          self.seed_user(user)
        end

        puts "GHES data seeded successfully!"
      end

      def self.seed_org(org)
        (0...@teams).each do
          team = Seeds::Objects::Team.create!(org: org)
          puts "Created team: #{team.name}" if @debug
        end

        # Add custom roles to org
        (0...@roles).each do |i|
          role = Seeds::Objects::Role.create(org: org, permissions: [])
          puts "Created role #{role.name} for #{org.login}" if @debug
        end

        (0...@repositories_per_organization).each do |i|
          fake = Faker::Hacker
          name = "#{fake.adjective}-#{fake.noun}-#{i}".gsub(" ", "-")
          repo = Seeds::Objects::Repository.create(
            owner_name: org.login,
            repo_name: name,
            setup_master: true,
            is_public: false,
          )
          puts "Created repository: #{repo.full_name}" if @debug

          (0...@oauth_applications_per_organization).each do
            oauth_app = Seeds::Objects::OauthApplication.create(owner: org)
            puts "Created oauth application #{oauth_app.name}" if @debug
          end

          self.seed_repo(repo, @admin_user)
        end
      end

      def self.seed_user(user)
        (0...@repositories_per_user).each do |i|
          fake = Faker::Hacker
          name = "#{fake.adjective}-#{fake.noun}-#{i}".gsub(" ", "-")
          repo = Seeds::Objects::Repository.create(
            owner_name: user.login,
            repo_name: name,
            setup_master: true,
            is_public: false,
          )
          puts "Created repository: #{repo.full_name}" if @debug

          self.seed_repo(repo, user)
        end

        (0...@gists_per_user).each do
          gist = Seeds::Objects::Gist.create(
            user: user,
            contents: [{ name: "README.md", value: "This is a gist" }],
          )
          puts "Created gist: #{gist.id}" if @debug

          (0...@comments_per_gist).each do
            fake = Faker::Lorem
            comment = Seeds::Objects::GistComment.create(
              user: user,
              gist: gist,
              body: fake.sentence,
            )
            puts "Created gist comment: #{comment.body}" if @debug
          end
        end
      end

      def self.seed_repo(repo, actor)
        (0...@labels_per_repository).each do |i|
          fake = Faker::Adjective.negative
          label = Seeds::Objects::Label.create(
            repo: repo,
            name: "#{fake}-label-#{i}",
          )
          puts "Created label: #{label.name}" if @debug
        end

        (0...@commits_per_repository).each do
          commit = Seeds::Objects::Commit.create(
            repo: repo,
            message: "A message",
            committer: actor,
          )
          puts "Created commit: #{commit.oid}" if @debug

          (0...@statuses).each do
            status = Seeds::Objects::Status.create(
              repo: repo,
              sha: commit.oid,
              state: [:success, :error, :failure, :pending].sample,
            )
            puts "Created status: #{status.state}" if @debug
          end
        end

        # create some refs for each repository
        (0...@refs_per_repository).each do |i|
          ref = Seeds::Objects::Git::Ref.find_or_create_branch_ref(
            repo: repo,
            ref_name: "branch-#{i}",
            target_ref_name: repo.default_branch
          )
          puts "Created ref: #{ref.name}" if @debug
        end

        (0...@issues_per_repository).each do
          issue = Seeds::Objects::Issue.create(
            repo: repo,
            actor: actor,
          )
          puts "Created issue: #{issue.number}" if @debug

          (0...@comments_per_issue).each do
            comment = Seeds::Objects::IssueComment.create(
              issue: issue,
              user: actor,
            )
            puts "Created comment: #{comment.body}" if @debug
          end

          (0...@issue_links).each do
            issue_link = Seeds::Objects::IssueLink.create(
              current_issue: issue,
              # we can't link a pull request as a tracked issue, and we can't link an issue to itself
              target_issue: Issue.where(pull_request_id: nil).where.not(id: issue.id).order("RAND()").first,
              repo: repo,
              actor: actor,
            )
            puts "Created issue link: #{issue_link.source_issue.number} -> #{issue_link.target_issue.number}" if @debug
          end

          (0...@issue_types).each do
            begin
              issue_type = Seeds::Objects::IssueType.create(
                owner: Organization.first,
                name: Faker::Lorem.word,
                description: Faker::Lorem.sentence,
                color: [:green, :red, :blue, :yellow].sample,
              )
              puts "Created issue type: #{issue_type.name}" if @debug
            rescue Seeds::Objects::CreateFailed => e
              puts e.message if @debug
              break
            end
          end
        end

        (0...@pull_requests_per_repository).each do
          pr = Seeds::Objects::PullRequest.create(
            repo: repo,
            committer: actor,
          )
          puts "Created pull request: #{pr.number}" if @debug

          (0...@reviews_per_pull_request).each do
            review = Seeds::Objects::PullRequestReview.create(
              pull_request: pr,
              user: actor,
            )
            puts "Pull request review created with body: #{review.body}" if @debug

            (0...@review_comments_per_pull_request).each do
              comment = Seeds::Objects::PullRequestReviewComment.create(
                user: actor,
                pull_request_review: review,
              )
              puts "Created pull request review comment: #{comment.body}" if @debug
            end
          end
        end

        (0...@releases).each do |i|
          release = Seeds::Objects::Release.create(
            repo: repo,
            tag_name: "v1.0." + i.to_s,
          )
          puts "Created release: #{release.tag_name}" if @debug

          (0...@releases_assets).each do
            asset = Seeds::Objects::Release.create_asset(release)
            puts "Created release asset: #{asset.name}" if @debug
          end
        end

        (0...@memex_projects).each do
          Seeds::Objects::MemexProject.create
        end

        # create MemexProjectColumns on random MemexProjects
        (0...@memex_project_columns).each do
          Seeds::Objects::MemexProjectColumn.create_non_default_columns(memex_project: MemexProject.all.sample)
        end

        # Create one of each per project items requested, select a random Issue to use as the issue_or_pull
        (0...@memex_project_items).each do
          Seeds::Objects::MemexProjectItem.create_draft_issue(creator: actor)
          Seeds::Objects::MemexProjectItem.create_issue_or_pull(creator: actor, issue_or_pull: Issue.all.sample)
        end

        # Add all default workflows to every memex project -- note this is not parameterized in the runner
        MemexProject.all.each do |memex_project|
          Seeds::Objects::MemexProjectWorkflow.add_all_default_workflows(memex_project: memex_project, creator: actor)
        end

        # Add Milestones
        (0...@milestones_per_repository).each do
          Seeds::Objects::Milestone.create(created_by: actor, repository: repo)
          puts "Created milestones for #{repo.full_name}" if @debug
        end

        # Add repository advisories
        (0...@repository_advisories).each do
          Seeds::Objects::RepositoryAdvisory.create(user: actor, repo: repo)
          puts "Created repository advisories for #{repo.full_name}" if @debug
        end

        # Add repository rulesets
        (0...@repository_rulesets).each do |i|
          ruleset = Seeds::Objects::Ruleset.create(source: repo, name: "foo #{i}")
          puts "Created repository ruleset #{ruleset.name} for #{repo.full_name}" if @debug
        end
      end

      def self.set_options(options)
        @debug = options[:debug] || false
        @size = options[:size] || "small"
        @config = options[:config] || {}
        @print_config = options[:print_config] || false

        # Set the default options for the size
        case @size
        when "small"
          self.set_small_options
        when "medium"
          self.set_medium_options
        when "large"
          self.set_large_options
        else
          raise "Invalid size: #{@size}"
        end

        # Override the default options with any provided in the config
        if options[:config].present?
          config = JSON.parse(options[:config], symbolize_names: true)
          config.each do |key, value|
            instance_variable_set("@#{key}", value)
          end
        end

        # Print the configuration
        puts "Configuration:"
        instance_variables.each do |var|
          puts "  #{var[1..-1]}: #{instance_variable_get(var).inspect}" if ![:@debug, :@size, :@config, :@print_config].include?(var)
        end
      end

      def self.set_small_options
        @organizations = 1
        @users = 1
        @teams = 1
        @repositories_per_organization = 1
        @repositories_per_user = 1
        @repository_advisories = 1
        @repository_rulesets = 1
        @roles = 1
        @labels_per_repository = 1
        @commits_per_repository = 1
        @statuses = 1
        @issues_per_repository = 1
        @pull_requests_per_repository = 1
        @comments_per_issue = 1
        @reviews_per_pull_request = 1
        @review_comments_per_pull_request = 1
        @refs_per_repository = 1
        @releases = 1
        @releases_assets = 1
        @gists_per_user = 1
        @comments_per_gist = 1
        @memex_projects = 1
        @memex_project_columns = 1
        @memex_project_items = 1
        @milestones_per_repository = 1
        @oauth_applications_per_organization = 1
        @issue_links = 1
        @issue_types = 1
        @check_annotations = 1
        @check_runs = 1
        @check_suites = 1
        @commits = 1
        @commit_comments = 1
        @deployments = 1
        @discussions = 1
        @discussion_posts = 1
        @pushes = 1
      end

      def self.set_medium_options
        @organizations = 10
        @users = 50
        @teams = 10
        @repositories_per_organization = 5
        @repositories_per_user = 2
        @repository_advisories = 1
        @repository_rulesets = 1
        @roles = 1
        @labels_per_repository = 2
        @commits_per_repository = 5
        @statuses = 5
        @issues_per_repository = 2
        @pull_requests_per_repository = 2
        @comments_per_issue = 1
        @reviews_per_pull_request = 1
        @review_comments_per_pull_request = 1
        @refs_per_repository = 1
        @releases = 1
        @releases_assets = 1
        @gists_per_user = 1
        @comments_per_gist = 1
        @memex_projects = 10
        @memex_project_columns = 1
        @memex_project_items = 1
        @milestones_per_repository = 1
        @oauth_applications_per_organization = 1
        @issue_links = 1
        @issue_types = 1
        @check_annotations = 1
        @check_runs = 100
        @check_suites = 10
        @commits = 100
        @commit_comments = 5
        @deployments = 1
        @discussions = 10
        @discussion_posts = 10
        @pushes = 50
      end

      def self.set_large_options
        @organizations = 5000
        @users = 25000
        @teams = 10000
        @repositories_per_organization = 5
        @repositories_per_user = 2
        @repository_advisories = 100
        @repository_rulesets = 20000
        @roles = 1000
        @labels_per_repository = 2
        @commits_per_repository = 2
        @statuses = 2
        @issues_per_repository = 2
        @pull_requests_per_repository = 2
        @comments_per_issue = 1
        @reviews_per_pull_request = 1
        @review_comments_per_pull_request = 1
        @refs_per_repository = 2
        @releases = 1
        @releases_assets = 1
        @gists_per_user = 1
        @comments_per_gist = 1
        @memex_projects = 1
        @memex_project_columns = 1
        @memex_project_items = 1
        @milestones_per_repository = 1
        @oauth_applications_per_organization = 1
        @issue_links = 1
        @issue_types = 1
        @check_annotations = 1
        @check_runs = 100000
        @check_suites = 100000
        @commits = 100000
        @commit_comments = 1
        @deployments = 1
        @discussions = 25000
        @discussion_posts = 10000
        @pushes = 100000
      end
    end
  end
end
