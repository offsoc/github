# typed: true
# frozen_string_literal: true

require_relative "../runner"

module Seeds
  class Runner
    class MemexElasticsearchBenchmark < Seeds::Runner
      RALLY_TRACK_TEMPLATE_PATH = Rails.root.join("packages", "planning", "config", "rally.json")
      DEFAULT_OUTPUT_DIRECTORY = Rails.root.join("packages", "planning", "tmp")
      DEFAULT_ITEMS = 100
      DEFAULT_PROJECTS = 1
      INDEX_FILE_NAME = "memex-index.json"
      DOCUMENTS_FILE_NAME = "memex-documents.json"
      TRACK_FILE_NAME = "memex-benchmark.json"
      RESULTS_FILE_NAME = "memex-benchmark-results.md"
      INDEX_NAME = "memex-project-items"

      def self.help
        <<~HELP
        Create sample Elasticsearch documents for memex project items
        HELP
      end

      def self.run(options = {})
        require_rally_setup!

        output_directory = options.fetch(:output_directory, DEFAULT_OUTPUT_DIRECTORY)
        num_items = options.fetch(:num_items, DEFAULT_ITEMS)
        num_projects = options.fetch(:num_projects, DEFAULT_PROJECTS)
        random_number_generator_seed = options.fetch(:seed, nil)

        index_output_path = File.join(output_directory, INDEX_FILE_NAME)
        documents_output_path = File.join(output_directory, DOCUMENTS_FILE_NAME)
        track_output_path = File.join(output_directory, TRACK_FILE_NAME)
        results_output_path = File.join(output_directory, RESULTS_FILE_NAME)
        document_count = num_items * num_projects

        self.set_random_number_seed(random_number_generator_seed)

        puts(
          "Generating benchmark data for #{num_projects} #{"project".pluralize(num_projects)} " +
          "#{"each " if num_projects > 1}containing #{num_items} #{"items".pluralize(num_items)}"
        )

        self.serialize_index(index_output_path)
        self.serialize_documents(num_items, num_projects, documents_output_path)

        documents_size = IO.popen("stat -c %s #{documents_output_path}").read.strip.to_i

        track = JSON.load(File.read(RALLY_TRACK_TEMPLATE_PATH))
        track["indices"].first["body"] = INDEX_FILE_NAME
        track["corpora"].first["documents"].first["source-file"] = DOCUMENTS_FILE_NAME
        track["corpora"].first["documents"].first["document-count"] = document_count
        track["corpora"].first["documents"].first["uncompressed-bytes"] = documents_size

        File.write(track_output_path, JSON.pretty_generate(track))

        puts("Successfully generated a new Rally track at #{track_output_path}")
        puts(
          "You can run a benchmark using that track with " +
          "`script/rally race " +
            "--distribution-version=7.17.7 " +
            "--track-path=#{track_output_path} " +
            "--report-file=#{results_output_path} " +
            "--kill-running-processes " +
            "--enable-assertions " +
            "--on-error=abort`"
        )
      end

      def self.serialize_index(output_path)
        index_name = Elastomer::Indexes::MemexProjectItems.index_name
        index = Elastomer.client.index(index_name)

        # The hashes returned by both `get_settings` and `get_mapping` only have one key but its name
        # is hard to predict, so just get the value of that key using `.first.second`.
        settings = index.get_settings.first.second
        mappings = index.get_mapping.first.second

        rally_index = {
          "settings": { "index": settings.dig("settings", "index").slice("analysis") },
          "mappings": mappings.dig("mappings", Elastomer::Adapters::MemexProjectItem.document_type),
        }

        File.write(output_path, JSON.pretty_generate(rally_index))
      end

      def self.serialize_documents(num_items, num_projects, output_path)
        File.open(output_path, "w") do |outfile|
          (1..num_projects).each do
            project = Seeds::Objects::MemexProject.create.tap do |p|
              Seeds::Objects::MemexProjectColumn.create_non_default_columns(memex_project: p)
            end

            (1..num_items).each do |n|
              context = Elastomer::Interfaces::Document::MemexProjectItem::SeedContext.new(
                memex_project_item_id: n,
                content_type: arbitrary_content_type,
                labels: labels,
                milestones: milestones,
                users: users,
                issue_types: issue_types,
              )
              document = Elastomer::Interfaces::Document::MemexProjectItem::Root
                .seed_elasticsearch_document(project, context)
                .to_hash

              bulk_api_action_and_metadata = {
                index: document.slice(:_id).merge(_index: INDEX_NAME, routing: document[:_routing])
              }
              outfile.write(bulk_api_action_and_metadata.to_json + "\n")

              bulk_api_document = document.except(:_id, :_routing, :_type)
              outfile.write(bulk_api_document.to_json + "\n")
            end
          end
        end
      end

      def self.set_random_number_seed(value)
        if value
          puts "Using seed #{value} for random number generator"
        else
          value = Random.new_seed
          puts "Assigning seed #{value} for random number generator"
        end

        srand(value)
      end

      def self.require_rally_setup!
        return if Rails.env.test?

        rally_setup_complete = IO.popen("which esrally 2>/dev/null").read.strip.present?
        unless rally_setup_complete
          puts "Incomplete Rally setup. Please first run `script/setup-rally` and then try again."
          exit 1
        end
      end

      def self.arbitrary_content_type
        case rand(1..6)
        when 1
          Elastomer::Interfaces::Document::MemexProjectItem::ContentType::DraftIssue
        when 2, 3 # Generate twice as many PRs as DraftIssues.
          Elastomer::Interfaces::Document::MemexProjectItem::ContentType::PullRequest
        else # Generate Issues half of the time.
          Elastomer::Interfaces::Document::MemexProjectItem::ContentType::Issue
        end
      end

      # GitHub::Memoizer does not support class methods, so this must be memoized manually.
      def self.users
        return @users if defined?(@users)

        @users = [
          Seeds::Objects::User.create(login: "2percentsilk"),
          Seeds::Objects::User.create(login: "cmwinters"),
          Seeds::Objects::User.create(login: "dmarcey"),
          Seeds::Objects::User.create(login: "ekroon"),
          Seeds::Objects::User.create(login: "glortho"),
          Seeds::Objects::User.create(login: "joshrowley"),
          Seeds::Objects::User.create(login: "keisaacson"),
          Seeds::Objects::User.create(login: "lerebear"),
          Seeds::Objects::User.create(login: "talune"),
        ]
      end

      # GitHub::Memoizer does not support class methods, so this must be memoized manually.
      def self.milestones
        return @milestones if defined?(@milestones)

        @milestones = [
          Seeds::Objects::Milestone.create(title: "Alpha"),
          Seeds::Objects::Milestone.create(title: "Beta"),
          Seeds::Objects::Milestone.create(title: "Gamma"),
        ]
      end

      # GitHub::Memoizer does not support class methods, so this must be memoized manually.
      def self.issue_types
        return @issue_types if defined?(@issue_types)

        @issue_types = IssueType::DEFAULTS.map do |attributes|
          Seeds::Objects::IssueType.create(**attributes)
        end
      end

      # GitHub::Memoizer does not support class methods, so this must be memoized manually.
      def self.labels
        return @labels if defined?(@labels)

        @labels = [
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
        ].map do |attributes|
          Seeds::Objects::Label.create(**attributes)
        end
      end
    end
  end
end
