# typed: false # rubocop:disable Sorbet/TrueSigil
# frozen_string_literal: true

require "api_routes"

namespace :api do
  namespace :schema do
    desc "Normalize JSON schema files"
    task :fixup do
      require "api_schema/json_file"
      Dir.glob("app/api/schemas/v3/schemas/*json").each do |path|
        file = ApiSchema::JSONFile.new(path)
        file.data["id"] = file.canonical_id

        Array(file.data["links"]).each do |link|
          link.delete("description")
        end

        next if file.normalized?

        File.open(path, "w") do |f|
          f.puts JSON.pretty_generate(file.data)
        end
      end
    end
  end

  desc "Load route files"
  task :load_files do
    SKIPPABLE_FILES = [
      %r{app/api/serializer},
      %r{app/api/access_control},
    ]
    glob = File.join(Rails.root, "app", "api", "**", "*.rb")
    Dir[glob].sort.each do |file|
      next if SKIPPABLE_FILES.any? { |s| file.match(s) }
      require file
    end
  end

  desc "Generate Endpoint Parity data"
  task :parity => [:environment, :load_files] do
    raise(StandardError, "You can only run this task in dotcom development mode") unless Rails.env.development? && !GitHub.enterprise?

    require "rubocop"
    require "parser/current"
    require "csv"

    collections = ApiRoutes::Namespaces.in(Api::App, collector: ApiRoutes::ASTRouteCollector, filter: ENV["NAMESPACE"])

    CSV($stdout) do |csv|
      csv << %w(Namespace route service_mapping audited server-to-server user-to-server AuthZ)
      collections.each do |collection|
        collection.endpoints.each do |endpoint|
          authz = endpoint.control_access_calls.map(&:verb).join(":")
          csv << [
            collection.namespace,
            endpoint.to_s,
            collection.namespace_class.service_mapping(endpoint.to_s),
            endpoint.audited?,
            endpoint.enabled_for_integrations?,
            endpoint.enabled_for_user_via_integrations?,
            authz
          ]
        end
      end
    end
  end

  desc "Generate programmatic access endpoint configuration data"
  task :programmatic_access_defs, [:output] => [:environment, :load_files] do |_task, args|
    unless (Rails.env.development? || Rails.env.test?) && !GitHub.enterprise?
      raise(StandardError, "You can only run this task in dotcom development mode")
    end

    require "rubocop"
    require "parser/current"
    require "yaml"

    collections = ApiRoutes::Namespaces.in(Api::App, collector: ApiRoutes::ASTRouteCollector, filter: ENV["NAMESPACE"])
    reason_placeholder = "TODO: Review our guide for unblocking this endpoint: https://thehub.github.com/epd/engineering/products-and-services/dotcom/apps/fine-grained-permissions/"
    access_defs = []

    collections.each do |collection|
      collection.endpoints.each do |endpoint|
        authz = endpoint.control_access_calls.map(&:verb).join(",")
        operation_ids = endpoint.operation_ids || [:missing]

        server_to_server = { "enabled" => endpoint.enabled_for_integrations? }
        server_to_server["reason"] = reason_placeholder unless server_to_server["enabled"]

        user_to_server = { "enabled" => endpoint.enabled_for_user_via_integrations? }
        user_to_server["reason"] = reason_placeholder unless user_to_server["enabled"]

        endpoint_string = "#{endpoint.verb.to_s.upcase} #{endpoint.raw_route}"

        access_defs << {
          "namespace" => collection.namespace,
          "endpoint" => endpoint_string,
          "operation_ids" => operation_ids.join(","),
          "service" => collection.namespace_class.service_mapping(endpoint.to_s).to_s,
          "access_definition" => authz,
          "server_to_server" => server_to_server,
          "user_to_server" => user_to_server
        }
      end
    end

    if args[:output]
      File.write(args[:output], access_defs.to_yaml)
    else
      puts access_defs.to_yaml
    end
  end

  desc "Update endpoint programmatic access defs"
  task :update_programmatic_access_defs, [:output] do |_task, args|
    updated_access_defs_path = "./tmp/access_defs.yaml"
    puts "Generating new definitions to #{updated_access_defs_path}" if args[:output]
    Rake::Task[:'api:programmatic_access_defs'].invoke(updated_access_defs_path)

    updated_access_defs = YAML.load_file(updated_access_defs_path)
    existing_defs = YAML.load_file(Rails.root.join("config/access_control/programmatic_access.yaml"))
    existing_defs = Hash[existing_defs.map { |h| [h["endpoint"], h] }]
    if args[:output]
      puts "Loaded existing definitions: #{existing_defs.keys.count} endpoints"
      puts "Loaded updating definitions: #{updated_access_defs.count} endpoints"
      puts "\n  ... merging definitions ...\n\n"
    end

    merged_defs = updated_access_defs.map do |updated_def|
      existing_def = existing_defs[updated_def["endpoint"]]
      permissions_placeholder = "TODO: Review our guide for adding permissions to endpoints. https://thehub.github.com/epd/engineering/products-and-services/dotcom/apps/fine-grained-permissions/add-permissions-metadata/"
      unless existing_def
        next updated_def.merge({
          "permission_sets" => [permissions_placeholder],
          "meta" => {
            "automated_tests_enabled" => true,
            "reviewed_by_team" => true
          }
        })
      end

      %w(server_to_server user_to_server).each do |access_type|
        # Copy over any attributes added to programmatic_access.yml
        existing_def[access_type].except("enabled", "reason").each do |key, value|
          updated_def[access_type][key] = value
        end

        unless updated_def[access_type]["enabled"]
          updated_def[access_type]["reason"] = existing_def[access_type]["reason"]
        end
      end

      defined_keys = %w(namespace endpoint operation_ids service access_definition server_to_server user_to_server)
      existing_def.except(*defined_keys).each do |key, value|
        updated_def[key] = value
      end

      updated_def
    end

    if args[:output]
      puts "Writing merged definitions to '#{args[:output]}'"
      File.write(args[:output], merged_defs.to_yaml)
    else
      puts merged_defs.to_yaml
    end
  end

  # Sample output is a header (listing the class name) followed by
  # the verb + endpoint. For example:
  #
  # ### Within Api::Git
  #
  #     GET /repositories/:repository_id/git
  desc "List all the API endpoints with their verbs."
  task :routes => [:environment, :load_files] do
    raise(StandardError, "You can only run this task in dotcom development mode") unless Rails.env.development? && !GitHub.enterprise?

    mode = ENV["MODE"] || "default"

    if mode == "modes" || mode == "help"
      puts <<-HELP
USAGE: [MODE=<mode>] [NAMESPACE=Api::<namespace>] bin/rake api:routes

Available modes:
  * modes             This. Show what modes are available.
  * help              This. Show what modes are available.
  * default           List available routes, grouped by API namespace.
  * audit             List available routes with additional details about GitHub Apps in markdown tables per API namespace.
  * doc-urls          List endpoints that are missing documentation URLs.
  * permissions       List endpoints by their granular permissions, formatted for developer documentation site.
  * statistics        Show summary of endpoint availability for GitHub Apps.
  * user-to-server    List of endpoints enabled for user requests via GitHub Apps, formatted for developer documentation site.
  * wip-pr            Print a template for a WIP pull request that enables endpoints in an API namespace for GitHub Apps.
  * ownership         List available routes with ownership information in csv format
      HELP
      exit 0
    end

    if mode != "default"
      # Only require these gems when we know we need rubocop and parser
      require "rubocop"
      require "parser/current"
    end

    report = ApiRoutes::DefaultReport
    case ENV["MODE"]
    when "audit"
      report = ApiRoutes::AuditReport
    when "user-to-server"
      report = ApiRoutes::UserToServerReport
    when "doc-urls"
      report = ApiRoutes::MissingDocumentationUrlsReport
    when "permissions"
      report = ApiRoutes::GranularPermissionsReport
    when "statistics"
      report = ApiRoutes::StatisticsReport
    when "ownership"
      report = ApiRoutes::OwnershipReport
    when "wip-pr"
      raise(StandardError, "Please define the NAMESPACE environment variable (e.g. Api::Repositories)") if ENV["NAMESPACE"].to_s.empty?
      report = ApiRoutes::WipPrReport
    end

    report.new(ApiRoutes::Namespaces.in(Api::App, collector: report.collector, filter: ENV["NAMESPACE"])).print
  end
end
