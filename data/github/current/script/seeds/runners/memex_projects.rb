# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class MemexProjects < Seeds::Runner
      MEGA_ITEMS_DEFAULT = 500
      P_50_ITEMS_DEFAULT = 100
      P_99_ITEMS_DEFAULT = 1000

      def self.help
        <<~HELP
        Create sample Memex Projects
        HELP
      end

      def self.run(options = {})
        require_relative "./tracked_issues"
        require_relative "../data/memex/memex_seed_data"
        require "ruby-progressbar"

        item_count = get_item_count(options)

        seed = options[:seed] || 0

        if seed > 0
          puts "Using seed '#{seed}' for generating memex project"
          srand(seed)
        else
          seed = Random.new_seed
          puts "Assigning seed '#{seed}' for generating memex project"
          srand(seed)
        end

        creator = Seeds::Objects::User.monalisa

        project_owner = find_project_owner(options)

        project = Seeds::Objects::MemexProject.create(owner: project_owner, creator: creator)
        project.save!
        puts "Created project: #{GitHub.url}#{project.url}"

        if options[:p50] || options[:p99]
          Seeds::Objects::MemexProjectColumn.create_non_default_columns(memex_project: project)
          text_column = project.columns.find(&:text?)
          number_column = project.columns.find(&:number?)
          date_column = project.columns.find(&:date?)
          single_select_column = project.columns.find { |c| !c.status? && c.single_select? }
          iteration_column = project.columns.find(&:iteration?)
        end

        status_column = project.status_column

        project.columns.each do |column|
          # We don't yet assign values to these columns in this seed script, so leave them hidden by default.
          next if column.linked_pull_requests? || column.reviewers?

          project.default_view.make_column_visible!(column)
        end

        repositories_set = [
          Seeds::Objects::Repository.create(owner_name: project_owner.login, setup_master: true, is_public: true),
          Seeds::Objects::Repository.create(owner_name: project_owner.login, setup_master: true, is_public: true),
          Seeds::Objects::Repository.create(owner_name: project_owner.login, setup_master: true, is_public: false),
          Seeds::Objects::Repository.create(owner_name: project_owner.login, setup_master: true, is_public: false),
        ]
        puts "Created repositories: #{repositories_set.map(&:name_with_display_owner).to_sentence}"

        assign_labels_to_repositories(repositories_set)

        memex_data = Seeds::Data::MemexSeedData.load
        project_users = memex_data.users_data

        assignees_set = project_users.values.map do |user|
          Seeds::Objects::User.create(login: user[:user_name])
        end

        if project_owner.type == "Organization"
          add_users_to_employees_team(assignees_set, project_owner)
        end

        assign_milestones_to_repositories(repositories_set, assignees_set.sample)

        # Watch out for the 👻s
        # Eat all the 🍒 🍓 🍊 🍋 🍍 🍇 🍉 🍌 🍐 🍎 🍏 🍑 🍈 🍒 🍓 🍊 🍋 🍍 🍇 🍉 🍌 🍐 🍎 🍏 🍑 🍈
        progress = ProgressBar.create(
          title: "creating items",
          total: item_count,
          format: "%a %b\u{15E7}%i %p%% %t",
          progress_mark: " ",
          remainder_mark: "\u{FF65}",
        ) if Rails.env.development? # let's not spam in test
        GitHub::RateLimitedCreation.disable_content_creation_rate_limits do
          if options[:tracking]
            puts "Creating a Memex Project containing a tracking issue"
            repo = repositories_set.sample
            return tracking_issue(project: project, repo_name: repo.nwo)
          end

          item_count.times do
            progress.increment if Rails.env.development? # let's not spam in test
            repo = repositories_set.sample
            actor = assignees_set.sample

            assignees = assignees_set.sample(random_number(1..3))
            issue_labels = labels.sample(random_number(1..3))
            milestone_index = random_number(0..1)

            # choose one of six random actions to populate the table
            rand = random_number(0..5)

            case rand
            when 0 # draft issue
              memex_item = create_draft_issue(project)
            when 1 # open issue
              memex_item = create_issue(
                project: project,
                repo: repo,
                actor: actor,
                state: "open",
                assignees: assignees,
                labels: issue_labels,
                milestone_index: milestone_index
              )
            when 2 # open pull request
              memex_item = create_pull_request(
                project: project,
                repo: repo,
                actor: actor,
                state: "open",
                assignees: assignees,
                labels: issue_labels,
                milestone_index: milestone_index
              )
            when 3 # closed issue
              memex_item = create_issue(
                project: project,
                repo: repo,
                actor: actor,
                state: "closed",
                assignees: assignees,
                labels: issue_labels,
                milestone_index: milestone_index
              )
            when 4 # merged pull request
              memex_item = create_pull_request(
                project: project,
                repo: repo,
                actor: actor,
                state: "merged",
                assignees: assignees,
                labels: issue_labels,
                milestone_index: milestone_index
              )
            when 5 # closed pull request
              memex_item = create_pull_request(
                project: project,
                repo: repo,
                actor: actor,
                state: "closed",
                assignees: assignees,
                labels: issue_labels,
                milestone_index: milestone_index
              )
            end

            assign_value_to_single_select_column(status_column, memex_item, actor)

            if text_column
              assign_value_to_text_column(text_column, memex_item, actor)
            end

            if number_column
              assign_value_to_number_column(number_column, memex_item, actor)
            end

            if date_column
              assign_value_to_date_column(date_column, memex_item, actor)
            end

            if single_select_column
              assign_value_to_single_select_column(single_select_column, memex_item, actor)
            end

            if iteration_column
              assign_value_to_iteration_column(iteration_column, memex_item, actor)
            end
          end

          puts "Added #{item_count} item(s) to project '#{project.title}'"
        end
      end

      def self.find_project_owner(options)
        return Seeds::Objects::Organization.github unless options[:owner]

        project_owner = options[:owner]

        existing_organization = Organization.find_by_login(project_owner)

        return existing_organization if existing_organization

        existing_user = User.find_by_login(project_owner)

        return existing_user if existing_user

        abort "Project owner not found: #{project_owner}"
      end

      def self.add_users_to_employees_team(users, org)
        team = Seeds::Objects::Team.create!(org: org, name: "Employees")

        users.each do |user|
          team.add_member(user)
          puts "Added #{user.display_login} to #{org.display_login}'s #{team.name} team"
        end
      end

      def self.assign_labels_to_repositories(repos)
        repos.each do |repo|
          repo.labels.destroy_all
          labels.each do |hash|
            repo.labels.create(hash)
          end
          puts "Created #{labels.size} label(s) for #{repo.name_with_display_owner}"
        end
      end

      def self.assign_milestones_to_repositories(repos, actor)
        repos.each do |repo|
          repo.milestones.create(title: "Open milestone", state: "open", created_by: actor)
          repo.milestones.create(title: "Closed milestone", state: "closed", created_by: actor)
          puts "Created milestones for #{repo.name_with_display_owner}"
        end
      end

      def self.create_draft_issue(project)
        Seeds::Objects::MemexProjectItem.create_draft_issue(
          memex_project: project,
          title: random_title
        )
      end

      def self.create_issue(project:, repo:, actor:, state:, assignees:, labels:, milestone_index:)
        issue = Seeds::Objects::Issue.create(
          repo: repo,
          actor: actor,
          title: random_title,
          body: random_body,
          state: state,
        )

        if assignees.any?
          issue.assignees = assignees
          issue.save!
        end

        if labels.any?
          labels.each do |label|
            l = issue.repository.labels.find_by_name(label[:name])
            issue.labels.push(l) unless l.nil?
          end
          issue.save!
        end

        if milestone_index.present?
          m = issue.repository.milestones[milestone_index]
          issue.milestone = m unless m.nil?
          issue.save!
        end

        Seeds::Objects::MemexProjectItem.create_issue_or_pull(
          memex_project: project,
          issue_or_pull: issue
        )
      end

      def self.create_pull_request(project:, repo:, actor:, state:, assignees:, labels:, milestone_index:)
        pull = Seeds::Objects::PullRequest.create(
          repo: repo,
          committer: actor,
          title: random_title
        )

        issue = pull.issue

        if assignees.any?
          issue.assignees = assignees
          issue.save!
        end

        if labels.any?
          labels.each do |label|
            l = issue.repository.labels.find_by_name(label[:name])
            issue.labels.push(l) unless l.nil?
          end
          issue.save!
        end

        if milestone_index.present?
          m = issue.repository.milestones[milestone_index]
          issue.milestone = m unless m.nil?
          issue.save!
        end

        if state == "merged"
          pull.merge(actor)
        elsif state == "closed"
          pull.close(actor)
        end

        Seeds::Objects::MemexProjectItem.create_issue_or_pull(
          memex_project: project,
          issue_or_pull: pull
        )
      end

      def self.tracking_issue(project:, repo_name:)
        issue = Seeds::Runner::TrackedIssues.run(repo_name: repo_name)
        Seeds::Objects::MemexProjectItem.create_issue_or_pull(
          memex_project: project,
          issue_or_pull: issue
        )
      end

      def self.random_number(range)
        rand(range)
      end

      def self.random_title
        rand = random_number(0..5)
        case rand
        when 0
          Faker::GreekPhilosophers.quote
        when 1
          Faker::Movies::BackToTheFuture.quote
        when 2
          Faker::Movies::PrincessBride.quote
        when 3
          Faker::Movies::HitchhikersGuideToTheGalaxy.quote
        when 4
          Faker::Quotes::Shakespeare.romeo_and_juliet_quote
        when 5
          Faker::TvShows::DrWho.quote
        end
      end

      def self.random_body
        Faker::Lorem.sentence(word_count: 10, supplemental: true, random_words_to_add: 4)
      end

      def self.labels
        [
          {
            name: "bug :bug:",
            color: "efe24f",
            description: "Something isn't working",
          },
          {
            name: "documentation :memo:",
            color: "c64345",
            description: "Improvements or additions to documentation",
          },
          {
            name: ":cactus: deferred timeline",
            color: "fef2c0",
            description: "This issue or pull request already exists",
          },
          {
            name: "enhancement :clock1:",
            color: "e81086",
            description: "New feature or request",
          },
          {
            name: "fun size 🍫",
            color: "f29c24",
            description: "Extra attention is needed",
          },
          {
            name: "good first issue :mountain:",
            color: "7057ff",
            description: "Good for newcomers",
          },
          {
            name: ":open_mouth: question",
            color: "f9b8d8",
            description: "Further information is requested",
          },
          {
            name: "🚒 wontfix",
            color: "5891ce",
            description: "This will not be worked on",
          },
        ]
      end

      def self.assign_value_to_single_select_column(column, memex_item, actor)
        options = column.settings["options"]
        rand = random_number(0..options.length)
        if rand != options.length
          value = options[rand]["id"]
          memex_item.set_column_value(column, value, actor)
        end
      end

      def self.assign_value_to_iteration_column(column, memex_item, actor)
        options = column.settings_iteration_ids
        rand = random_number(0..options.length)
        if rand != options.length
          value = options[rand]
          result = memex_item.set_column_value(column, value, actor)
        end
      end

      def self.assign_value_to_text_column(column, memex_item, actor)
        value = Faker::Lorem.word
        memex_item.set_column_value(column, value, actor)
      end

      def self.assign_value_to_number_column(column, memex_item, actor)
        value = Faker::Number.between(from: 1, to: 1000000)
        memex_item.set_column_value(column, value, actor)
      end

      def self.assign_value_to_date_column(column, memex_item, actor)
        value = Faker::Date.between(from: 1.year.ago, to: 1.year.from_now).to_formatted_s(:short)
        memex_item.set_column_value(column, value, actor)
      end

      def self.get_item_count(options)
        if options[:mega]
          MEGA_ITEMS_DEFAULT
        elsif options[:p50]
          P_50_ITEMS_DEFAULT
        elsif options[:p99]
          P_99_ITEMS_DEFAULT
        else
          options[:count] || 0
        end
      end
    end
  end
end
