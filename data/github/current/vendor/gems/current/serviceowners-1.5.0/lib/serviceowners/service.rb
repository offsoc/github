# typed: strict
# frozen_string_literal: true

require "yaml"

require "serviceowners/concerns/presence"
require "serviceowners/service_properties"
require "serviceowners/ownership"
require "serviceowners/internal/service_links"

module Serviceowners
  # A logical service forming part of the application

  # A service has a very large public method surface area which is dictated by the service catalog's
  # requirements for ownership.yaml. As a result, we can't do much about this class being so long.
  class Service
    extend T::Sig

    include ServiceProperties
    include Ownership

    NAME_MAPPINGS = T.let(
      {
        /(^|_)github(_|$)/ => "_GitHub_",
        /(^|_)info(_|$)/ => "_information_",
        /(^|_)org(_|$)/ => "_organization_",
        /(^|_)orgs(_|$)/ => "_organizations_",
        /(^|_)repo(_|$)/ => "_repository_"
      }, T::Hash[Regexp, String]
    )

    sig do
      params(name: Symbol, properties: T::Hash[Symbol, T.untyped], service_data_provider: IServiceDataProvider).void
    end
    def initialize(name, properties, service_data_provider)
      @name = name
      @properties = T.let(properties, T::Hash[Symbol, T.untyped])
      @service_data_provider = T.let(service_data_provider, IServiceDataProvider)
      @maintainers = T.let(nil, T.nilable(Team))
      @additional_review_team = T.let(nil, T.nilable(Team))
      @teams = T.let(nil, T.nilable(T::Set[Team]))
      @package_data = T.let(nil, T.nilable(T::Hash[Symbol, T.untyped]))

      validate!
    end

    sig { returns(Symbol) }
    attr_reader :name

    sig { override.returns(T::Hash[Symbol, T.untyped]) }
    attr_reader :properties

    sig { override.returns(String) }
    def human_name
      n = explicit_name
      return n unless n.nil?

      n = name.to_s
      NAME_MAPPINGS.each do |regex, replacement|
        n.gsub!(regex, replacement)
      end

      n.gsub("_", " ").split.map { |s| s == "and" ? s : s.capitalize }.join(" ")
    end

    sig { override.returns(String) }
    def qualified_name
      github_service? ? name.to_s : "github/#{name}"
    end

    sig { override.returns(IServiceDataProvider) }
    attr_reader :service_data_provider

    sig { returns(T::Boolean) }
    def github_service?
      name == :github
    end

    # Returns the package's dependencies that are also services. External dependencies
    # are included as specified in the package's YAML file.
    sig { override.returns(T::Array[String]) }
    def package_dependencies
      data = package_data
      return [] unless data

      logical_dependencies = T.let((data[:dependencies] || []), T::Array[String])

      dependencies = logical_dependencies.map do |logical_dependency|
        service = service_data_provider.service_for_package(logical_dependency)
        service&.qualified_name
      end.compact

      dependencies + package_external_dependencies
    end

    sig { returns(T::Array[T::Hash[String, T.untyped]]) }
    def to_service_links
      Internal::ServiceLinks.new(self).to_a
    end

    sig { void }
    def validate!
      maintainers
      additional_review_team
    end

    sig { params(other: Service).returns(T.nilable(Integer)).checked(:tests) }
    def <=>(other)
      name <=> other.name
    end

    private

    sig { returns(T.nilable(T::Hash[Symbol, T.untyped])) }
    def package_data
      return nil unless package

      @package_data ||= RuntimeEnv.load_yaml(File.join(package, "package.yml"))
    end

    sig { returns(T::Array[String]) }
    def package_external_dependencies
      data = package_data
      return [] unless data

      data.dig(:metadata, :external_dependencies) || data[:external_dependencies] || []
    end
  end
end
