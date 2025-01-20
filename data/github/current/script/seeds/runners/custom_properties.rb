# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class CustomProperties < Seeds::Runner
      ORG_NAME = "custom-properties-org"
      REPO_NAMES = %w[chess checkers parchis backgammon carcassonne]
      LANGUAGES = %w[ruby c++ go ]

      def self.help
        <<~HELP
        Create some valid and invalid custom properties.
        Create definitions for the custom properties.
        HELP
      end

      def self.run(options = {})
        user = Seeds::Objects::User.monalisa

        repos_count = options.fetch(:repos_count, 100)

        biz_definitions = [
          {
            name: "environment",
            usages: 3,
            free_text_values: %w[production staging development],
            value_type: "string"
          },
          {
            name: "deployment_region",
            free_text_values: ["us_east_1", "eu_1", nil],
            description: Faker::Lorem.paragraph_by_chars(number: 250),
            value_type: "string"
          },
        ]
        org_definitions = [
          {
            name: "language",
            allow_values: %w[ruby python java],
            value_type: "single_select",
            required: true,
            default_value: "ruby"
          },
          {
            name: "service",
            description: Faker::Lorem.paragraph,
            free_text_values: %w[web worker cron],
            value_type: "string"
          },
          {
            name: "framework",
            allow_values: %w[rails sinatra express django flask spring koa express react vue angular],
            description: Faker::Lorem.paragraph,
            usages: 3,
            value_type: "single_select"
          },
          {
            name: "database",
            allow_values: %w[postgresql mysql mongo],
            description: Faker::Lorem.paragraph_by_chars(number: 250),
            usages: 3,
            value_type: "single_select"
          },
          {
            name: "deployment",
            description: Faker::Lorem.paragraph,
            free_text_values: %w[heroku aws gcp azure],
            value_type: "string"
          },
          {
            name: "deployment_environment",
            allow_values: %w[production staging development],
            description: Faker::Lorem.paragraph,
            value_type: "single_select"
          },
          {
            name: "deployment_cluster",
            description: Faker::Lorem.paragraph,
            value_type: "string",
            required: true,
            default_value: "default-cluster"
          },
          {
            name: "ci_enabled",
            value_type: "true_false"
          },
          {
            name: "production",
            description: Faker::Lorem.paragraph,
            value_type: "true_false",
            required: true,
            default_value: "false"
          },
          {
            name: "team",
            free_text_values: %w[frontend backend mobile design qa devops security data infrastructure support],
            value_type: "string"
          },
          {
            name: "hundreds",
            description: Faker::Lorem.paragraph,
            allow_values: (1..200).map { |i| "#{i} hundred#{i > 1 ? "s" : ""}" },
            value_type: "single_select"
          },
          {
            name: "platform",
            description: Faker::Lorem.paragraph,
            allow_values: %w[android ios web],
            value_type: "multi_select",
          },
          {
            name: "regex",
            value_type: "string",
            regex: "[0-9]+"
          },
        ]

        definitions = biz_definitions + org_definitions

        GitHub.flipper[:boolean_property_value_toggle].enable
        GitHub.flipper[:custom_properties_regex].enable
        GitHub.flipper[:repos_list_show_filter_dialog].enable
        GitHub.flipper[:custom_properties_edit_modal].enable
        GitHub.flipper[:enterprise_custom_properties].enable

        biz = create_biz(user, name: "BizPropCorp")
        biz_definitions.each do |definition|
          create_definition(biz, definition)
        end

        org = create_org(user, biz, login: ORG_NAME)
        org_definitions.each do |definition|
          create_definition(org, definition)
        end

        repos_count.times do |index|
          name = REPO_NAMES[index.modulo(REPO_NAMES.size)]
          name_index = index.div(REPO_NAMES.size)
          name = "#{name}-#{name_index}" if name_index > 0

          repo = create_repo(name, org, LANGUAGES[index.modulo(LANGUAGES.size)])
          create_repo_properties(repo, org, definition_values(definitions, index))
          puts "Created repository: #{repo.name_with_owner}"
        end

        peopleware_org = create_org(user, biz, login: "peopleware-org")
        create_definition(peopleware_org, {
          name: "team",
          allow_values: %w[black red blue],
          value_type: "single_select"
        })

        phoenix_org = create_org(user, biz, login: "phoenix-org")
        create_definition(phoenix_org, {
          name: "team",
          allow_values: %w[phoenix-project unicorn dragon tiger],
          value_type: "multi_select"
        })
      end

      def self.definition_values(definitions, seed_index)
        custom_properties = {}

        definitions.each do |definition|
          values = definition[:allow_values] || definition[:free_text_values]
          next if values.nil?

          new_value = if definition[:value_type] == "multi_select"
            # We use the last bits of the seed_index as a flag to include/exclude values
            # Thus a seed of 5 = 101b will add 1st and 3rd and exclude the 2nd
            values.select.with_index { |_, index| (seed_index & 2.pow(index)).nonzero? }
          else
            values[seed_index % values.size]
          end
          custom_properties[definition[:name]] = new_value
        end
        custom_properties
      end

      def self.create_biz(admin, name:)
        Seeds::Objects::Business.create(owner: admin, name:)
      end

      def self.create_org(admin, biz, login:)
        org = Seeds::Objects::Organization.create(login:, admin:)
        biz.add_organization(org)
        org.reload

        org
      end

      def self.create_repo(repo_name, owner, language_name)
        repo = Seeds::Objects::Repository.create(
          repo_name: repo_name,
          owner_name: owner.display_login,
          setup_master: repo_name.starts_with?("carcassonne") ? false : true,
          is_public: true
        )
        if language_name.present?
          repo.primary_language = LanguageName.lookup_by_name(language_name)
          repo.save
        end
        repo
      end

      @consumer_id = 0
      def self.create_definition(source, definition_hash)
        name = definition_hash[:name]

        definitions_manager = ::CustomProperties::Public.definitions_manager(source)

        # Ensure the definition and usages are deleted before creating it.
        # Only the seeds data are restored. User-defined data is not restored.
        prev_definition = CustomPropertyDefinition.for(source).find_by(property_name: name)
        if prev_definition
          prev_definition.usages.destroy_all
          prev_definition.delete
        end

        definitions_manager.save_definition(
          property_name: name,
          value_type: definition_hash[:value_type],
          required: definition_hash[:required] || false,
          default_value: definition_hash[:default_value],
          description: definition_hash[:description],
          allowed_values: definition_hash[:allow_values],
          regex: definition_hash[:regex]
        )

        usages = definition_hash[:usages] || 0
        usages.times.each do
          @consumer_id += 1
          definitions_manager.register_usage(:ruleset, @consumer_id, [[name, Faker::Lorem.word]])
        end
      end

      def self.create_repo_properties(repo, org, properties)
        # Ensure the properties are deleted before creating them.
        ::CustomProperties::Public.destroy_all_properties(repo)

        definitions_manager = ::CustomProperties::Public.definitions_manager(org)
        ::CustomProperties::Public.values_manager(definitions_manager).set_properties_for([repo], properties, actor: org.admin)
      end
    end
  end
end
