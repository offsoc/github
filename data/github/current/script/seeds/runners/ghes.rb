# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

# This runner is used to seed test datasets for GHES.
# It is not used for seeding production data and will only run in the enterprise runtime.
module Seeds
  class Runner
    class Ghes < Seeds::Runner
      @debug = false
      @admin_user = nil
      @organizations = 0
      @users = 0
      @repositories_per_organization = 0
      @repositories_per_user = 0
      @labels_per_repository = 0
      @commits_per_repository = 0
      @issues_per_repository = 0
      @issue_links = 0
      @issue_types = 0
      @pull_requests_per_repository = 0
      @comments_per_issue = 0
      @reviews_per_pull_request = 0
      @review_comments_per_pull_request = 0
      @refs_per_repository = 0
      @gists_per_user = 0
      @comments_per_gist = 0
      @memex_projects = 0
      @memex_project_columns = 0
      @memex_project_cards = 0
      @milestones_per_repository = 0
      @oauth_applications_per_organization = 0

      def self.help
        <<~HELP
        Seed data to a GHES instance for testing
        HELP
      end

      def self.run(options = {})
        @admin_user = User.find_by(login: "ghe-admin") || Seeds::Objects::User.monalisa
        puts "Admin user: #{@admin_user.login}" if @debug
        raise "Admin user not found" unless @admin_user

        set_options(options)

        puts "Seeding GHES data..."
        options.each do |key, value|
          puts "Seeding #{value} #{key}"
        end

        if @issue_links > 0
          repo = Seeds::Objects::Repository.create(owner_name: @admin_user.login, repo_name: "starter-repo", setup_master: true)
          issue = Seeds::Objects::Issue.create(repo: repo, actor: @admin_user)
          puts "Created issue #{issue.owner}/#{issue.name} for linking" if @debug
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
        (0...@repositories_per_organization).each do |i|
          fake = Faker::Hacker
          name = "#{fake.adjective}-#{fake.noun}-#{i}".gsub(" ", "-")
          repo = Seeds::Objects::Repository.create(
            owner_name: org.login,
            repo_name: name,
            setup_master: true,
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
            issue_type = Seeds::Objects::IssueType.create(
              owner: Organization.first,
              name: Faker::Lorem.word,
              description: Faker::Lorem.sentence,
              color: [:green, :red, :blue, :yellow].sample,
            )
            puts "Created issue type: #{issue_type}" if @debug
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
      end

      def self.set_options(options)
        # TODO(elee): dry this up with the runner, set options and instance variables
        @debug = options[:debug] || false
        @organizations = options[:organizations] || 1
        @users = options[:users] || 1
        @repositories_per_organization = options[:repositories_per_organization] || 1
        @repositories_per_user = options[:repositories_per_user] || 1
        @labels_per_repository = options[:labels_per_repository] || 1
        @commits_per_repository = options[:commits_per_repository] || 1
        @issues_per_repository = options[:issues_per_repository] || 1
        @pull_requests_per_repository = options[:pull_requests_per_repository] || 1
        @comments_per_issue = options[:comments_per_issue] || 1
        @reviews_per_pull_request = options[:reviews_per_pull_request] || 1
        @review_comments_per_pull_request = options[:review_comments_per_pull_request] || 1
        @refs_per_repository = options[:refs_per_repository] || 1
        @gists_per_user = options[:gists_per_user] || 1
        @comments_per_gist = options[:comments_per_gist] || 1
        @memex_projects = options[:memex_projects] || 1
        @memex_project_columns = options[:memex_project_columns] || 1
        @memex_project_items = options[:memex_project_items] || 1
        @milestones_per_repository = options[:milestones_per_repository] || 1
        @oauth_applications_per_organization = options[:oauth_applications_per_organization] || 1
        @issue_links = options[:issue_links] || 1
        @issue_types = options[:issue_types] || 1

        if @commits_per_repository <= 0 && @pull_requests_per_repository > 0
          puts "Pull requests require at least one commit per repository. Setting commits_per_repository to 1."
          @commits_per_repository = 1
        end
      end
    end
  end
end
