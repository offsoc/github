# -*- encoding: utf-8 -*-
# stub: datadog_api_client 2.25.0.dev.1.r6c6cc420 ruby lib

Gem::Specification.new do |s|
  s.name = "datadog_api_client".freeze
  s.version = "2.25.0.dev.1.r6c6cc420".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/DataDog/datadog-api-client-ruby/issues", "changelog_uri" => "https://github.com/DataDog/datadog-api-client-ruby/blob/master/CHANGELOG.md", "documentation_uri" => "https://docs.datadoghq.com/api/", "homepage_uri" => "https://datadoghq.com/", "source_code_uri" => "https://github.com/DataDog/datadog-api-client-ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Datadog, Inc.".freeze]
  s.date = "2024-08-28"
  s.description = "Collection of all Datadog Public API endpoints.".freeze
  s.email = ["support@datadoghq.com".freeze]
  s.homepage = "https://github.com/DataDog/".freeze
  s.licenses = ["Apache-2.0".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.2".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Datadog API Collection Ruby Gem".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<httparty>.freeze, ["~> 0.20".freeze, ">= 0.20.0".freeze])
  s.add_runtime_dependency(%q<zeitwerk>.freeze, ["~> 2.6".freeze, ">= 2.6.0".freeze])
  s.add_runtime_dependency(%q<uuidtools>.freeze, ["~> 2.1.5".freeze, ">= 2.1.5".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.6".freeze, ">= 3.6.0".freeze])
end
