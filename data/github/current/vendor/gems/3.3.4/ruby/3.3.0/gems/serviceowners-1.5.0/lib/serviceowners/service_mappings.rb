# typed: true
# frozen_string_literal: true

require "json"
require "json_schema"

require_relative "i_service_data_provider"
require_relative "service"
require_relative "team"

module Serviceowners
  # A YAML file containing data mapping services to teams.
  class ServiceMappings
    extend T::Sig

    include IServiceDataProvider

    def initialize(mapping_data)
      validate_mapping_data(mapping_data)

      @teams = teams_from_hash(mapping_data[:teams])
      @review_groups = review_groups_from_hash(mapping_data[:review_groups])

      @services = T.let({}, T::Hash[Symbol, Service])
      build_services_from_hash(mapping_data[:services])

      @execs = mapping_data[:orgs].transform_values { |h| h[:exec] }
    end

    ORG_DEFAULT_KEY = "default"

    sig { returns(T::Array[Service]) }
    def services
      @services.values
    end

    def team_for(name)
      @teams[name.to_sym]
    end

    def review_group_for(name)
      @review_groups[name.to_sym]
    end

    def review_group_names
      @review_groups.keys
    end

    sig { params(name: StringSym).returns(T.nilable(Service)) }
    def service_for(name)
      @services[name.to_sym]
    end

    sig { override.params(org_name: StringSym).returns(String) }
    def exec_for(org_name)
      T.must(@execs[org_name.to_sym])
    end

    sig { override.params(package_name: String).returns(T.nilable(Service)) }
    def service_for_package(package_name)
      services.detect { |service| service.package == package_name }
    end

    def validate!
      services.each(&:validate!)
      validate_unused_orgs!
      validate_unused_teams!
      validate_package_assignments!
      true
    end

    def inspect
      "<ServiceMappings instance>"
    end

    private

    def validate_unused_orgs!
      unused_org = @execs.keys.map(&:to_s).detect do |org|
        org != ORG_DEFAULT_KEY && @teams.values.none? { |team| team.org_name == org }
      end
      raise Error, "Unused org '#{unused_org}'" unless unused_org.nil?
    end

    def validate_unused_teams!
      unused_team = @teams.values.detect do |team|
        services.none? { |service| service.teams.include?(team) } &&
          !@review_groups.values.include?(team)
      end
      raise Error, "Unused team '#{unused_team.name}'" unless unused_team.nil?
    end

    def validate_package_assignments!
      packages = Set.new

      services.each do |s|
        package = s.package
        next if package.nil?
        raise Error, "Package '#{package}' is assigned to multiple services." if packages.include?(package)

        packages << package
      end
    end

    def teams_from_hash(hash)
      hash.each_with_object({}) do |(name, properties), h|
        h[name] = Team.new(name, properties)
      end
    end

    def build_services_from_hash(hash)
      hash.each do |name, properties|
        @services[name] = Service.new(name, properties, self)
      end
    end

    def review_groups_from_hash(hash)
      return {} unless hash

      hash.each_with_object({}) do |(name, properties), h|
        team = team_for(properties[:team])
        raise Error, "Unknown team for review group '#{name}': '#{properties[:team]}'" unless team

        h[name] = team
      end
    end

    # Internal: validates the structure of the mapping data itself.
    def validate_mapping_data(mapping_data)
      schema_data = File.read("#{File.dirname(__FILE__)}/service-mappings-schema.json")
      schema_json = JSON.parse(schema_data)
      schema = JsonSchema.parse!(schema_json)

      # convert to JSON and back so its string keyed. This is a quick hacky workaround.
      # Please replace if the performance offends you.
      data = JSON.parse(mapping_data.to_json)

      schema.validate!(data)

      mapping_data.each_key { |k| assert_order(mapping_data[k]) }
    rescue JsonSchema::Error => e
      raise Error, "Error validating the schema for service mappings:\n#{e.message}"
    end

    def assert_order(hash)
      return if hash.nil?

      actual_order = hash.keys
      actual_order.shift if actual_order.first == :github # we want github to be first

      expected_order = actual_order.sort

      return if expected_order == actual_order

      expected_order.zip(actual_order).detect do |(expected, actual)|
        if expected != actual
          raise Error, "Expected #{expected} before #{actual}! Please make sure your keys are in alphabetical order!"
        end
      end
    end
  end
end
