# -*- encoding: utf-8 -*-
# stub: graphql-client 0.23.0 ruby lib

Gem::Specification.new do |s|
  s.name = "graphql-client".freeze
  s.version = "0.23.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "rubygems_mfa_required" => "true" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2024-06-17"
  s.description = "A Ruby library for declaring, composing and executing GraphQL queries".freeze
  s.email = "engineering@github.com".freeze
  s.homepage = "https://github.com/github-community-projects/graphql-client".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.1.0".freeze)
  s.rubygems_version = "3.5.9".freeze
  s.summary = "GraphQL Client".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<activesupport>.freeze, [">= 3.0".freeze])
  s.add_runtime_dependency(%q<graphql>.freeze, [">= 1.13.0".freeze])
  s.add_development_dependency(%q<actionpack>.freeze, [">= 3.2.22".freeze])
  s.add_development_dependency(%q<erubi>.freeze, ["~> 1.6".freeze])
  s.add_development_dependency(%q<erubis>.freeze, ["~> 2.7".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.9".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.1.0".freeze])
  s.add_development_dependency(%q<rubocop-github>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["~> 1.64.1".freeze])
end
