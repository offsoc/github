# -*- encoding: utf-8 -*-
# stub: graphql-schema_comparator 1.2.1 ruby lib

Gem::Specification.new do |s|
  s.name = "graphql-schema_comparator".freeze
  s.version = "1.2.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/xuorig/graphql-schema_comparator/issues", "changelog_uri" => "https://github.com/xuorig/graphql-schema_comparator/blob/master/CHANGELOG.md", "homepage_uri" => "https://github.com/xuorig/graphql-schema_comparator", "source_code_uri" => "https://github.com/xuorig/graphql-schema_comparator" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Marc-Andre Giroux".freeze]
  s.date = "2023-10-27"
  s.description = "GraphQL::SchemaComparator compares two GraphQL schemas given their SDL and returns a list of changes.".freeze
  s.email = ["mgiroux0@gmail.com".freeze]
  s.executables = ["graphql-schema".freeze, "schema_comparator".freeze]
  s.files = ["bin/graphql-schema".freeze, "bin/schema_comparator".freeze]
  s.homepage = "https://github.com/xuorig/graphql-schema_comparator".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Compare GraphQL schemas and get the changes that happened.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<graphql>.freeze, [">= 1.10".freeze, "< 3.0".freeze])
  s.add_runtime_dependency(%q<thor>.freeze, [">= 0.19".freeze, "< 2.0".freeze])
  s.add_runtime_dependency(%q<bundler>.freeze, [">= 1.14".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 10.0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.10".freeze])
  s.add_development_dependency(%q<pry-byebug>.freeze, ["~> 3.4".freeze])
end
