# -*- encoding: utf-8 -*-
# stub: serviceowners 1.5.0 ruby lib

Gem::Specification.new do |s|
  s.name = "serviceowners".freeze
  s.version = "1.5.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://octofactory.githubapp.com/artifactory/api/gems/serviceowners-gems-releases-local", "changelog_uri" => "https://github.com/github/serviceowners/blob/HEAD/CHANGELOG.md", "documentation_uri" => "https://github.com/github/serviceowners/blob/HEAD/README.md", "github_repo" => "git@github.com:github/serviceowners.git", "homepage_uri" => "https://github.com/github/serviceowners", "source_code_uri" => "https://github.com/github/serviceowners/tree/HEAD" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Matt Clark".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-07-19"
  s.description = "Generation and validation of serviceowner mappings and patterns for GitHub.".freeze
  s.email = ["44023+mclark@users.noreply.github.com".freeze]
  s.homepage = "https://github.com/github/serviceowners".freeze
  s.required_ruby_version = Gem::Requirement.new(">= 3.1.2".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "A library for interacting with GitHub monolith serviceowners.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<json_schema>.freeze, ["~> 0.20".freeze])
  s.add_runtime_dependency(%q<parallel>.freeze, ["~> 1.21".freeze])
  s.add_runtime_dependency(%q<parser>.freeze, ["~> 3.2".freeze])
  s.add_runtime_dependency(%q<sorbet-runtime>.freeze, ["~> 0.5".freeze])
end
