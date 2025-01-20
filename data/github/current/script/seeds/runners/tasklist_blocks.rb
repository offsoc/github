# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class TasklistBlocks < Seeds::Runner

      def self.help
        <<~HELP
        Create sample data for tasklists. Issues-graph should be running when running this generator.
        --count [NUM] - The number of issues to create.
        --add_percent_to_project [NUM] - Specifies the % of the issues created that should be added to a project.
        HELP
      end

      def self.run(options = {})
        seed = options[:seed] || 0

        count = options[:count] || 0
        add_percent_to_project = options[:add_percent_to_project] || 0

        if seed > 0
          puts "Using seed '#{seed}' for generating tasklist blocks"
          srand(seed)
        else
          seed = Random.new_seed
          puts "Assigning seed '#{seed}' for generating tasklist blocks"
          srand(seed)
        end

        Seeds::Objects::User.monalisa
        org = Seeds::Objects::Organization.github

        # only create a project if we are adding issues to one
        project = if add_percent_to_project > 0
          project = Seeds::Objects::MemexProject.create
          project.save!
          project.default_view.make_column_visible!(project.columns.find(&:tracked_by?))
          project.default_view.make_column_visible!(project.columns.find(&:tracks?))
          project
        end

        repositories = [
          Seeds::Objects::Repository.create(owner_name: org, setup_master: true, is_public: true),
          Seeds::Objects::Repository.create(owner_name: org, setup_master: true, is_public: true),
          Seeds::Objects::Repository.create(owner_name: org, setup_master: true, is_public: false),
          Seeds::Objects::Repository.create(owner_name: org, setup_master: true, is_public: false),
        ]

        assign_labels_to_repositories(repositories)

        assignees = [
          Seeds::Objects::User.create(login: "krkht"),
          Seeds::Objects::User.create(login: "maxbeizer"),
          Seeds::Objects::User.create(login: "nasquasha"),
          Seeds::Objects::User.create(login: "randall-krauskopf"),
          Seeds::Objects::User.create(login: "lmorchard"),
          Seeds::Objects::User.create(login: "nicolleromero"),
          Seeds::Objects::User.create(login: "dewski"),
          Seeds::Objects::User.create(login: "tylerdixon"),
        ]
        add_users_to_org(assignees, org)

        GitHub::RateLimitedCreation.disable_content_creation_rate_limits do
          # For each parent issue we want to create...
          all_created = count.times.flat_map do
            repo = repositories.sample

            # create 0-3 grandchild issues for the first child
            num_grandchildren = random_number(0..3)
            grandchildren = (0..num_grandchildren).map do
              create_random_issue(repo: repo, assignees: assignees)
            end

            # create 1-5 child issues
            num_children = random_number(1..5)
            children = (0..num_children).map do |i|
              # if this is the first child issue, add all of the grandchild issues to it
              create_random_issue(repo: repo, assignees: assignees, tracking_issues: i == 0 ? grandchildren : [])
            end

            # create the parent issue, tracking all children
            parent = create_random_issue(repo: repo, assignees: assignees, tracking_issues: children)
            grandchildren + children + [parent]
          end

          # add a % of all of the items created to a project, but not all of them
          num_items = (add_percent_to_project.to_f / 100.to_f * all_created.length).floor
          all_created.sample(num_items).each do |issue|
            Seeds::Objects::MemexProjectItem.create_issue_or_pull(
              memex_project: project,
              issue_or_pull: issue
            )
          end

          if add_percent_to_project > 0
            puts "Created project '#{project.name}' with #{num_items} items: #{GitHub.url}#{project.url}"
          end
        end

      end

      def self.create_random_issue(tracking_issues: [], repo:, assignees:)
        actor = assignees.sample

        assignees = assignees.sample(random_number(1..3))
        issue_labels = labels.sample(random_number(1..3))

        rand = random_number(0..1)

        body = if tracking_issues.length > 0
          "I am tracking the following issues:\n\n" \
          "```[tasklist]\n" \
          "### #{Faker::Games::SuperSmashBros.stage}\n" \
          "#{tracking_issues.map { |issue| "- [ ] ##{issue.number}" }.join("\n")}\n" \
          "```"
        end

        create_issue(
          repo: repo,
          actor: actor,
          state: random_number(0..1) ? "open" : "closed",
          assignees: assignees,
          labels: issue_labels,
          body: body,
        )
      end

      def self.add_users_to_org(users, org)
        team = ::Team.find_by(name: "Employees", organization: org)

        users.each do |user|
          team.add_member(user)
        end
      end

      def self.assign_labels_to_repositories(repos)
        repos.each do |repo|
          repo.labels.destroy_all
          labels.each do |hash|
            repo.labels.create(hash)
          end
        end
      end

      def self.create_issue(repo:, actor:, state:, assignees:, labels:, body: nil)
        issue = Seeds::Objects::Issue.create(
          repo: repo,
          actor: actor,
          title: random_title,
          body: body || random_body,
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

        issue
      end

      def self.random_number(range)
        rand(range)
      end

      def self.random_title
        rand = random_number(0..5)
        case rand
        when 0
          Faker::TvShows::BojackHorseman.quote
        when 1
          Faker::TvShows::Futurama.quote
        when 2
          Faker::TvShows::TwinPeaks.quote
        when 3
          Faker::TvShows::TheOffice.quote
        when 4
          Faker::Movies::Lebowski.quote
        when 5
          Faker::Books::Dune.quote
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
    end
  end
end
