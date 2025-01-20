# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class IssuesReact < Seeds::Runner

      def self.help
        <<~HELP
        Create sample data for hyperlist web.
        Specify one or many of the following parameters:
        --tiny -> to create a tiny dataset
        --small -> to create a small dataset
        --medium -> to create a medium dataset
        --large -> to create a small dataset
        HELP
      end

      def self.run(options = {})
        require_relative "./check_run"

        seed = options[:seed] || 0

        if !(options[:minimal] || options[:tiny] || options[:small] || options[:medium] || options[:large])
          puts "Option minimal/tiny/small/medium/large not specified, defaulting to small"
        end

        sizes = if options[:minimal]
          { labels: 1, issues: 6, pulls: 0, teams: 0, users: 1, milestones: 2 }
        elsif options[:tiny]
          { labels: 5, issues: 10, pulls: 2, teams: 1, users: 10, milestones: 5 }
        elsif options[:medium]
          { labels: 50, issues: 250, pulls: 250, teams: 10, users: 10, milestones: 5 }
        elsif options[:large]
          { labels: 500, issues: 2500, pulls: 2500, teams: 50, users: 10, milestones: 5 }
        else # small
          { labels: 10, issues: 30, pulls: 5, teams: 3, users: 10, milestones: 5 }
        end

        if seed > 0
          puts "Using seed '#{seed}'"
          srand(seed)
        else
          seed = Random.new_seed
          puts "Assigning seed '#{seed}'"
          srand(seed)
        end

        create_shortcuts

        org = Seeds::Objects::Organization.github

        assignees_set = []
        sizes[:users].times { assignees_set << Seeds::Objects::User.create(login: Seeds::DataHelper.random_username) }
        add_users_to_org(users: assignees_set, org: org)

        # create random teams
        puts "Creating #{sizes[:teams]} teams"
        sizes[:teams].times do |i|
          team = T.must(Seeds::Objects::Team.create!(
            org: org,
          ))
          team.add_member(Seeds::Objects::User.monalisa)

          # create team shortcuts
          create_team_shortcuts(team)
          # select the first 3 teams
          if i < 3
            monalisa = Seeds::Objects::User.monalisa
            monalisa.dashboard.selected_teams << team
          end
        end

        reviewer_team_set = org.teams.sample(5)
        reviewer_user_set = org.members.sample(5)

        now = Time.now
        yesterday = Time.now - (60 * 60 * 24)
        check_run_options_set = [
          { status: "completed", conclusion: "success", started_at: yesterday, completed_at: now },
          { status: "completed", conclusion: "neutral", started_at: yesterday, completed_at: nil },
          { status: "completed", conclusion: "failure", started_at: yesterday, completed_at: now },
          { status: "in_progress", conclusion: nil, started_at: yesterday, completed_at: nil }
        ]

        # setup templates for monalisa/smile
        smile_repo = ::Repository.find_by(name: "smile", owner_login: "monalisa")
        add_templates_to_repository(repo: smile_repo) if smile_repo

        Issue.transaction do
          Label.transaction do
            repository = create_repository(org: org, repo_name: "writable")
            seed_repository(
              repo: repository,
              assignees_set: assignees_set,
              labels: create_labels(label_count: sizes[:labels]),
              issues_count: sizes[:issues],
              pulls_count: sizes[:pulls],
              user: Seeds::Objects::User.monalisa,
              reviewer_team_set: reviewer_team_set,
              reviewer_user_set: reviewer_user_set,
              check_run_options_set: check_run_options_set,
              milestones: sizes[:milestones],
            )
          end
        end

        # create a repo in another organization to have read only issues
        user = Seeds::Objects::User.create(login: Seeds::DataHelper.random_username)
        org = Seeds::Objects::Organization.create(login: "readonly-org", admin: user)
        public_readonly_repo = ::Seeds::Objects::Repository.create_with_nwo(
          nwo: "readonly-org/readonly",
          setup_master: true,
          is_public: false
        )
        team = T.must(::Team.find_by(name: "Employees", organization: org))
        team.add_member(Seeds::Objects::User.monalisa)

        # create some read only teams
        sizes[:teams].times do |i|
          team = T.must(Seeds::Objects::Team.create!(
            org: org,
          ))

          # create team shortcuts
          create_team_shortcuts(team)
          # select the first 3 teams
          if i < 1
            monalisa = Seeds::Objects::User.monalisa
            monalisa.dashboard.selected_teams << team
          end
        end

        # create a readonly repository
        if options[:minimal]
          seed_repository(
            repo: public_readonly_repo,
            assignees_set: assignees_set,
            labels: create_labels(label_count: 2),
            issues_count: 1,
            pulls_count: 0,
            user: user,
            reviewer_team_set: reviewer_team_set,
            reviewer_user_set: reviewer_user_set,
            check_run_options_set: check_run_options_set,
            milestones: sizes[:milestones],
          )
        else
          seed_repository(
            repo: public_readonly_repo,
            assignees_set: assignees_set,
            labels: create_labels(label_count: 2),
            issues_count: 5,
            pulls_count: 5,
            user: user,
            reviewer_team_set: reviewer_team_set,
            reviewer_user_set: reviewer_user_set,
            check_run_options_set: check_run_options_set,
            milestones: sizes[:milestones],
          )
        end
      end

      def self.create_team_shortcuts(team)
        team.dashboard = TeamDashboard.create!(team: team) unless team.dashboard
        shortcuts = [
          { title: "Team Open Issues", query: "state:open" },
          { title: "Team Closed Issues", query: "state:closed" },
          { title: "Team New issues", query: "state:open sort:updated-desc" },
        ]
        shortcuts.each do |shortcut|
          Seeds::Objects::TeamShortcut.create(
            dashboard: team.dashboard,
            name: shortcut[:title],
            query: shortcut[:query]
          )
        end
      end

      def self.create_shortcuts
        monalisa = Seeds::Objects::User.monalisa
        monalisa.dashboard = UserDashboard.create!(user: monalisa) unless monalisa.dashboard

        shortcuts = [
          { title: "Open Issues", query: "state:open" },
          { title: "Closed Issues", query: "state:closed" },
          { title: "Assigned to me", query: "state:open assignee:#{monalisa.login}" },
          { title: "Created by me", query: "state:open author:#{monalisa.login}" },
          { title: "Mentioning me", query: "state:open mentions:#{monalisa.login}" },
          { title: "Old issues", query: "state:open sort:updated-asc" },
          { title: "New issues", query: "state:open sort:updated-desc" },
        ]
        shortcuts.each do |shortcut|
          shortcut_exists = \
            ::SearchShortcut.where(dashboard_id: monalisa.dashboard.id, name: shortcut[:title]).exists?
          next if shortcut_exists

          Seeds::Objects::Shortcut.create(
            dashboard: monalisa.dashboard,
            name: shortcut[:title],
            query: shortcut[:query]
          )
        end
      end

      def self.unique_label_name
        @@names ||= Set.new

        label_name_generator = lambda do
          candidate = [Faker::Creature::Animal.name, Faker::Sport.sport].sample
          candidate[0, Labelable::NAME_MAX_LENGTH]
        end

        name = label_name_generator.call
        while @@names.include?(name)
          name = label_name_generator.call
        end
        @@names << name

        name
      end

      # Returns Array of hashes with label attributes, example:
      #  [
      #    {name: "bug", color: "red"},
      #    {name: "wontfix", color: "black", description: "Known issue, won't fix"}
      #  ]
      def self.create_labels(label_count:)
        labels = []
        label_count.times do
          labels << {
            name: unique_label_name,
            color: Faker::Color.hex_color[1..-1],
            description: Faker::Lorem.sentence,
          }
        end
        # add a label without a description
        labels << {
          name: unique_label_name,
          color: Faker::Color.hex_color[1..-1],
        }
        labels
      end

      def self.create_repository(org:, repo_name: nil)
        repo = Seeds::Objects::Repository.create(owner_name: org, setup_master: true, is_public: false, repo_name: repo_name)
        puts "=> #{GitHub.url}/#{repo.name_with_display_owner}"
        repo
      end

      # Seeds given repository with issues and PRs.
      #
      # assignees_set - Array of Users
      # check_run_options_set - Hash of options for creating check runs
      # issues_count - Integer, number of issues to create
      # labels - Array of hashes with label attributes
      # pulls_count - Integer, number of PRs to create
      # repo - Repository
      # reviewer_team_set - Array of Teams
      # reviewer_user_set - Array of Users
      # user - User
      #
      # Returns Repository
      def self.seed_repository(
        assignees_set:,
        check_run_options_set:,
        issues_count:,
        labels:,
        pulls_count:,
        repo:,
        reviewer_team_set:,
        reviewer_user_set:,
        user:,
        milestones:
      )
        puts "Setting up repository #{repo.name_with_display_owner} with #{issues_count} issues, #{pulls_count} " \
          "pulls, #{labels.count} labels"

        assign_labels_to_repository(repo: repo, labels: labels)

        GitHub::RateLimitedCreation.disable_content_creation_rate_limits do
          puts "Adding issues for bulk action testing"
          # create issues for bulk operations
          [
            { title: "issue-type-unset-by-selection", labels: [], assignees: [] },
            { title: "issue-type-set-by-selection", labels: [], assignees: [] },
            { title: "issue-type-set-by-search", labels: [], assignees: [] },
            { title: "milestone-set-by-selection", labels: [], assignees: [] },
            { title: "milestone-set-by-search", labels: [], assignees: [] },
            { title: "project-set-by-selection", labels: [], assignees: [] },
            { title: "project-set-by-search", labels: [], assignees: [] },
            { title: "labels-set-by-selection", labels: [], assignees: [] },
            { title: "labels-set-by-query", labels: [], assignees: [] },
            # We need to uncomment this once we fix the race condition in finding labels
            # { title: "labels-remove-by-selection", labels: [bug_label, enhancement_label], assignees: [] },
            { title: "assignees-set-by-selection", labels: [], assignees: [] },
            { title: "assignees-remove-by-selection", labels: [], assignees: [Seeds::Objects::User.monalisa] },
            { title: "assignees-set-by-search", labels: [], assignees: [] },
          ].each do |action|
            2.times do |index|
              Seeds::Objects::Issue.create(repo: repo, actor: Seeds::Objects::User.monalisa, **(action.merge({ title: action[:title] + index.to_s })))
            end
          end

          has_issue_with_labels = T.let(false, T::Boolean)

          issues_count.times do |i|
            actor = assignees_set.sample

            assignees = assignees_set.sample(rand(0..5))
            issue_labels = labels.sample(rand(0..5))
            if issue_labels.count > 0
              has_issue_with_labels = true
            end
            # make the first issue have 30 comments so that we can test pagination
            number_of_comments = i == 0 ? 30 : rand(0..10)

            puts "Creating issue #{i + 1} with #{number_of_comments} comments, #{assignees.count} assignees, " \
              "#{issue_labels.count} labels"

            state = i <= issues_count * 0.6 ? "open" : "closed"
            state_reason = state == "closed" && rand(0..1) == 1 ? "not_planned" : ""

            assigned_to_monalisa = rand(0..1) == 1
            assignees << Seeds::Objects::User.monalisa

            create_issue(
              repo: repo,
              actor: actor,
              state: state,
              state_reason: state_reason,
              assignees_set: assignees_set,
              assignees: assignees,
              labels: issue_labels,
              number_of_comments: number_of_comments,
            )
          end

          unless has_issue_with_labels
            puts "Creating an issue with labels to ensure at least one exists"
            create_issue(
              repo: repo,
              actor: assignees_set.sample,
              state: "open",
              state_reason: "",
              assignees_set: assignees_set,
              assignees: assignees_set.sample(rand(0..5)),
              labels: labels,
              number_of_comments: 10,
            )
          end

          puts "Creating an issue for timeline tests"
          create_issue(
            repo: repo,
            actor: Seeds::Objects::User.monalisa,
            state: "open",
            state_reason: "",
            assignees_set: assignees_set,
            assignees: [Seeds::Objects::User.monalisa],
            labels: labels.sample(rand(0..5)),
            number_of_comments: 200,
            for_timeline: true,
          )

          pulls_count.times do |i|
            creator = assignees_set.sample
            assignees = assignees_set.sample(rand(0..2))
            pull_labels = labels.sample(rand(0..5))
            check_run_options = check_run_options_set.sample
            has_checks = rand(0..1) == 1

            # Ensure creator is not assigned as a reviewer
            reviewer_user_set.delete(creator)
            reviewer_user_ids = reviewer_user_set.sample(rand(0..5)).map(&:id)
            reviewer_team_ids = reviewer_team_set.sample(rand(0..5)).map(&:id)
            reviewer_ids = reviewer_user_ids + reviewer_team_ids
            review_state = PullRequest.reviewable_states.keys.sample

            # Make the first pull have 30 comments so that we can test timeline pagination
            number_of_comments = i == 0 ? 30 : rand(0..10)

            puts <<~MSG.squish
              Creating PR #{i + 1} with #{reviewer_ids.count} reviewers, #{number_of_comments} comments,
              #{assignees.count} assignees, #{pull_labels.count} labels#{has_checks ? ", and check suite" : ""}
            MSG

            create_pull(
              assignees: assignees,
              check_run_options: check_run_options,
              creator: creator,
              has_checks: has_checks,
              labels: pull_labels,
              number_of_comments: number_of_comments,
              repo: repo,
              review_state: review_state,
              reviewer_user_ids: reviewer_user_ids,
              reviewer_team_ids: reviewer_team_ids,
              state: %w[open closed merged].sample,
            )
          end

          milestones.times do |i|
            milestone_title = "Milestone #{i}"

            milestone_exists = \
            Milestone.where(repository_id: repo.id, title: milestone_title).exists?
            next if milestone_exists

            puts "Creating milestone #{milestone_title}"

            repo.milestones.create(
              title: milestone_title,
              state: i < 2 ? "closed" : "open",
              created_by: user)
          end

          puts "Creating a memex project with issue for repository"

          issues = repo.issues.take(5)

          issues[0].add_sub_issue!(issues[1], repo.owner.id)
          issues[1].add_sub_issue!(issues[2], repo.owner.id)
          issues[2].add_sub_issue!(issues[3], repo.owner.id)
          issues[3].add_sub_issue!(issues[4], repo.owner.id)

          create_memex_with_issues(project_owner: repo.owner, creator: user, issues: issues)

          puts "Saving repository"
          repo.save!

          puts "Adding issue forms and templates"
          add_templates_to_repository(repo: repo)

          # hack to clear the user contribution cache and make sure it's rebuilt when we run dotcom
          # so that we see user repositories and don't have an empty repository picker
          # the key format is taken from packages/hovercards/app/models/user_ranked/cache.rb
          user_id = Seeds::Objects::User.monalisa.id
          since = 1.year.ago.strftime("%m-%Y")
          GitHub.kv.del("user-ranked:Repository:#{user_id}:#{since}")

          repo
        end
      end

      def self.add_templates_to_repository(repo:)
        return unless repo.commits

        ensure_label_exists(repo: repo, label: { name: "bug", color: Faker::Color.hex_color[1..-1] })
        ensure_label_exists(repo: repo, label: { name: "triage", color: Faker::Color.hex_color[1..-1] })
        ensure_label_exists(repo: repo, label: { name: "template", color: Faker::Color.hex_color[1..-1] })
        ensure_label_exists(repo: repo, label: { name: "form", color: Faker::Color.hex_color[1..-1] })

        commit = repo.commits.create({ message: "Add templates", author: repo.owner }) do |files|
          files.add ".github/ISSUE_TEMPLATE/config.yml", <<~YAML
          blank_issues_enabled: true

          contact_links:
            - name: Slack channel #issues
              url: https://app.slack.com/client/FOO/BAR
              about: Reach us in slack
          YAML
          files.add SecurityPolicy::FILENAME, SecurityPolicy::TEMPLATE
          files.add ".github/ISSUE_TEMPLATE/bugs.md", <<~MARKDOWN
          ---
          name: Bug report (template)
          about: It's a bug in #{repo.nwo}
          title: "[Bug]: "
          labels: ["bug", "triage", "template"]
          assignees:
            - monalisa
          ---
          This is a bug.
          MARKDOWN

          files.add ".github/ISSUE_TEMPLATE/feature-request.md", <<~MARKDOWN
          ---
          name: Feature request (template)
          about: It's a feature in #{repo.nwo}
          title: "[Request]: "
          labels: ["bug", "triage", "template"]
          assignees:
            - monalisa
          ---
          This is a feature request.
          MARKDOWN

          files.add ".github/ISSUE_TEMPLATE/bugs.yml", <<~YAML
          ---
          name: Bug report (form)
          description: File a bug report #{repo.nwo}
          title: "[Bug]: "
          labels: ["bug", "triage", "form"]
          assignees:
            - monalisa
          body:
            - type: markdown
              attributes:
                value: |
                  Thanks for taking the time to fill out this bug report!
            - type: input
              id: contact
              attributes:
                label: Contact Details
                description: How can we get in touch with you if we need more info?
                placeholder: ex. email@example.com
              validations:
                required: false
            - type: textarea
              id: what-happened
              attributes:
                label: What happened?
                description: Also tell us, what did you expect to happen?
                placeholder: Tell us what you see!
                value: "A bug happened!"
              validations:
                required: true
            - type: dropdown
              id: version
              attributes:
                label: Version
                description: What version of our software are you running?
                options:
                  - 1.0.2 (Default)
                  - 1.0.3 (Edge)
              validations:
                required: true
            - type: dropdown
              id: browsers
              attributes:
                label: What browsers are you seeing the problem on?
                multiple: true
                options:
                  - Firefox
                  - Chrome
                  - Safari
                  - Microsoft Edge
            - type: textarea
              id: logs
              attributes:
                label: Relevant log output
                description: Please copy and paste any relevant log output. This will be automatically formatted into code, so no need for backticks.
                render: shell
            - type: checkboxes
              id: terms
              attributes:
                label: Code of Conduct
                description: By submitting this issue, you agree to follow our [Code of Conduct](https://example.com)
                options:
                  - label: I agree to follow this project's Code of Conduct
                    required: true
          YAML
        end

        branch = repo.refs["refs/heads/main"]
        branch.update(commit, repo.owner) if branch
      end

      def self.add_users_to_org(users:, org:)
        team = T.must(::Team.find_by(name: "Employees", organization: org))
        users.each do |user|
          team.add_member(user)
        end
      end

      def self.ensure_label_exists(repo:, label:)
        begin
          repo.labels.create(label) unless repo.labels.where(name: label[:name]).size > 0
        rescue ActiveRecord::RecordNotUnique
          # ignore if this happens
        end
      end

      def self.assign_labels_to_repository(repo:, labels:)
        repo.labels.destroy_all
        labels.each do |hash|
          repo.labels.create(hash)
        end
        repo.save!
      end

      def self.create_issue(repo:, actor:, state:, state_reason:, assignees_set:, assignees:, labels:, number_of_comments:, for_timeline: false)
        issue_title = for_timeline ? "Timeline Test" : Faker::Hacker.say_something_smart
        issue = repo.issues.create(
          user: actor,
          title: issue_title,
          body: Faker::Lorem.paragraph,
          state: state,
          state_reason: state_reason,
        )

        if assignees.any?
          issue.assignees = assignees
        end

        if labels.any?
          labels.each do |label|
            l = issue.repository.labels.find_by_name(label[:name])
            issue.labels.push(l) unless l.nil?
          end
        end

        number_of_comments.times do |i|
          # always have monalisa as the author of the first comment
          # to have activity for this user account
          author = i == 0 ? Seeds::Objects::User.monalisa : assignees_set.sample
          body = for_timeline ? "Comment #{i}\n" : ""
          if !for_timeline
            rand(1..10).times do
              body += Faker::Lorem.paragraph + "\n"
            end
          end
          issue.comments.create(issue: issue, user: author, body: body)
        end
      end

      # Creates PullRequest with key elements rendered in Hyperlist list item
      #
      # assignees - Array of Users (may include creator)
      # check_run_options - Hash of options used to create a check run
      # creator - User
      # has_checks - Boolean for whether this PR has associated check runs
      # labels - Array of hashes with label attributes
      # number_of_comments - Integer number of comments that will be created on the PR
      # repo - Repository
      # review_state - String value for PullRequest#reviewable_state
      # reviewer_user_ids - Array of User ids (excludes creator)
      # reviewer_team_ids - Array of Team ids
      # state - String value for PullRequest#state
      #
      # Returns PullRequest
      def self.create_pull(
        assignees:,
        check_run_options:,
        creator:,
        has_checks:,
        labels:,
        number_of_comments:,
        repo:,
        review_state:,
        reviewer_user_ids:,
        reviewer_team_ids:,
        state:
      )
        # Handle read-only repo, where only monalisa has access
        if !repo.organization.member?(creator)
          creator = Seeds::Objects::User.monalisa
        end

        pull = \
          Seeds::Objects::PullRequest.create(
            base_ref: repo.default_branch_ref,
            committer: creator,
            is_draft: review_state == "draft",
            repo: repo,
            reviewer_user_ids: reviewer_user_ids,
            reviewer_team_ids: reviewer_team_ids,
            title: Faker::Hacker.say_something_smart
          )

        pull.reviewable_state = review_state
        pull.save!

        issue = pull.issue

        if assignees.any?
          issue.assignees = assignees
          issue.save!
        end

        if labels.any?
          labels.each do |label|
            label = repo.labels.find_by_name(label[:name])
            issue.labels.push(label) unless label.nil?
          end
          issue.save!
        end

        possible_commenter_ids = [creator.id] | reviewer_user_ids | assignees.map(&:id)

        number_of_comments.times do |_i|
          commenter = User.find(possible_commenter_ids.sample)
          body = Faker::Lorem.paragraph
          ::Seeds::Objects::IssueComment.create(issue: issue, user: commenter, body: body)
        end

        if has_checks
          launch_github_app = GitHub.launch_github_app || setup_launch_github_app_on(repo)

          # NOTE: We are manually creating a check suite here, because the check suite created by
          # Seeds::Runner::CheckRun is associated with the incorrect head sha, and subsequently
          # does not show up in the PR or hyperlist UI. It's unclear why the Seeds::Runner::CheckRun
          # is not compatible with this script. Once resolved, we should use the runner here instead.
          check_suite = \
            ::CheckSuite.create!(
              github_app: GitHub.launch_github_app,
              repository: pull.head_repository,
              head_sha: pull.head_sha,
              head_branch: pull.head_ref,
            )

          Seeds::Objects::CheckRun.create(
            check_suite,
            completed_at: check_run_options[:completed_at],
            conclusion: check_run_options[:conclusion],
            details_url: GitHub.url,
            name: Faker::Superhero.name,
            repository: check_suite.repository,
            status: check_run_options[:status],
            started_at: check_run_options[:started_at],
          )
        end

        case state
        when "closed"
          pull.close(creator)
        when "merged"
          pull.merge(creator)
        end

        pull
      end

      def self.create_memex_with_issues(project_owner:, creator:, issues:)
        project = Seeds::Objects::MemexProject.create(owner: project_owner, creator: creator)
        project.save!

        issues.each do |issue|
          Seeds::Objects::MemexProjectItem.create_issue_or_pull(
            memex_project: project,
            issue_or_pull: issue
          )
        end
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
            entry_point: :seeds_runners_hyperlist_web_create_actions_app
          )
        end
      end
    end
  end
end
